export type TaskStatus = "todo" | "in-progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Attachment {
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  image?: string
  role?: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  assignedTo?: User
  createdBy: User
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}
