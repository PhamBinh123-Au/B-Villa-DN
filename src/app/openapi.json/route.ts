import { NextResponse } from 'next/server';
import openApiSpec from '../../../public/openapi.json';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
