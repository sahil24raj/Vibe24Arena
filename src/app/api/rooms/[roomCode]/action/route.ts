import { roomRequest } from '@/lib/server/rooms';
export async function POST(req: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  return roomRequest(req, (await params).roomCode, 'action');
}
