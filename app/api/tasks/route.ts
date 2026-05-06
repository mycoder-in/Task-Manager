import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTaskSchema } from '@/lib/validations'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  const status = searchParams.get('status')
  const assignedTo = searchParams.get('assigned_to')

  let query = supabase
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
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo)
  }

  const { data: tasks, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validation = createTaskSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
  }

  const { project_id, title, description, status, priority, assigned_to, due_date } = validation.data

  // Verify user is a member of the project
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', project_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not a member of this project' }, { status: 403 })
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      created_by: user.id,
    })
    .select(`
      *,
      profiles:assigned_to (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(task, { status: 201 })
}
