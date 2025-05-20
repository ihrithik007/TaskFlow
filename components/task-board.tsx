"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSocket } from "./socket-provider"
import { useToast } from "@/hooks/use-toast"
import TaskCard from "./task-card"
import TaskFilter from "./task-filter"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Task, TaskStatus } from "@/types/task"

interface TaskBoardProps {
  initialTasks: Task[]
  userId: string
}

const STATUSES: TaskStatus[] = ["todo", "in-progress", "completed"]

export default function TaskBoard({ initialTasks, userId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  })
  const { socket } = useSocket()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!socket) return

    // Listen for real-time task updates
    socket.on("task:created", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask])
      toast({
        title: "New Task Created",
        description: `"${newTask.title}" has been added`,
      })
    })

    socket.on("task:updated", (updatedTask) => {
      setTasks((prevTasks) => prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
    })

    socket.on("task:deleted", (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))
      toast({
        title: "Task Deleted",
        description: "A task has been removed",
      })
    })

    return () => {
      socket.off("task:created")
      socket.off("task:updated")
      socket.off("task:deleted")
    }
  }, [socket, toast])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    fetchFilteredTasks(newFilters)
  }

  const fetchFilteredTasks = async (filterParams: any) => {
    try {
      const queryParams = new URLSearchParams()
      if (filterParams.status) queryParams.append("status", filterParams.status)
      if (filterParams.priority) queryParams.append("priority", filterParams.priority)
      if (filterParams.assignedTo) queryParams.append("assignedTo", filterParams.assignedTo)

      const response = await fetch(`/api/tasks?${queryParams.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch tasks")

      const data = await response.json()
      setTasks(data.tasks)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TaskFilter onFilterChange={handleFilterChange} />
        <Button onClick={() => router.push("/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUSES.map((status) => (
          <div key={status} className="space-y-4">
            <h2 className="font-semibold text-lg capitalize">
              {status.replace("-", " ")}
              <span className="ml-2 text-muted-foreground">({getTasksByStatus(status).length})</span>
            </h2>
            <div className="bg-muted/40 p-4 rounded-lg min-h-[300px]">
              {getTasksByStatus(status).length === 0 ? (
                <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No tasks</div>
              ) : (
                <div className="space-y-3">
                  {getTasksByStatus(status).map((task) => (
                    <TaskCard key={task._id} task={task} currentUserId={userId} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
