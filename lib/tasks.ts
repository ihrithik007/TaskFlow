import { connectToDatabase } from "./mongodb"
import { Task } from "@/models/task"

export async function getUserTasks(userId: string) {
  await connectToDatabase()

  const tasks = await Task.find({
    $or: [{ assignedTo: userId }, { createdBy: userId }],
  })
    .populate("assignedTo", "name email image")
    .populate("createdBy", "name email image")
    .sort({ updatedAt: -1 })

  return JSON.parse(JSON.stringify(tasks))
}

export async function getTaskById(taskId: string) {
  await connectToDatabase()

  const task = await Task.findById(taskId)
    .populate("assignedTo", "name email image")
    .populate("createdBy", "name email image")

  if (!task) return null

  return JSON.parse(JSON.stringify(task))
}
