import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ success: false, error: 'Use a verified game session to submit a result.' }, { status: 410 });
}
