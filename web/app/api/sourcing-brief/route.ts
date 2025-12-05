/**
 * Sourcing Brief API Endpoint
 * 
 * Handles submission of sourcing brief requests.
 * Phase 1 MVP: Basic validation and storage
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SourcingBriefState } from '@/lib/types/sourcingBrief';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.productName || !body.email) {
      return NextResponse.json(
        { error: 'Product name and email are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // TODO: Save to database (Prisma)
    // TODO: Send confirmation email
    // TODO: Create lead in CRM
    
    // For now, just log and return success
    console.log('Sourcing Brief Submitted:', {
      productName: body.productName,
      quantity: body.quantity,
      email: body.email,
      name: body.name,
      company: body.company,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Request received. We\'ll send you a quote within 24–48 hours.',
    });
  } catch (error) {
    console.error('Error submitting sourcing brief:', error);
    return NextResponse.json(
      { error: 'A server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

