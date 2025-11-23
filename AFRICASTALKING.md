# Africa's Talking Integration Guide

This guide details how to integrate **Africa's Talking (AT)** for SMS and USSD services in AskDokita.

## Prerequisites
1.  **Africa's Talking Account**: Sign up at [africastalking.com](https://africastalking.com/).
2.  **API Key & Username**: Generate these in your AT dashboard (use `sandbox` for testing).
3.  **Python SDK**: `pip install africastalking`

## 1. SMS Integration

Sending SMS via Africa's Talking is cheaper and more reliable in African regions.

### Code Pattern
```python
import africastalking

# Initialize SDK
username = "sandbox"  # or your production username
api_key = "YOUR_API_KEY"
africastalking.initialize(username, api_key)
sms = africastalking.SMS

def send_sms(phone_number, message):
    try:
        # That's it. We can verify the response if we want
        response = sms.send(message, [phone_number])
        print(response)
    except Exception as e:
        print(f"Error sending SMS: {e}")
```

### Incoming SMS (Webhook)
Set your callback URL in the AT dashboard to `https://your-domain.com/sms/at`.

```python
@app.post("/sms/at")
async def incoming_sms_at(request: Request):
    form_data = await request.form()
    text = form_data.get("text")
    sender = form_data.get("from")
    
    # Process message with Gemini...
    # ...
    
    # Send reply
    send_sms(sender, "Response from AskDokita...")
    return {"status": "success"}
```

## 2. USSD Integration

USSD is session-based and works on basic feature phones without internet.

### Code Pattern
USSD requests are synchronous `POST` requests. You must return a plain text response starting with:
*   `CON`: Continue session (show menu/input).
*   `END`: End session (show final message).

```python
@app.post("/ussd")
async def ussd_callback(request: Request):
    form_data = await request.form()
    session_id = form_data.get("sessionId")
    service_code = form_data.get("serviceCode")
    phone_number = form_data.get("phoneNumber")
    text = form_data.get("text", "")  # User input chain: "1*2*..."

    response = ""

    if text == "":
        # First request: Show Main Menu
        response = "CON Welcome to AskDokita\n"
        response += "1. Ask a Health Question\n"
        response += "2. About Us"
    
    elif text == "1":
        response = "CON Enter your question:"
        
    elif text.startswith("1*"):
        # User entered a question
        question = text.split("*")[1]
        # Call Gemini API here...
        ai_answer = "Malaria symptoms include fever..." 
        response = f"END {ai_answer}"
        
    elif text == "2":
        response = "END AskDokita provides verified health info."
        
    else:
        response = "END Invalid option."

    return PlainTextResponse(response)
```

### Testing USSD
Use the **Africa's Talking Simulator** in the sandbox dashboard to test your USSD flows visually.
