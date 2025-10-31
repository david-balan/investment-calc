// FILE 2: app/api/calculations/route.ts
// ==========================================
// This is your API that saves to the database
// Location: app/api/calculations/route.ts

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM calculations 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, parameters, results } = body;

    const { rows } = await sql`
      INSERT INTO calculations (type, parameters, results, created_at)
      VALUES (${type}, ${JSON.stringify(parameters)}, ${JSON.stringify(results)}, NOW())
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 });
  }
}