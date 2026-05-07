import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const backendRes = await fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Safely parse the response - backend might return non-JSON on errors
    let data: any;
    const contentType = backendRes.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await backendRes.json();
    } else {
      const text = await backendRes.text();
      data = { message: text || "Registration failed" };
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Registration failed" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[Register API Error]", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
