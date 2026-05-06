export type Role = 'admin' | 'member'
export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: Role
  joined_at: string
  profiles?: Profile
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  created_by: string
  due_date: string | null
  created_at: string
  updated_at: string
  profiles?: Profile | null
  assigned_profile?: Profile | null
}

export interface ProjectWithMembers extends Project {
  project_members: ProjectMember[]
  tasks?: Task[]
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  overdueTasks: number
  totalProjects: number
}
