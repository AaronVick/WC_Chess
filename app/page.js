export default function Home() {
  return (
    <>
      <head>
        <title>Chess Frame Game</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:post_url" content="https://wc-chess.vercel.app/api/frame" />
        <meta property="fc:frame:image" content="https://wc-chess.vercel.app/api/image" />
        <meta property="fc:frame:button:1" content="Make Move" />
        <meta property="fc:frame:button:2" content="New Game" />
        <meta property="fc:frame:button:3" content="Show Legal Moves" />
        <meta property="fc:frame:input:text" content="Enter move (e.g., e4, Nf3)" />
      </head>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">Chess Frame Game</h1>
        <p className="text-lg mb-4">Play chess against an AI opponent on Farcaster!</p>
        <p className="text-md text-gray-600">Share this URL on Farcaster to start playing.</p>
      </div>
    </>
  );
}