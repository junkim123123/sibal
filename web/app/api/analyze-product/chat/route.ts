import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleAiChat } from '@/lib/ai/conversationalCopilot';
import { SourcingConversationState } from '@/lib/ai/conversationalCopilot';

const ChatRequestSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  currentState: z.any(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = ChatRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid input.',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { history, currentState } = result.data;

    const response = await handleAiChat(history, currentState as SourcingConversationState);

    return NextResponse.json(response, { status: 200 });

  } catch (err) {
    console.error('[ChatAPI] Unexpected server error', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Something went wrong while processing the chat.',
      },
      { status: 500 }
    );
  }
}