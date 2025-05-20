import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Task } from "@/models/task"
import { io } from "@/lib/socket-server"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const assignedTo = searchParams.get("assignedTo")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    await connectToDatabase()

    // Build query based on user role and filters
    const query: any = {}

    if (session.user.role !== "admin") {
      // Regular users can only see tasks assigned to them or created by them
      query.$or = [{ assignedTo: session.user.id }, { createdBy: session.user.id }]
    }

    if (status) query.status = status
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo

    const skip = (page - 1) * limit

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Task.countDocuments(query)

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Session user:", session.user);
    const body = await request.json();
    console.log("Request body:", body);

    const { title, description, dueDate, priority, status, assignedTo } = body;

    // Validate input
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    try {
      await connectToDatabase()
    } catch (dbError) {
      console.error("MongoDB connection error:", dbError);
      return NextResponse.json({ 
        error: "Database connection failed", 
        details: dbError instanceof Error ? dbError.message : String(dbError) 
      }, { status: 500 });
    }

    try {
      const task = await Task.create({
        title,
        description,
        dueDate,
        priority: priority || "medium",
        status: status || "todo",
        assignedTo: assignedTo || null,
        createdBy: session.user.id,
        attachments: [],
      })
      
      console.log("Task created:", task._id.toString());

      let populatedTask;
      try {
        populatedTask = await Task.findById(task._id)
          .populate("assignedTo", "name email")
          .populate("createdBy", "name email")
      } catch (populateError) {
        console.error("Error populating task:", populateError);
        // Continue anyway, just return the unpopulated task
        populatedTask = task;
      }

      // Emit socket event for real-time updates if socket is available
      try {
        if (io) {
          io.emit("task:created", populatedTask)
    
          // If task is assigned to someone, send notification
          if (assignedTo) {
            io.to(assignedTo).emit("notification", {
              type: "task_assigned",
              message: `You have been assigned a new task: ${title}`,
              taskId: task._id,
            })
          }
        } else {
          console.log("Socket.io not initialized - skipping real-time updates");
        }
      } catch (socketError) {
        console.error("Socket.io error (non-critical):", socketError);
        // Continue anyway - socket issues shouldn't prevent task creation
      }

      return NextResponse.json(populatedTask, { status: 201 })
    } catch (createError) {
      console.error("Error creating task in database:", createError);
      return NextResponse.json({ 
        error: "Database operation failed", 
        details: createError instanceof Error ? createError.message : String(createError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
