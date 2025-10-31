
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await sql`
      SELECT * FROM calculations 
      WHERE user_id = ${session.user.email}
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
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, parameters, results } = body;

    const { rows } = await sql`
      INSERT INTO calculations (type, parameters, results, user_id, created_at)
      VALUES (${type}, ${JSON.stringify(parameters)}, ${JSON.stringify(results)}, ${session.user.email}, NOW())
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 });
  }
}