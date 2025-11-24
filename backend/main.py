import os
import json
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Request, Form, UploadFile, File, Response
from fastapi.responses import StreamingResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
import redis.asyncio as redis
import chromadb
from chromadb.config import Settings
from twilio.twiml.messaging_response import MessagingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import africastalking

load_dotenv()

# --- Configuration ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
AFRICASTALKING_USERNAME = os.getenv("AFRICASTALKING_USERNAME", "sandbox")
AFRICASTALKING_API_KEY = os.getenv("AFRICASTALKING_API_KEY")
CHROMA_DB_DIR = "./chroma_db"

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# --- Initialize Clients ---
client = genai.Client(api_key=GOOGLE_API_KEY)
redis_client = redis.from_url(REDIS_URL, decode_responses=True)
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
collection = chroma_client.get_or_create_collection(name="health_docs")

if AFRICASTALKING_API_KEY:
    africastalking.initialize(AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY)
    sms = africastalking.SMS

# --- FastAPI Setup ---
app = FastAPI(title="AskDokita API", description="AI-powered health information chatbot")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

# --- Helper Functions ---

async def get_session_history(session_id: str) -> List[types.Content]:
    history_json = await redis_client.get(f"chat:{session_id}")
    if history_json:
        try:
            history_data = json.loads(history_json)
            contents = []
            for item in history_data:
                contents.append(types.Content(
                    role=item["role"],
                    parts=[types.Part(text=item["parts"][0]["text"])]
                ))
            return contents
        except Exception as e:
            print(f"Error parsing history: {e}")
            return []
    return []

async def save_session_history(session_id: str, history: List[types.Content]):
    history_data = []
    for content in history:
        history_data.append({
            "role": content.role,
            "parts": [{"text": part.text} for part in content.parts]
        })
    await redis_client.set(f"chat:{session_id}", json.dumps(history_data), ex=3600)

def query_chroma_sync(query_text: str, n_results: int = 3) -> List[str]:
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    if results and results['documents']:
        return results['documents'][0]
    return []

async def query_chroma_async(query_text: str) -> str:
    try:
        documents = await run_in_threadpool(query_chroma_sync, query_text)
        if documents:
            return "\n\n".join(documents)
        return ""
    except Exception as e:
        print(f"ChromaDB Error: {e}")
        return ""

# --- Tools ---
def retrieve_health_info(query: str):
    return query_chroma_sync(query)

tools_config = [
    types.Tool(google_search=types.GoogleSearch()),
]

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to AskDokita API (Native Gemini + Redis)"}

@app.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, chat_req: ChatRequest):
    try:
        history = await get_session_history(chat_req.session_id)
        
        response_stream = await client.aio.models.generate_content_stream(
            model='gemini-2.5-flash-lite',
            contents=history + [types.Content(role="user", parts=[types.Part(text=chat_req.message)])],
            config=types.GenerateContentConfig(
                tools=tools_config,
                system_instruction=(
                    "You are AskDokita, an advanced AI health assistant. "
                    "Provide the most accurate, up-to-date, and grounded medical information available. "
                    "Always source your facts from trusted global health organizations (WHO, Africa CDC) and ensure data is current. "
                    "Be stern, professional, and direct. Prioritize factual accuracy above all else."
                )
            )
        )

        async def stream_generator():
            full_response_text = ""
            grounding_metadata = None
            
            async for chunk in response_stream:
                if chunk.text:
                    full_response_text += chunk.text
                    yield json.dumps({"text": chunk.text}) + "\n"
                
                if chunk.candidates and chunk.candidates[0].grounding_metadata:
                     grounding_metadata = chunk.candidates[0].grounding_metadata

            new_history = history + [
                types.Content(role="user", parts=[types.Part(text=chat_req.message)]),
                types.Content(role="model", parts=[types.Part(text=full_response_text)])
            ]
            await save_session_history(chat_req.session_id, new_history)
            
            if grounding_metadata:
                 yield json.dumps({"grounding": True}) + "\n"

        return StreamingResponse(stream_generator(), media_type="application/x-ndjson")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sms")
@limiter.limit("10/minute")
async def sms_reply(request: Request, Body: str = Form(...), From: str = Form(...)):
    try:
        session_id = From
        history = await get_session_history(session_id)

        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=history + [types.Content(role="user", parts=[types.Part(text=Body)])],
            config=types.GenerateContentConfig(
                tools=tools_config,
                system_instruction=(
                    "You are AskDokita. Provide strictly grounded and up-to-date health facts. "
                    "Ensure accuracy. Keep response under 160 chars. Be professional."
                )
            )
        )

        new_history = history + [
            types.Content(role="user", parts=[types.Part(text=Body)]),
            types.Content(role="model", parts=[types.Part(text=response.text)])
        ]
        await save_session_history(session_id, new_history)

        twiml = MessagingResponse()
        twiml.message(response.text)
        
        return Response(content=str(twiml), media_type="application/xml")
    except Exception as e:
        twiml = MessagingResponse()
        twiml.message(f"Error: {str(e)}")
        return Response(content=str(twiml), media_type="application/xml")

@app.post("/ussd")
@limiter.limit("10/minute")
async def ussd_callback(request: Request):
    form_data = await request.form()
    session_id = form_data.get("sessionId")
    service_code = form_data.get("serviceCode")
    phone_number = form_data.get("phoneNumber")
    text = form_data.get("text", "")

    response = ""

    if text == "":
        response = "CON Welcome to AskDokita\n"
        response += "1. Ask a Health Question\n"
        response += "2. About Us"
    
    elif text == "1":
        response = "CON Enter your question:"
        
    elif text.startswith("1*"):
        question = text.split("*")[1]
        try:
            ai_response = client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=[types.Content(role="user", parts=[types.Part(text=question)])],
                config=types.GenerateContentConfig(
                    system_instruction="Strictly grounded health facts. Up-to-date info only. Max 140 chars."
                )
            )
            response = f"END {ai_response.text}"
        except Exception:
            response = "END Error processing request."
        
    elif text == "2":
        response = "END AskDokita provides verified health info."
        
    else:
        response = "END Invalid option."

    return PlainTextResponse(response)

@app.post("/sms/at")
@limiter.limit("10/minute")
async def incoming_sms_at(request: Request):
    form_data = await request.form()
    text = form_data.get("text")
    sender = form_data.get("from")
    
    if not text or not sender:
        return {"error": "Missing data"}

    try:
        # Generate AI Response
        ai_response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=[types.Content(role="user", parts=[types.Part(text=text)])],
            config=types.GenerateContentConfig(
                system_instruction="Strictly grounded, up-to-date health facts. Concise for SMS."
            )
        )
        
        # Send Reply via Africa's Talking
        if AFRICASTALKING_API_KEY:
            try:
                sms.send(ai_response.text, [sender])
            except Exception as e:
                print(f"AT SMS Error: {e}")

        return {"status": "success"}
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "error"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
