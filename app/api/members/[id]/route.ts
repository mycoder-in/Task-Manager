import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateMemberRoleSchema } from '@/lib/validations'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the member to find project_id
  const { data: targetMember } = await supabase
    .from('project_members')
    .select('project_id, user_id')
    .eq('id', id)
    .single()

  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Check if current user is admin
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', targetMember.project_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can update member roles' }, { status: 403 })
  }

  // Prevent changing own role
  if (targetMember.user_id === user.id) {
    return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 })
  }

  const body = await request.json()
  const validation = updateMemberRoleSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
  }

  const { data: member, error } = await supabase
    .from('project_members')
    .update({ role: validation.data.role })
    .eq('id', id)
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

  return NextResponse.json(member)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the member to find project_id
  const { data: targetMember } = await supabase
    .from('project_members')
    .select('project_id, user_id')
    .eq('id', id)
    .single()

  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Check if current user is admin
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', targetMember.project_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
  }

  // Prevent removing self
  if (targetMember.user_id === user.id) {
    return NextResponse.json({ error: 'You cannot remove yourself from the project' }, { status: 400 })
  }

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
