// app/api/tables/[id]/connect-google-sheet/route.js
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables/${id}/connect-google-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect Google Sheet');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error connecting Google Sheet:', error);
    return NextResponse.json(
      { error: 'Failed to connect Google Sheet' },
      { status: 500 }
    );
  }
}

// app/api/tables/[id]/sync-google-sheet/route.js
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables/${id}/sync-google-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync Google Sheet');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error syncing Google Sheet:', error);
    return NextResponse.json(
      { error: 'Failed to sync Google Sheet' },
      { status: 500 }
    );
  }
}

// app/api/tables/[id]/data/route.js
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables/${id}/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update table data');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating table data:', error);
    return NextResponse.json(
      { error: 'Failed to update table data' },
      { status: 500 }
    );
  }
}