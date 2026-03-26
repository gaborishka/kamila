import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kamila AI — Your Relentless Refund Advocate",
  description:
    "AI calls customer support for you. Reads their Terms of Service, finds legal loopholes, and fights for your refund.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
