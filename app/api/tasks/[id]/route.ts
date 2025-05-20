import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Task } from "@/models/task"
import { io } from "@/lib/socket-server"
import mongoose from "mongoose"

// Helper function to check if a string is a valid ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    await connectToDatabase()

    const task = await Task.findById(id)
      .populate("assignedTo", "name email image")
      .populate("createdBy", "name email image")

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has permission to view this task
    if (
      session.user.role !== "admin" &&
      task.createdBy._id.toString() !== session.user.id &&
      (!task.assignedTo || task.assignedTo._id.toString() !== session.user.id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, status, priority, dueDate, assignedTo } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if task exists and user has permission
    const existingTask = await Task.findById(id)

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has permission to update this task
    if (
      session.user.role !== "admin" &&
      existingTask.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
      },
      { new: true }
    )
      .populate("assignedTo", "name email image")
      .populate("createdBy", "name email image")

    // Emit socket event for real-time updates
    try {
      if (io) {
        io.emit("task:updated", updatedTask)
      } else {
        console.log("Socket.io not initialized - skipping real-time update")
      }
    } catch (socketError) {
      console.error("Socket.io error (non-critical):", socketError)
      // Continue anyway - socket issues shouldn't prevent task updates
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if task exists and user has permission
    const existingTask = await Task.findById(id)

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has permission to delete this task
    if (
      session.user.role !== "admin" &&
      existingTask.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete task
    await Task.findByIdAndDelete(id)

    // Emit socket event for real-time updates
    try {
      if (io) {
        io.emit("task:deleted", id)
      } else {
        console.log("Socket.io not initialized - skipping real-time delete notification")
      }
    } catch (socketError) {
      console.error("Socket.io error (non-critical):", socketError)
      // Continue anyway - socket issues shouldn't prevent task deletion
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}
