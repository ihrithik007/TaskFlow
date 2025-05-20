import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import TaskForm from "@/components/task-form"
import DashboardHeader from "@/components/dashboard-header"

export default async function NewTaskPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Create New Task</h1>
        <TaskForm userId={session.user.id} />
      </main>
    </div>
  )
}
