export const metadata = {
  title: "CBT Notokusumo",
  description: "CBT Notokusumo for better experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="relative min-h-screen bg-white text-black overflow-hidden"
        suppressHydrationWarning
      >
        <main className="flex items-center justify-center min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
