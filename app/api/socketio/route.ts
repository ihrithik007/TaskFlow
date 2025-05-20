import { NextRequest, NextResponse } from "next/server"
import { getIO } from "@/lib/socket-server"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const io = getIO();
    if (!io) {
      return NextResponse.json({ error: "Socket.IO not initialized" }, { status: 500 });
    }
    
    // This endpoint serves as a target for Socket.io polling
    return new NextResponse("Socket.io endpoint is running", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Socket.io API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const io = getIO();
    if (!io) {
      return NextResponse.json({ error: "Socket.IO not initialized" }, { status: 500 });
    }
    
    // This endpoint serves as a target for Socket.io polling
    return new NextResponse("Socket.io endpoint is running", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Socket.io API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 