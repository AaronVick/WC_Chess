export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-8">Chess Frame Game</h1>
        <p className="mb-4">Play chess against an AI opponent on Farcaster!</p>
        <p className="text-sm text-gray-600">
          Cast this frame to start a new game.
        </p>
      </div>
    </main>
  );
}