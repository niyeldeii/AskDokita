# AskDokita – AI-Powered Health Information Assistant

**AskDokita** is an AI-driven health information platform designed to help people in rural and underserved communities access accurate, reliable, and easy-to-understand health guidance. The project provides a simple chat-based interface—available online and offline via SMS—to ensure that individuals with limited resources can get trustworthy health information anytime.

## Problem Statement
Millions of people in rural areas struggle to access basic health knowledge due to:
*   **Poor internet connectivity**
*   **Limited availability of health workers**
*   **Language barriers**
*   **Low digital literacy**
*   **Reliance on unverified health rumours**

This lack of accessible information leads to preventable illness, delayed care, and poor health outcomes.

## Solution
AskDokita is designed as a multi-channel AI health chatbot that provides verified responses to common health questions such as:
*   *"What are the symptoms of malaria?"*
*   *"How can I prevent cholera?"*
*   *"How do I treat dehydration in a child?"*

The chatbot retrieves information from trusted health sources (like WHO, Africa CDC, and national health agencies) and uses **Gemini 2.5 Flash-Lite** combined with **Retrieval-Augmented Generation (RAG)** and **Google Search Grounding** to ensure accurate and grounded answers.

## Key Features
*   **Reliable Answers**: Uses verified health datasets and guidelines.
*   **AI + Search**: Combines **Gemini API** with **Google Search Grounding** for up-to-date facts.
*   **Internet-Free Access**: **SMS Integration (Twilio)** allows users with basic phones to chat without data.
*   **Local Languages**: Designed to support English, Pidgin, and Yoruba (English currently implemented).
*   **Simple UI**: A clean, responsive **Next.js** web interface for smartphone users.

## Technology Stack
*   **Backend**: Python, FastAPI
*   **Frontend**: Next.js, React, Tailwind CSS
*   **AI Layer**: Google Gemini 2.5 Flash-Lite (Native API)
*   **Orchestration**: Native Function Calling & Structured Outputs
*   **Storage**: Redis (Session Memory) & ChromaDB (Vector Knowledge Base)
*   **SMS**: Twilio (TwiML)

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis Server
- Google API Key

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
Create a `.env` file:
```
GOOGLE_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
```

### 4. Twilio Setup (SMS)
To enable SMS for low-internet areas:
1.  Get a Twilio phone number.
2.  Set the **Messaging Webhook** to `POST https://your-url.com/sms`.
3.  The backend returns TwiML to handle the conversation.

### 5. Local Testing with Ngrok
To test the SMS functionality or access the app from other devices while running locally:

1.  **Install Ngrok**: Download from [ngrok.com](https://ngrok.com/).
2.  **Expose Backend**:
    ```bash
    ngrok http 8000
    ```
3.  **Update Twilio**: Copy the `https` URL (e.g., `https://a1b2.ngrok-free.app`) and update your Twilio Messaging Webhook to:
    *   `https://a1b2.ngrok-free.app/sms`
4.  **Test**: Send an SMS to your Twilio number. It will hit your local backend!

*Optional: To test the Frontend remotely:*
1.  Expose Frontend: `ngrok http 3000`
2.  Update `frontend/app/page.tsx` to point to your Ngrok backend URL instead of `localhost:8000`.
