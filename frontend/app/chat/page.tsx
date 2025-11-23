"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface Message {
    role: "user" | "model";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("askdokita_history");
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("askdokita_history", JSON.stringify(messages));
        }
    }, [messages, isLoaded]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNewChat = () => {
        if (confirm("Start a new chat? This will clear your current history.")) {
            setMessages([]);
            localStorage.removeItem("askdokita_history");
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    session_id: "web-user",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const botMessage: Message = { role: "model", content: "" };
            setMessages((prev) => [...prev, botMessage]);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.text) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage.role === "model") {
                                        lastMessage.content += data.text;
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing chunk:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                role: "model",
                content: "Sorry, I encountered an error. Please try again later.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-20 backdrop-blur-sm bg-white/90">
                <div className="flex items-center space-x-3">
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity group">
                        <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all">
                            AD
                        </div>
                        <h1 className="text-lg font-bold text-gray-800 tracking-tight">AskDokita</h1>
                    </Link>
                </div>
                <nav className="flex items-center space-x-4">
                    <button
                        onClick={handleNewChat}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all flex items-center space-x-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>New Chat</span>
                    </button>
                    <Link href="/#about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        About
                    </Link>
                </nav>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
                {!isLoaded ? (
                    <div className="flex justify-center items-center h-full text-gray-400 animate-pulse">Loading history...</div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-2 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </div>
                        <div className="text-center max-w-md space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">Hello! I'm AskDokita.</h2>
                            <p className="text-gray-600 leading-relaxed">
                                I can help you with verified health information. Ask me about symptoms, diseases, or general wellness tips.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                            <button
                                onClick={() => setInput("What are the symptoms of malaria?")}
                                className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-teal-300 hover:shadow-md hover:text-teal-700 transition-all text-left"
                            >
                                "What are the symptoms of malaria?"
                            </button>
                            <button
                                onClick={() => setInput("How can I prevent cholera?")}
                                className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-teal-300 hover:shadow-md hover:text-teal-700 transition-all text-left"
                            >
                                "How can I prevent cholera?"
                            </button>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`flex max-w-[90%] md:max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-3`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mt-1 ${msg.role === "user" ? "bg-gray-800 text-white" : "bg-teal-600 text-white"
                                    }`}>
                                    {msg.role === "user" ? "U" : "AD"}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`p-4 rounded-2xl shadow-sm leading-relaxed text-[15px] ${msg.role === "user"
                                            ? "bg-gray-800 text-white rounded-tr-none"
                                            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                                        }`}
                                >
                                    <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : "prose-teal"} prose-p:my-1 prose-ul:my-1 prose-li:my-0`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start w-full animate-in fade-in duration-300">
                        <div className="flex max-w-[80%] flex-row gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-1">
                                AD
                            </div>
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </main>

            {/* Input Area */}
            <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 md:p-6">
                <div className="max-w-4xl mx-auto relative shadow-sm rounded-2xl bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a health question..."
                        className="w-full p-4 pr-14 bg-transparent border-none focus:ring-0 resize-none h-[60px] max-h-[150px] text-gray-800 placeholder-gray-400 text-base"
                        rows={1}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                    AskDokita provides information, not medical advice. In emergencies, see a doctor.
                </p>
            </footer>
        </div>
    );
}
