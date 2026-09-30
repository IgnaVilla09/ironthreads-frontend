import { NextRequest } from 'next/server';
import { proxyChatRequest } from '@/lib/chat-proxy';

export async function POST(request: NextRequest) {
  return proxyChatRequest('POST', '/message', await request.text());
}
