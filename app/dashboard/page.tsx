import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import TaskBoard from "@/components/task-board"
import { getUserTasks } from "@/lib/tasks"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const tasks = await getUserTasks(session.user.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
        <TaskBoard initialTasks={tasks} userId={session.user.id} />
      </main>
    </div>
  )
}
