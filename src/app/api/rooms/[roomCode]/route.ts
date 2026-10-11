import { roomRequest } from '@/lib/server/rooms';
export async function GET(req: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  return roomRequest(req, (await params).roomCode, 'get');
}
