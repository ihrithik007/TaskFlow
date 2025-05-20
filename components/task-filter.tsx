"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TaskFilterProps {
  onFilterChange: (filters: any) => void
}

export default function TaskFilter({ onFilterChange }: TaskFilterProps) {
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    // Fetch users for the assignee filter (for admins only)
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  const handleFilterChange = () => {
    onFilterChange({
      status,
      priority,
      assignedTo,
    })
  }

  const clearFilters = () => {
    setStatus("")
    setPriority("")
    setAssignedTo("")
    onFilterChange({
      status: "",
      priority: "",
      assignedTo: "",
    })
  }

  useEffect(() => {
    handleFilterChange()
  }, [status, priority, assignedTo])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      {users.length > 0 && (
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user._id} value={user._id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {(status || priority || assignedTo) && (
        <Button variant="ghost" size="icon" onClick={clearFilters} className="h-9 w-9">
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  )
}
