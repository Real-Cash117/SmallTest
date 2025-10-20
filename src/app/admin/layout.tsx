'use client';

import { SessionProvider } from 'next-auth/react';
import { MantineProvider } from '@mantine/core';
import { ReactNode } from 'react';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <MantineProvider>
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}