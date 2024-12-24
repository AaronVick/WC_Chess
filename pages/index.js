// File: pages/index.js
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default async function Index() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if the request is from a Farcaster client
  const isFarcaster = userAgent.includes('Farcaster') || 
                     headersList.get('fc-user-agent') || 
                     headersList.get('farcaster-user-agent');

  if (!isFarcaster) {
    // If not a Farcaster client, redirect to the main app page
    redirect('/app/page');
  }

  // If it is a Farcaster client, redirect to the frame endpoint
  redirect('/api/frame');
}