import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Task } from "@/models/task"
import { io } from "@/lib/socket-server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Define allowed file types and max size (5MB)
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const task = await Task.findById(params.id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has permission to update this task
    if (
      session.user.role !== "admin" &&
      task.createdBy.toString() !== session.user.id &&
      (!task.assignedTo || task.assignedTo.toString() !== session.user.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the limit (5MB)" }, { status: 400 })
    }

    // Create unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    // Write file to disk
    const filePath = path.join(uploadDir, fileName)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, fileBuffer)

    // Add attachment to task
    const attachment = {
      fileName: file.name,
      filePath: `/uploads/${fileName}`,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: session.user.id,
      uploadedAt: new Date(),
    }

    task.attachments.push(attachment)
    await task.save()

    const updatedTask = await Task.findById(params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Emit socket event for real-time updates
    io.emit("task:updated", updatedTask)

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error("Error uploading attachment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
