"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { FileIcon, Paperclip, Upload } from "lucide-react"
import type { Task } from "@/types/task"

interface TaskAttachmentsProps {
  task: Task
  currentUserId: string
}

export default function TaskAttachments({ task, currentUserId }: TaskAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`/api/tasks/${task._id}/attachments`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload file")
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      })

      setSelectedFile(null)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return (
        <img
          src={task.attachments.find((a) => a.fileType === fileType)?.filePath || "/placeholder.svg"}
          alt="Preview"
          className="h-10 w-10 object-cover rounded"
        />
      )
    }
    return <FileIcon className="h-10 w-10" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Check if user can upload attachments
  const canUpload = currentUserId === task.createdBy._id || (task.assignedTo && currentUserId === task.assignedTo._id)

  return (
    <div className="space-y-6">
      {canUpload && (
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload Attachment</Label>
            <div className="flex gap-2">
              <Input id="file" type="file" onChange={handleFileChange} disabled={isUploading} />
              <Button type="submit" disabled={!selectedFile || isUploading}>
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Max file size: 5MB. Allowed file types: Images, PDFs, Documents, Text files.
            </p>
          </div>
        </form>
      )}

      {task.attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Paperclip className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="font-medium">No attachments yet</h3>
          <p className="text-muted-foreground">
            {canUpload ? "Upload files related to this task" : "This task has no attachments"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {task.attachments.map((attachment, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(attachment.fileType)}
                <div>
                  <p className="font-medium">{attachment.fileName}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>•</span>
                    <span>{format(new Date(attachment.uploadedAt), "PPp")}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={attachment.filePath} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
