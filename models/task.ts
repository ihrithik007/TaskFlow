import mongoose, { Schema, type Document } from "mongoose"

export interface IAttachment {
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  uploadedBy: mongoose.Types.ObjectId
  uploadedAt: Date
}

export interface ITask extends Document {
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: Date
  assignedTo?: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  attachments: IAttachment[]
  createdAt: Date
  updatedAt: Date
}

const AttachmentSchema = new Schema<IAttachment>({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, default: Date.now },
})

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [AttachmentSchema],
  },
  { timestamps: true },
)

export const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)
