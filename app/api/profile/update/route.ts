import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/user";

// Define the session type for TypeScript
interface SessionUser {
  name?: string;
  email?: string;
  image?: string;
  id?: string;
}

interface Session {
  user?: SessionUser;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    // Check if session exists and has user
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // First try to find user by email
    const userEmail = session.user.email;
    
    // Update user in database by email
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      {
        name,
        ...(image && { image }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 