/**
 * Save and Resume API for Sourcing Brief
 * 
 * Generates a magic link token to resume the sourcing brief later
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { SourcingBriefState } from '@/lib/types/sourcingBrief';

const RESUME_DIR = join(process.cwd(), 'tmp', 'sourcing-brief-resume');
const TOKEN_EXPIRY_HOURS = 168; // 7 days

// Ensure resume directory exists
async function ensureResumeDir() {
  if (!existsSync(RESUME_DIR)) {
    await mkdir(RESUME_DIR, { recursive: true });
  }
}

interface ResumeData {
  state: SourcingBriefState;
  createdAt: string;
  expiresAt: string;
}

export async function POST(request: NextRequest) {
  try {
    await ensureResumeDir();
    
    const body = await request.json();
    const { state, email } = body;
    
    if (!state || !email) {
      return NextResponse.json(
        { error: 'State and email are required.' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    const resumeData: ResumeData = {
      state,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Save resume data
    const filepath = join(RESUME_DIR, `${token}.json`);
    await writeFile(filepath, JSON.stringify(resumeData, null, 2));

    // TODO: Send email with magic link
    // For now, return the token (in production, send email instead)
    const resumeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sourcing-brief?resume=${token}`;

    console.log('[SaveResume] Generated resume token:', token, 'for email:', email);

    return NextResponse.json({
      success: true,
      token,
      resumeUrl,
      expiresAt: expiresAt.toISOString(),
      message: 'We\'ve sent you a resume link via email.',
    });
  } catch (error) {
    console.error('Error saving resume state:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureResumeDir();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required.' },
        { status: 400 }
      );
    }

    const filepath = join(RESUME_DIR, `${token}.json`);
    
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: 'Saved session not found.' },
        { status: 404 }
      );
    }

    const { readFile } = await import('fs/promises');
    const fileContent = await readFile(filepath, 'utf-8');
    const resumeData: ResumeData = JSON.parse(fileContent);

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(resumeData.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Saved session has expired.' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      state: resumeData.state,
    });
  } catch (error) {
    console.error('Error loading resume state:', error);
    return NextResponse.json(
      { error: 'An error occurred while loading the session.' },
      { status: 500 }
    );
  }
}

