'use client'

import useSWR from 'swr'
import { format, isPast, isToday } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ListTodo, Calendar } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import type { Task, TaskStatus } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors = {
  todo: 'bg-secondary text-secondary-foreground',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
}

const priorityColors = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function TasksPage() {
  const { data: tasks, error, isLoading, mutate } = useSWR<Task[]>('/api/tasks', fetcher)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-destructive">
          Failed to load tasks. Please try again.
        </div>
      </div>
    )
  }

  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks?.filter(t => t.status === statusFilter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            All tasks across your projects
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!filteredTasks || filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListTodo className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center">
              {statusFilter === 'all'
                ? 'You have no tasks assigned to you yet.'
                : `No ${statusFilter.replace('_', ' ')} tasks.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed'
            const isDueToday = task.due_date && isToday(new Date(task.due_date))

            return (
              <Card key={task.id} className="hover:bg-accent/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/projects/${task.project_id}`}
                        className="font-medium hover:underline truncate block"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Select
                          value={task.status}
                          onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                        >
                          <SelectTrigger className={`w-[130px] h-7 text-xs ${statusColors[task.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant="outline" className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <Badge
                            variant="outline"
                            className={isOverdue ? 'text-red-500 border-red-500/20' : isDueToday ? 'text-yellow-500 border-yellow-500/20' : ''}
                          >
                            <Calendar className="mr-1 h-3 w-3" />
                            {isOverdue ? 'Overdue: ' : isDueToday ? 'Today' : ''}
                            {!isDueToday && format(new Date(task.due_date), 'MMM d')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
