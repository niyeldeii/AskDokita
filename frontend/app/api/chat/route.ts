import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

        const response = await fetch(`${backendUrl}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Backend error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        // Forward the streaming response
        return new Response(response.body, {
            headers: {
                "Content-Type": "application/x-ndjson",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
