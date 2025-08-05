import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Email creation functionality not implemented yet' 
    },
    { status: 501 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Email listing functionality not implemented yet' 
    },
    { status: 501 }
  );
} 