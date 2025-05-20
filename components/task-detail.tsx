"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import TaskAttachments from "./task-attachments"
import { Calendar, Clock, Edit, Trash, User } from "lucide-react"
import type { Task } from "@/types/task"

interface TaskDetailProps {
  task: Task
  currentUserId: string
}

export default function TaskDetail({ task, currentUserId }: TaskDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-slate-500 text-white"
      case "in-progress":
        return "bg-blue-500 text-white"
      case "completed":
        return "bg-green-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete task")

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const canEdit = currentUserId === task.createdBy._id || (task.assignedTo && currentUserId === task.assignedTo._id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ").toUpperCase()}</Badge>
            <Badge className={getPriorityColor(task.priority)}>{task.priority.toUpperCase()} PRIORITY</Badge>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/tasks/${task._id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attachments">Attachments ({task.attachments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              {task.description ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{task.description}</p>
                </div>
              ) : (
                <div className="text-muted-foreground">No description provided</div>
              )}
            </TabsContent>
            <TabsContent value="attachments" className="mt-4">
              <TaskAttachments task={task} currentUserId={currentUserId} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {format(new Date(task.dueDate), "PPP")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Created: {format(new Date(task.createdAt), "PPP")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Updated: {format(new Date(task.updatedAt), "PPP")}</span>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Created by</h4>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.createdBy.image || ""} alt={task.createdBy.name} />
                    <AvatarFallback>
                      {task.createdBy.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{task.createdBy.name}</p>
                    <p className="text-xs text-muted-foreground">{task.createdBy.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Assigned to</h4>
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignedTo.image || ""} alt={task.assignedTo.name} />
                      <AvatarFallback>
                        {task.assignedTo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{task.assignedTo.name}</p>
                      <p className="text-xs text-muted-foreground">{task.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Unassigned
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
