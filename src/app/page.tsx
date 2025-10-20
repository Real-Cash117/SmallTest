'use client';

import { useMemo, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Badge,
  Rating,
  Button,
  Stack,
  Group,
  Progress,
  Paper,
  Avatar,
  ActionIcon,
  Divider,
  Center,
  Box,
  SegmentedControl,
  Loader,
} from '@mantine/core';
import { IconTrophy, IconMedal, IconAward, IconStar } from '@tabler/icons-react';
import { api } from '~/trpc/react';
import { notifications } from '@mantine/notifications';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = api.category.getAll.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryId = selectedCategory ?? categories?.[0]?.id ?? '';
  const { data: items, isLoading: itemsLoading } = api.rankingItem.getByCategory.useQuery(
    { categoryId },
    { enabled: !!categoryId }
  );
  const rateItem = api.rankingItem.rate.useMutation();
  const utils = api.useUtils();
  const { data: session } = useSession();
  
  const onRate = (itemId: string, value: number) => {
    if (!session) {
      notifications.show({
        color: 'blue',
        title: 'Sign in required',
        message: 'Please sign in to rate items.',
      });
      void signIn(undefined, { callbackUrl: window.location.href });
      return;
    }

    rateItem.mutate(
      { itemId, rating: value },
      {
        onSuccess: () => void utils.rankingItem.getByCategory.invalidate({ categoryId }),
        onError: (error) =>
          notifications.show({
            color: 'red',
            title: 'Rating failed',
            message: error.message ?? 'Unable to submit rating.',
          }),
      },
    );
  };

  const rankedItems = useMemo(
    () =>
      (items ?? []).slice().sort((a, b) => b.averageRating - a.averageRating || a.order - b.order),
    [items]
  );

  const averageRating =
    rankedItems.reduce((sum, item) => sum + item.averageRating, 0) / (rankedItems.length || 1);
  const ratedCount = rankedItems.filter((item) => item.totalRatings > 0).length;

  if (categoriesLoading || itemsLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="flex-end" mb="md">
        {session ? (
          <Button variant="light" onClick={() => void signOut({ callbackUrl: '/' })}>
            Sign out
          </Button>
        ) : (
          <Button variant="light" onClick={() => void signIn(undefined, { callbackUrl: '/' })}>
            Sign in
          </Button>
        )}
      </Group>
      <Center mb="xl">
        <Stack align="center" gap="md">
          <Title order={1} size="h1" ta="center" c="blue">
            🌟 Interactive Ranking App
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Rate items on a 1–10 scale and watch the leaderboard update instantly.
          </Text>
        </Stack>
      </Center>

      {categories && categories.length > 0 && (
        <SegmentedControl
          value={categoryId}
          onChange={(value) => setSelectedCategory(value)}
          data={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          fullWidth
          mb="xl"
        />
      )}

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                  Average Rating
                </Text>
                <Text fw={700} size="xl">
                  {averageRating.toFixed(1)}
                </Text>
              </div>
              <IconStar size={32} color="var(--mantine-color-yellow-6)" />
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                  Items Rated
                </Text>
                <Text fw={700} size="xl">
                  {ratedCount}/{rankedItems.length}
                </Text>
              </div>
              <IconTrophy size={32} color="var(--mantine-color-blue-6)" />
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                  Progress
                </Text>
                <Progress value={(ratedCount / (rankedItems.length || 1)) * 100} mt="xs" color="green" />
              </div>
              <ActionIcon size={32} variant="light" color="green">
                {Math.round((ratedCount / (rankedItems.length || 1)) * 100)}%
              </ActionIcon>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Title order={2} mb="md" c="blue">
            Rate Items
          </Title>
          <Stack gap="md">
            {rankedItems.map((item) => (
              <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Group justify="space-between">
                    <Text fw={500} size="lg">
                      {item.name}
                    </Text>
                    <Badge variant="light">
                      {categories?.find((cat) => cat.id === item.categoryId)?.name ?? 'Category'}
                    </Badge>
                  </Group>
                </Card.Section>

                <Text size="sm" c="dimmed" mt="sm" mb="md">
                  {item.description}
                </Text>

                <Group justify="space-between" align="center">
                  <div>
                    <Text size="sm" c="dimmed" mb="xs">
                      Your Rating:
                    </Text>
                    <Rating
                      value={item.averageRating}
                      onChange={(rating) => onRate(item.id, rating)}
                      size="lg"
                      count={10}
                    />
                  </div>

                  {item.totalRatings > 0 && (
                    <Box ta="center">
                      <Text size="xl" fw={700} c="blue">
                        {item.averageRating}/10
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.totalRatings} rating{item.totalRatings !== 1 ? 's' : ''}
                      </Text>
                    </Box>
                  )}
                </Group>

                {item.totalRatings > 0 && (
                  <Progress value={(item.averageRating / 10) * 100} mt="md" color="blue" radius="xl" size="sm" />
                )}
              </Card>
            ))}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Title order={2} mb="md" c="blue">
            Live Rankings
          </Title>
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Stack gap="md">
              {rankedItems.map((item, index) => (
                <Paper
                  key={item.id}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: `var(--mantine-color-blue-${Math.min(9, 5 + index)}-5)`,
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group align="center">
                      {index === 0 && <IconTrophy size={24} color="gold" />}
                      {index === 1 && <IconMedal size={24} color="silver" />}
                      {index === 2 && <IconAward size={24} color="#CD7F32" />}
                      {index > 2 && <Avatar size={32} radius="xl">{index + 1}</Avatar>}
                      <div>
                        <Text fw={500} size="md">
                          {item.name}
                        </Text>
                        <Group gap="xs" align="center">
                          <Rating value={item.averageRating} readOnly size="sm" count={10} />
                          <Text size="sm" c="dimmed">
                            ({item.averageRating}/10)
                          </Text>
                        </Group>
                      </div>
                    </Group>

                    <Badge color="blue" variant="filled" size="lg">
                      #{index + 1}
                    </Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Divider my="xl" />

      <Center>
        <Text c="dimmed" size="sm">
          Built with Next.js, TypeScript, and Mantine UI 🚀
        </Text>
      </Center>
    </Container>
  );
}