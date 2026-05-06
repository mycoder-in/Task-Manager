import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addMemberSchema } from '@/lib/validations'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const { data: members, error } = await supabase
    .from('project_members')
    .select(`
      *,
      profiles (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('project_id', projectId)
    .order('joined_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(members)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validation = addMemberSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
  }

  const { project_id, email, role } = validation.data

  // Check if user is admin of the project
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', project_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 })
  }

  // Find the user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found. They need to sign up first.' }, { status: 404 })
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', project_id)
    .eq('user_id', profile.id)
    .single()

  if (existingMember) {
    return NextResponse.json({ error: 'User is already a member of this project' }, { status: 400 })
  }

  // Add the member
  const { data: member, error } = await supabase
    .from('project_members')
    .insert({
      project_id,
      user_id: profile.id,
      role,
    })
    .select(`
      *,
      profiles (
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

  return NextResponse.json(member, { status: 201 })
}
