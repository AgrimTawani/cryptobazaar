import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
    // You will add your workflow ID here
    const WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID || "YOUR_WORKFLOW_ID";

    if (!DIDIT_API_KEY) {
      return NextResponse.json(
        { error: 'DIDIT_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DIDIT_API_KEY,
      },
      body: JSON.stringify({
        vendor_data: `user_${Date.now()}`,
        workflow_id: WORKFLOW_ID,
        features: "ocr,face_match",
        callback_url: "http://localhost:3000/signup/bank-statement"
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create Didit session');
    }

    return NextResponse.json({ 
      sessionUrl: data.session_url || data.url || null,
      debug: data 
    });
  } catch (error: any) {
    console.error('Didit session error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
