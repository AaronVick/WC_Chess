import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();

  // Handle Farcaster frame requests
  if (url.pathname === '/') {
    url.searchParams.set('og:image', 'https://wc-chess.vercel.app/api/image');
    url.searchParams.set('og:title', 'Play Chess on Farcaster!');
    url.searchParams.set('og:description', 'Enjoy chess directly within Farcaster Frames!');
  }

  const response = NextResponse.rewrite(url);

  // Add CORS headers for frame requests
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
