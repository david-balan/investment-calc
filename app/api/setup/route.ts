// ==========================================
// FILE 3: app/api/setup/route.ts  
// ==========================================
// This stays the same - no changes needed

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS calculations (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        parameters JSONB NOT NULL,
        results JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_calculations_created_at 
      ON calculations(created_at DESC)
    `;

    return NextResponse.json({ 
      success: true,
      message: '✅ Database table created successfully!' 
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create table',
      details: error 
    }, { status: 500 });
  }
}