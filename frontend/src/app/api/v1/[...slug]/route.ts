import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return proxyRequest(request, params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return proxyRequest(request, params);
}

async function proxyRequest(request: NextRequest, params: Promise<{ slug: string[] }>) {
  const path = (await params).slug.join("/");
  const backendUrl = `http://127.0.0.1:8000/api/v1/${path}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const url = searchParams ? `${backendUrl}?${searchParams}` : backendUrl;

  try {
    const body = request.method === "POST" ? await request.json() : undefined;

    const response = await fetch(url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
