import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getTaskById } from "@/lib/tasks"
import DashboardHeader from "@/components/dashboard-header"
import TaskForm from "@/components/task-form"

export default async function EditTaskPage({
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

  // Check if user has permission to edit this task
  const isAdmin = session.user.role === "admin"
  const isCreator = task.createdBy._id === session.user.id

  if (!isAdmin && !isCreator) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Task</h1>
        <TaskForm userId={session.user.id} task={task} />
      </main>
    </div>
  )
}
