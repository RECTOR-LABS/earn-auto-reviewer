import { NextResponse } from 'next/server';

const APP_VERSION = '0.1.0';

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
