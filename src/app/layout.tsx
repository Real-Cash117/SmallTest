import type { Metadata } from "next";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import "./globals.css";
import { TRPCReactProvider } from '~/trpc/react';
import { AuthProvider } from '~/components/AuthProvider';
import { Notifications } from '@mantine/notifications';

export const metadata: Metadata = {
  title: "Ranking App - Rate Items 1-10",
  description: "A Next.js app for rating and ranking items from 1 to 10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <TRPCReactProvider>
            <MantineProvider>
              <Notifications position="top-right" />
              {children}
            </MantineProvider>
          </TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}