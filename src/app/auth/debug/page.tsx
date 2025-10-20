'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Container, Card, Text, Stack, Button, Code, Group, Badge } from '@mantine/core';

export default function AuthDebug() {
  const { data: session, status } = useSession();

  return (
    <Container size="sm" mt={50}>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="xl" fw={700}>
            Authentication Debug
          </Text>
          
          <div>
            <Text fw={500} mb="xs">Status:</Text>
            <Badge color={
              status === 'authenticated' ? 'green' : 
              status === 'loading' ? 'yellow' : 'red'
            }>
              {status}
            </Badge>
          </div>

          <div>
            <Text fw={500} mb="xs">Session Data:</Text>
            <Code block style={{ maxHeight: '300px', overflow: 'auto' }}>
              {session ? JSON.stringify(session, null, 2) : 'No session data'}
            </Code>
          </div>

          <Group>
            {status === 'unauthenticated' ? (
              <Button onClick={() => signIn('google')}>
                Sign In with Google
              </Button>
            ) : (
              <Button color="red" onClick={() => signOut()}>
                Sign Out
              </Button>
            )}
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
              Go to Admin
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </Group>

          {session?.user && (
            <div>
              <Text fw={500} mb="xs">User Info:</Text>
              <Text size="sm">Name: {session.user.name}</Text>
              <Text size="sm">Email: {session.user.email}</Text>
              <Text size="sm">Role: {session.user.role || 'Not set'}</Text>
              <Text size="sm">ID: {session.user.id || 'Not available'}</Text>
            </div>
          )}
        </Stack>
      </Card>
    </Container>
  );
}