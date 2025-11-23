"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface Message {
    role: "user" | "model";
    content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
}

export default function ChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load sessions from LocalStorage on mount
    useEffect(() => {
        const savedSessions = localStorage.getItem("askdokita_sessions");
        if (savedSessions) {
            try {
                const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
                setSessions(parsedSessions);
                if (parsedSessions.length > 0) {
                    // Load the most recent session by default
                    setCurrentSessionId(parsedSessions[0].id);
                } else {
                    createNewSession();
                }
            } catch (e) {
                console.error("Failed to parse chat sessions", e);
                createNewSession();
            }
        } else {
            createNewSession();
        }
        setIsLoaded(true);
    }, []);

    // Save sessions to LocalStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("askdokita_sessions", JSON.stringify(sessions));
        }
    }, [sessions, isLoaded]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sessions, currentSessionId]);

    const createNewSession = () => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: "New Chat",
            messages: [],
            createdAt: Date.now(),
        };
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const deleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this chat?")) {
            const newSessions = sessions.filter((s) => s.id !== id);
            setSessions(newSessions);
            if (currentSessionId === id) {
                if (newSessions.length > 0) {
                    setCurrentSessionId(newSessions[0].id);
                } else {
                    createNewSession();
                }
            }
        }
    };

    const getCurrentSession = () => {
        return sessions.find((s) => s.id === currentSessionId) || sessions[0];
    };

    const updateCurrentSessionMessages = (newMessages: Message[]) => {
        setSessions((prev) =>
            prev.map((session) => {
                if (session.id === currentSessionId) {
                    // Auto-update title if it's the first user message and title is "New Chat"
                    let title = session.title;
                    if (session.messages.length === 0 && newMessages.length > 0 && session.title === "New Chat") {
                        title = newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? "..." : "");
                    }
                    return { ...session, messages: newMessages, title };
                }
                return session;
            })
        );
    };

    const sendMessage = async () => {
        if (!input.trim() || !currentSessionId) return;

        const userMessage: Message = { role: "user", content: input };
        const currentMessages = getCurrentSession()?.messages || [];
        const updatedMessages = [...currentMessages, userMessage];

        updateCurrentSessionMessages(updatedMessages);
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
                    session_id: currentSessionId, // Use the persistent session ID
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const botMessage: Message = { role: "model", content: "" };
            // Optimistically add bot message container
            updateCurrentSessionMessages([...updatedMessages, botMessage]);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            let accumulatedBotResponse = "";

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
                                accumulatedBotResponse += data.text;
                                // Update the last message (bot message) with new content
                                setSessions((prev) =>
                                    prev.map((session) => {
                                        if (session.id === currentSessionId) {
                                            const msgs = [...session.messages];
                                            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: accumulatedBotResponse };
                                            return { ...session, messages: msgs };
                                        }
                                        return session;
                                    })
                                );
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
            updateCurrentSessionMessages([...updatedMessages, errorMessage]);
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

    const currentSession = getCurrentSession();

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:relative z-40 w-72 h-full bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            AD
                        </div>
                        <span className="font-bold text-lg tracking-tight">AskDokita</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4">
                    <button
                        onClick={createNewSession}
                        className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-teal-900/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span className="font-medium">New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                    <div className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</div>
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => {
                                setCurrentSessionId(session.id);
                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                            }}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentSessionId === session.id ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                                }`}
                        >
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                <span className="truncate text-sm font-medium">{session.title}</span>
                            </div>
                            <button
                                onClick={(e) => deleteSession(e, session.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/#about" className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <span className="text-sm font-medium">About AskDokita</span>
                    </Link>
                </div>
            </aside>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <span className="font-bold text-gray-800">AskDokita</span>
                    </div>
                    <button onClick={createNewSession} className="text-teal-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </header>

                {/* Chat Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-white md:bg-gray-50">
                    {!isLoaded ? (
                        <div className="flex justify-center items-center h-full text-gray-400 animate-pulse">Loading history...</div>
                    ) : !currentSession || currentSession.messages.length === 0 ? (
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
                        currentSession.messages.map((msg, index) => (
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
        </div>
    );
}
