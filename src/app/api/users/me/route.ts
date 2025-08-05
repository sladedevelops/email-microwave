import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'User profile functionality not implemented yet' 
    },
    { status: 501 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'User update functionality not implemented yet' 
    },
    { status: 501 }
  );
} 