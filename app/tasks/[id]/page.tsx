import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { getTaskById } from "@/lib/tasks"
import DashboardHeader from "@/components/dashboard-header"
import TaskDetail from "@/components/task-detail"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const task = await getTaskById(params.id)

  if (!task) {
    notFound()
  }

  // Check if user has permission to view this task
  const isAdmin = session.user.role === "admin"
  const isCreator = task.createdBy._id === session.user.id
  const isAssignee = task.assignedTo && task.assignedTo._id === session.user.id

  if (!isAdmin && !isCreator && !isAssignee) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <TaskDetail task={task} currentUserId={session.user.id} />
      </main>
    </div>
  )
}
