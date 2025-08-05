import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Login functionality not implemented yet' 
    },
    { status: 501 }
  );
} 