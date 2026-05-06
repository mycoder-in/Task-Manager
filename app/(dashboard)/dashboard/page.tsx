import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all projects user is member of
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        id,
        user_id,
        role
      ),
      tasks (
        id,
        status,
        due_date
      )
    `)
    .order('updated_at', { ascending: false })

  // Get tasks assigned to user
  const { data: myTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      profiles:assigned_to (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('assigned_to', user?.id)
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(10)

  // Calculate stats
  const allTasks = projects?.flatMap(p => p.tasks || []) || []
  const now = new Date()
  
  const stats = {
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
    todoTasks: allTasks.filter(t => t.status === 'todo').length,
    overdueTasks: allTasks.filter(t => 
      t.status !== 'completed' && 
      t.due_date && 
      new Date(t.due_date) < now
    ).length,
    totalProjects: projects?.length || 0,
  }

  return (
    <DashboardContent 
      stats={stats} 
      projects={projects || []} 
      myTasks={myTasks || []} 
    />
  )
}
