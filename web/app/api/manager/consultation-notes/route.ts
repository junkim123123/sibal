/**
 * Consultation Notes API
 * 
 * Manager가 상담 일지를 저장하고 조회하는 API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

// GET: 상담 일지 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: 'Missing project_id' },
        { status: 400 }
      );
    }

    // Manager 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Manager 권한 확인
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_manager, role')
      .eq('id', user.id)
      .single();

    const isManager = profile?.is_manager === true;
    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';

    if (!isManager && !hasAdminRole) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager access required' },
        { status: 403 }
      );
    }

    // 프로젝트 확인
    const { data: project } = await adminClient
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

    // 매니저가 할당된 프로젝트인지 확인
    if (project.manager_id !== user.id && !hasAdminRole) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not assigned to this project' },
        { status: 403 }
      );
    }

    // 상담 일지 조회
    const { data: notes, error: notesError } = await adminClient
      .from('consultation_notes')
      .select('*, profiles!consultation_notes_manager_id_fkey(name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (notesError) {
      console.error('[Consultation Notes API] Failed to load notes:', notesError);
      return NextResponse.json(
        { ok: false, error: 'Failed to load notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      notes: notes || [],
    });
  } catch (error) {
    console.error('[Consultation Notes API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST: 상담 일지 저장
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project_id, manager_id, content } = body;

    if (!project_id || !manager_id || !content) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: project_id, manager_id, content' },
        { status: 400 }
      );
    }

    // Manager 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 요청한 manager_id와 현재 사용자가 일치하는지 확인
    if (manager_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager ID mismatch' },
        { status: 403 }
      );
    }

    // Manager 권한 확인
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_manager, role')
      .eq('id', user.id)
      .single();

    const isManager = profile?.is_manager === true;
    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';

    if (!isManager && !hasAdminRole) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager access required' },
        { status: 403 }
      );
    }

    // 프로젝트 확인
    const { data: project } = await adminClient
      .from('projects')
      .select('manager_id')
      .eq('id', project_id)
      .single();

    if (!project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 매니저가 할당된 프로젝트인지 확인
    if (project.manager_id !== user.id && !hasAdminRole) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not assigned to this project' },
        { status: 403 }
      );
    }

    // 상담 일지 저장
    const { data: note, error: insertError } = await adminClient
      .from('consultation_notes')
      .insert({
        project_id,
        manager_id,
        content: content.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Consultation Notes API] Failed to save note:', insertError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save note' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      note: {
        id: note.id,
        project_id: note.project_id,
        manager_id: note.manager_id,
        content: note.content,
        created_at: note.created_at,
      },
    });
  } catch (error) {
    console.error('[Consultation Notes API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

