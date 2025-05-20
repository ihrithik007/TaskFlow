"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, MoreVertical, Paperclip, Trash } from "lucide-react"
import type { Task } from "@/types/task"

interface TaskCardProps {
  task: Task
  currentUserId: string
}

export default function TaskCard({ task, currentUserId }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
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
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Link href={`/tasks/${task._id}`} className="hover:underline">
            <CardTitle className="text-base">{task.title}</CardTitle>
          </Link>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/tasks/${task._id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm">
        {task.description && <p className="text-muted-foreground mb-2">{task.description}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          {task.dueDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MM/dd/yyyy')}
            </Badge>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {task.attachments.length}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={task.assignedTo.image || undefined} 
                alt={task.assignedTo.name || "User"} 
              />
              <AvatarFallback className="text-xs">
                {task.assignedTo.name
                  ? task.assignedTo.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Badge variant="outline" className="text-xs">
              Unassigned
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
        </span>
      </CardFooter>
    </Card>
  )
}
