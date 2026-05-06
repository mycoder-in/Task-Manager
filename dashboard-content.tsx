'use client'

import Link from 'next/link'
import { format, isPast, isToday } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  ListTodo,
  Plus,
  ArrowRight,
} from 'lucide-react'
import type { DashboardStats, Task, ProjectWithMembers } from '@/lib/types'

interface DashboardContentProps {
  stats: DashboardStats
  projects: ProjectWithMembers[]
  myTasks: Task[]
}

const statusColors = {
  todo: 'bg-secondary text-secondary-foreground',
  in_progress: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
}

const priorityColors = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-red-500/10 text-red-500',
}

export function DashboardContent({ stats, projects, myTasks }: DashboardContentProps) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your projects and tasks
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalProjects} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTasks > 0
                ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate`
                : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/tasks">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No tasks assigned to you</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.slice(0, 5).map((task) => {
                  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed'
                  const isDueToday = task.due_date && isToday(new Date(task.due_date))
                  
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={statusColors[task.status]}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary" className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      {task.due_date && (
                        <div className={`text-xs ${isOverdue ? 'text-red-500' : isDueToday ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                          {isOverdue ? 'Overdue: ' : isDueToday ? 'Due today' : 'Due: '}
                          {!isDueToday && format(new Date(task.due_date), 'MMM d')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Your recent projects</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/projects">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No projects yet</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/projects">Create your first project</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => {
                  const taskCount = project.tasks?.length || 0
                  const completedCount = project.tasks?.filter(t => t.status === 'completed').length || 0
                  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium">{progress}%</p>
                        <p className="text-xs text-muted-foreground">
                          {completedCount}/{taskCount} tasks
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
