export const metadata = {
    title: 'Chess Frame Game',
    description: 'Play chess against an AI opponent on Farcaster',
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="og:image" content={`${process.env.NEXT_PUBLIC_HOST}/api/image`} />
          <meta property="fc:frame:image" content={`${process.env.NEXT_PUBLIC_HOST}/api/image`} />
        </head>
        <body>{children}</body>
      </html>
    );
  }