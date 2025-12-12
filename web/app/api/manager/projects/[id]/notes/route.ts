/**
 * Manager Project Notes API
 * 
 * Internal notes management for projects
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/manager/projects/[id]/notes
 * Get internal notes for a project
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is manager or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'manager' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden - Manager access required' },
        { status: 403 }
      );
    }

    const projectId = params.id;

    // Get project with internal_notes
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, internal_notes, manager_id')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('[Manager Notes] Failed to load project:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to load project' },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify manager has access to this project
    if (project.manager_id !== user.id && profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json(
        { ok: false, error: 'Forbidden - Not assigned to this project' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      notes: {
        internal_notes: project.internal_notes || '',
      },
    });
  } catch (error) {
    console.error('[Manager Notes] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/manager/projects/[id]/notes
 * Update internal notes for a project
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is manager or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'manager' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden - Manager access required' },
        { status: 403 }
      );
    }

    const projectId = params.id;
    const body = await req.json();
    const { internal_notes } = body;

    // Verify manager has access to this project
    const { data: project } = await supabase
      .from('projects')
      .select('manager_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.manager_id !== user.id && profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json(
        { ok: false, error: 'Forbidden - Not assigned to this project' },
        { status: 403 }
      );
    }

    // Update internal notes
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        internal_notes: internal_notes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('[Manager Notes] Failed to update notes:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Notes saved successfully',
    });
  } catch (error) {
    console.error('[Manager Notes] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

