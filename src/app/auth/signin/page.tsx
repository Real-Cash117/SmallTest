'use client';

import { useSession, signIn } from 'next-auth/react';
import {
  Container,
  Card,
  Title,
  Text,
  Button,
  Stack,
  ThemeIcon,
  Group,
  MantineProvider,
} from '@mantine/core';
import { IconShieldCheck, IconBrandGoogle } from '@tabler/icons-react';

export default function AdminSignIn() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <MantineProvider>
        <Container size="sm" mt={100}>
          <Text align="center">Loading...</Text>
        </Container>
      </MantineProvider>
    );
  }

  if (session) {
    if (session.user.role !== 'ADMIN') {
      return (
        <MantineProvider>
          <Container size="sm" mt={100}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack align="center">
                <ThemeIcon size={60} radius="md" color="red">
                  <IconShieldCheck size={30} />
                </ThemeIcon>
                <Title order={2}>Access Denied</Title>
                <Text color="dimmed" align="center">
                  You don't have administrator privileges. Please contact an admin to upgrade your account.
                </Text>
                <Text size="sm" color="dimmed">
                  Signed in as: {session.user.email}
                </Text>
              </Stack>
            </Card>
          </Container>
        </MantineProvider>
      );
    }

    // Redirect to admin dashboard if already authenticated as admin
    window.location.href = '/admin';
    return null;
  }

  return (
    <MantineProvider>
      <Container size="sm" mt={100}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Stack align="center" spacing="md">
            <ThemeIcon size={80} radius="md" color="blue">
              <IconShieldCheck size={40} />
            </ThemeIcon>
            
            <Title order={2} align="center">
              Admin Access Required
            </Title>
            
            <Text color="dimmed" align="center">
              Sign in with your administrator account to access the dashboard.
            </Text>

            <Button
              leftIcon={<IconBrandGoogle size={18} />}
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              size="lg"
              fullWidth
              mt="md"
            >
              Sign in with Google
            </Button>

            <Text size="xs" color="dimmed" align="center" mt="sm">
              Only accounts with administrator privileges can access this area.
            </Text>
          </Stack>
        </Card>
      </Container>
    </MantineProvider>
  );
}