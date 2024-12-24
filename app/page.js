import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if the request is from a Farcaster client
  const isFarcaster = userAgent.includes('Farcaster') || 
                     headersList.get('fc-user-agent') || 
                     headersList.get('farcaster-user-agent');

  if (isFarcaster) {
    redirect('/api/frame');
  }

  // Regular web view
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Chess Frame Game</h1>
      <p className="text-lg mb-4">Play chess against an AI opponent on Farcaster!</p>
      <p className="text-md text-gray-600">Share this URL on Farcaster to start playing.</p>
    </div>
  );
}