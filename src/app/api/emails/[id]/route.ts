import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Email detail functionality not implemented yet' 
    },
    { status: 501 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Email deletion functionality not implemented yet' 
    },
    { status: 501 }
  );
} 