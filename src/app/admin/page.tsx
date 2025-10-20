'use client';

import { useState } from 'react';
import {
  AppShell,
  Button,
  Text,
  ThemeIcon,
  NavLink,
  Container,
  Stack,
  Card,
  Grid,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Group,
  Title,
  Modal,
  TextInput,
  Textarea,
  Select,
  Switch,
  NumberInput,
  Table,
  ScrollArea,
  Progress,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconDashboard,
  IconStar,
  IconCategory,
  IconUsers,
  IconLogout,
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronRight,
  IconLogin,
  IconChartBar,
} from '@tabler/icons-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { api } from '~/trpc/react';

type CategoryFormState = {
  name: string;
  description: string;
  color: string;
};

const emptyCategoryForm: CategoryFormState = {
  name: '',
  description: '',
  color: 'blue',
};

type RankingItemFormState = {
  name: string;
  description: string;
  categoryId: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
};

const emptyRankingItemForm: RankingItemFormState = {
  name: '',
  description: '',
  categoryId: '',
  imageUrl: '',
  featured: false,
  order: 0,
};

type RatingFormState = {
  value: number;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');

  // API queries - only run if user is authenticated and admin
  const shouldFetchData =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const { data: categories } = api.category.getAll.useQuery(undefined, {
    enabled: shouldFetchData,
  });
  const { data: userStats } = api.user.getStats.useQuery(undefined, {
    enabled: shouldFetchData,
  });
  const { data: rankingItems } = api.rankingItem.getAll.useQuery(undefined, {
    enabled: shouldFetchData,
  });
  const { data: itemStats } = api.rankingItem.getStats.useQuery(undefined, {
    enabled: shouldFetchData,
  });
  const { data: ratings } = api.rating.getAll.useQuery(undefined, {
    enabled: shouldFetchData,
  });
  const { data: ratingStats } = api.rating.getStats.useQuery(undefined, {
    enabled: shouldFetchData,
  });
  
  const utils = api.useUtils();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<RankingItemFormState>(emptyRankingItemForm);
  
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [ratingForm, setRatingForm] = useState<RatingFormState>({ value: 5 });

  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      void utils.category.getAll.invalidate();
      void utils.rankingItem.getStats.invalidate();
      notifications.show({ color: 'green', message: 'Category created.' });
      closeCategoryModal();
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: () => {
      void utils.category.getAll.invalidate();
      notifications.show({ color: 'green', message: 'Category updated.' });
      closeCategoryModal();
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => {
      void utils.category.getAll.invalidate();
      void utils.rankingItem.getStats.invalidate();
      notifications.show({ color: 'green', message: 'Category removed.' });
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });
  
  const createItem = api.rankingItem.create.useMutation({
    onSuccess: () => {
      void utils.rankingItem.getAll.invalidate();
      void utils.rankingItem.getStats.invalidate();
      notifications.show({ color: 'green', message: 'Ranking item created.' });
      closeItemModal();
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });

  const updateItem = api.rankingItem.update.useMutation({
    onSuccess: () => {
      void utils.rankingItem.getAll.invalidate();
      notifications.show({ color: 'green', message: 'Ranking item updated.' });
      closeItemModal();
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });

  const deleteItem = api.rankingItem.delete.useMutation({
    onSuccess: () => {
      void utils.rankingItem.getAll.invalidate();
      void utils.rankingItem.getStats.invalidate();
      notifications.show({ color: 'green', message: 'Ranking item removed.' });
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });
  
  const updateRatingMutation = api.rating.update.useMutation({
    onSuccess: () => {
      void utils.rating.getAll.invalidate();
      void utils.rating.getStats.invalidate();
      void utils.rankingItem.getAll.invalidate();
      void utils.rankingItem.getByCategory.invalidate();
      void utils.rankingItem.getStats.invalidate();
      notifications.show({ color: 'green', message: 'Rating updated.' });
      setRatingModalOpen(false);
      setEditingRatingId(null);
      setRatingForm({ value: 5 });
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });

  const deleteRatingMutation = api.rating.delete.useMutation({
    onSuccess: () => {
      void utils.rating.getAll.invalidate();
      void utils.rating.getStats.invalidate();
      void utils.rankingItem.getAll.invalidate();
      void utils.rankingItem.getByCategory.invalidate();
      void utils.rankingItem.getStats.invalidate();
      notifications.show({ color: 'green', message: 'Rating deleted.' });
    },
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
  });

  const openNewCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: (typeof categories)[number]) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description ?? '',
      color: category.color,
    });
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const handleCategorySubmit = () => {
    if (!categoryForm.name.trim()) {
      notifications.show({ color: 'red', message: 'Name is required.' });
      return;
    }

    if (editingCategoryId) {
      updateCategory.mutate({ id: editingCategoryId, ...categoryForm });
    } else {
      createCategory.mutate(categoryForm);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this category? This will remove its items too.')) {
      deleteCategory.mutate({ id });
    }
  };
  
  const openNewItemModal = () => {
    setEditingItemId(null);
    setItemForm({
      ...emptyRankingItemForm,
      categoryId: categories?.[0]?.id ?? '',
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: (typeof rankingItems)[number]) => {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl ?? '',
      featured: item.featured,
      order: item.order,
    });
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setItemModalOpen(false);
    setEditingItemId(null);
    setItemForm(emptyRankingItemForm);
  };

  const handleItemSubmit = () => {
    if (!itemForm.name.trim() || !itemForm.categoryId) {
      notifications.show({ color: 'red', message: 'Name and category are required.' });
      return;
    }

    if (editingItemId) {
      updateItem.mutate({ id: editingItemId, ...itemForm });
    } else {
      createItem.mutate(itemForm);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this ranking item?')) {
      deleteItem.mutate({ id });
    }
  };
  
  const openEditRatingModal = (rating: NonNullable<typeof ratings>[number]) => {
    setEditingRatingId(rating.id);
    setRatingForm({ value: rating.value });
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setEditingRatingId(null);
    setRatingForm({ value: 5 });
  };

  const handleRatingSubmit = () => {
    if (!editingRatingId) return;
    updateRatingMutation.mutate({ id: editingRatingId, value: ratingForm.value });
  };

  const handleDeleteRating = (id: string) => {
    if (confirm('Delete this rating?')) {
      deleteRatingMutation.mutate({ id });
    }
  };

  const handleAddButtonClick = () => {
    if (activeTab === 'categories') {
      openNewCategoryModal();
    } else if (activeTab === 'items') {
      openNewItemModal();
    } else if (activeTab === 'ratings') {
      notifications.show({ color: 'blue', message: 'Ratings are created by users automatically.' });
    } else {
      notifications.show({ color: 'blue', message: 'Coming soon.' });
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <Container size="sm" mt={100}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="lg">
              <Loader size="lg" />
              <Text>Loading admin dashboard...</Text>
            </Stack>
          </Center>
        </Card>
      </Container>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated' || !session) {
    return (
      <Container size="sm" mt={100}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <ThemeIcon size={60} radius="md" color="blue">
              <IconLogin size={30} />
            </ThemeIcon>
            <Title order={2}>Admin Sign In Required</Title>
            <Text c="dimmed" ta="center">
              Please sign in with your Google account to access the admin dashboard.
            </Text>
            <Button
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              leftSection={<IconLogin size={16} />}
              size="lg"
            >
              Sign In with Google
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Authenticated but not admin
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    return (
      <Container size="sm" mt={100}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <ThemeIcon size={60} radius="md" color="red">
              <IconUsers size={30} />
            </ThemeIcon>
            <Title order={2}>Access Denied</Title>
            <Text c="dimmed" ta="center">
              You need administrator privileges to access this page.
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Current role: {session.user.role || 'USER'}
            </Text>
            <Group>
              <Button onClick={() => signOut()} color="red">
                Sign Out
              </Button>
              <Button variant="light" onClick={() => (window.location.href = '/')}>
                Go to Main App
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Admin dashboard content with new AppShell structure
  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: false },
      }}
      header={{ height: 60 }}
      padding="md"
    >
      {/* Navigation */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Group gap="xs" mb="md">
            <ThemeIcon size={40} radius="md">
              <IconDashboard size={20} />
            </ThemeIcon>
            <div>
              <Text fw={500}>Admin Dashboard</Text>
              <Text size="xs" c="dimmed">
                Ranking System
              </Text>
            </div>
          </Group>

          <Stack gap="xs">
            <NavLink
              label="Dashboard"
              leftSection={<IconDashboard size={16} />}
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <NavLink
              label="Ranking Items"
              leftSection={<IconStar size={16} />}
              active={activeTab === 'items'}
              onClick={() => setActiveTab('items')}
            />
            <NavLink
              label="Categories"
              leftSection={<IconCategory size={16} />}
              active={activeTab === 'categories'}
              onClick={() => setActiveTab('categories')}
            />
            <NavLink
              label="Ratings"
              leftSection={<IconChartBar size={16} />}
              active={activeTab === 'ratings'}
              onClick={() => setActiveTab('ratings')}
            />
            <NavLink
              label="Users"
              leftSection={<IconUsers size={16} />}
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Group gap="xs">
            <Text size="sm" fw={500}>
              {session.user.name}
            </Text>
            <Badge size="sm" color="blue">
              {session.user.role}
            </Badge>
          </Group>
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconLogout size={16} />}
            onClick={() => signOut()}
            fullWidth
            mt="xs"
          >
            Sign Out
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Header */}
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Title order={3}>
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'items' && 'Manage Ranking Items'}
            {activeTab === 'categories' && 'Manage Categories'}
            {activeTab === 'users' && 'Manage Users'}
          </Title>
          {activeTab !== 'dashboard' && (
            <Button leftSection={<IconPlus size={16} />} size="sm" onClick={handleAddButtonClick}>
              Add New
            </Button>
          )}
        </Group>
      </AppShell.Header>

      {/* Main Content */}
      <AppShell.Main>
        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <Container size="xl">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Total Items</Text>
                    <ThemeIcon color="blue" variant="light">
                      <IconStar size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700}>
                    {itemStats?.totalItems || 0}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {itemStats?.activeItems || 0} active
                  </Text>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Categories</Text>
                    <ThemeIcon color="green" variant="light">
                      <IconCategory size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700}>
                    {categories?.length || 0}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Total categories
                  </Text>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Users</Text>
                    <ThemeIcon color="orange" variant="light">
                      <IconUsers size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700}>
                    {userStats?.totalUsers || 0}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {userStats?.admins || 0} admins
                  </Text>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Ratings</Text>
                    <ThemeIcon color="violet" variant="light">
                      <IconChartBar size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700}>
                    {ratingStats?.totalRatings ?? 0}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Avg score: {ratingStats?.averageRating ?? 0} ({ratingStats?.uniqueRaters ?? 0} users)
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>

            <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
              <Title order={4} mb="md">
                Ratings Overview
              </Title>
              <Stack gap="sm">
                {rankingItems && rankingItems.length > 0 ? (
                  rankingItems
                    .slice(0, 10)
                    .map((item) => (
                      <Stack key={item.id} gap={4}>
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            {item.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {item.averageRating}/10 ({item.totalRatings} ratings)
                          </Text>
                        </Group>
                        <Progress value={(item.averageRating / 10) * 100} radius="xl" />
                      </Stack>
                    ))
                ) : (
                  <Text c="dimmed" size="sm">
                    No ranking items yet. Create some to populate the chart.
                  </Text>
                )}
              </Stack>
            </Card>

            <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
              <Title order={4} mb="md">
                Recent Categories
              </Title>
              <Stack gap="xs">
                {categories?.slice(0, 5).map((category) => (
                  <Group key={category.id} justify="space-between">
                    <Group>
                      <ThemeIcon
                        color={category.color as any}
                        variant="light"
                        size="sm"
                      >
                        <IconCategory size={12} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>
                          {category.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {category._count?.items || 0} items
                        </Text>
                      </div>
                    </Group>
                    <IconChevronRight size={16} />
                  </Group>
                )) || (
                  <Text c="dimmed" size="sm">
                    No categories yet. Create some to get started!
                  </Text>
                )}
              </Stack>
            </Card>
          </Container>
        )}

        {/* Categories Management */}
        {activeTab === 'categories' && (
          <Container size="xl">
            <Text size="lg" mb="md">
              Categories Management
            </Text>
            <Grid>
              {categories?.map((category) => (
                <Grid.Col key={category.id} span={6}>
                  <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Group>
                        <ThemeIcon
                          color={category.color as any}
                          variant="light"
                        >
                          <IconCategory size={16} />
                        </ThemeIcon>
                        <Text fw={500}>{category.name}</Text>
                      </Group>
                      <Group gap="xs">
                        <Tooltip label="Edit">
                          <ActionIcon variant="light" onClick={() => openEditCategoryModal(category)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteCategory(category.id)}
                            loading={deleteCategory.isPending && deleteCategory.variables?.id === category.id}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                    {category.description && (
                      <Text size="sm" c="dimmed" mb="xs">
                        {category.description}
                      </Text>
                    )}
                    <Badge size="sm" variant="light">
                      {category._count?.items || 0} items
                    </Badge>
                  </Card>
                </Grid.Col>
              )) || (
                <Grid.Col span={12}>
                  <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Text c="dimmed" ta="center">
                      No categories found. Click "Add New" to create your first category.
                    </Text>
                  </Card>
                </Grid.Col>
              )}
            </Grid>
          </Container>
        )}

        {/* Items Management */}
        {activeTab === 'items' && (
          <Container size="xl">
            <Text size="lg" mb="md">
              Ranking Items Management
            </Text>
            <Grid>
              {rankingItems?.map((item) => (
                <Grid.Col key={item.id} span={6}>
                  <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Group>
                        <ThemeIcon color="blue" variant="light">
                          <IconStar size={16} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500}>{item.name}</Text>
                          <Text size="xs" c="dimmed">
                            Order: {item.order}
                          </Text>
                        </div>
                      </Group>
                      <Group gap="xs">
                        <Tooltip label="Edit">
                          <ActionIcon variant="light" onClick={() => openEditItemModal(item)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteItem(item.id)}
                            loading={deleteItem.isPending && deleteItem.variables?.id === item.id}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                    <Text size="sm" c="dimmed" mb="xs">
                      {item.description}
                    </Text>
                    <Group gap="xs">
                      <Badge>{categories?.find((cat) => cat.id === item.categoryId)?.name ?? 'Unknown'}</Badge>
                      <Badge color={item.featured ? 'green' : 'gray'}>
                        {item.featured ? 'Featured' : 'Standard'}
                      </Badge>
                      <Badge>{item.totalRatings} ratings</Badge>
                    </Group>
                  </Card>
                </Grid.Col>
              )) || (
                <Grid.Col span={12}>
                  <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Text c="dimmed" ta="center">
                      No ranking items yet. Click "Add New" to create one.
                    </Text>
                  </Card>
                </Grid.Col>
              )}
            </Grid>
          </Container>
        )}
        
        {/* Ratings Management */}
        {activeTab === 'ratings' && (
          <Container size="xl">
            <Text size="lg" mb="md">
              Ratings Management
            </Text>
            {ratings && ratings.length > 0 ? (
              <ScrollArea h={400}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item</Table.Th>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Value</Table.Th>
                      <Table.Th>Updated</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {ratings.map((rating) => (
                      <Table.Tr key={rating.id}>
                        <Table.Td>{rating.item?.name ?? 'Unknown item'}</Table.Td>
                        <Table.Td>{rating.user?.name ?? rating.user?.email ?? 'Unknown user'}</Table.Td>
                        <Table.Td>{rating.value}/10</Table.Td>
                        <Table.Td>{new Date(rating.updatedAt).toLocaleString()}</Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            <Tooltip label="Edit">
                              <ActionIcon variant="light" onClick={() => openEditRatingModal(rating)}>
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => handleDeleteRating(rating.id)}
                                loading={
                                  deleteRatingMutation.isPending &&
                                  deleteRatingMutation.variables?.id === rating.id
                                }
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            ) : (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Text c="dimmed" ta="center">
                  No ratings yet. Encourage users to rate items to see data here.
                </Text>
              </Card>
            )}
          </Container>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <Container size="xl">
            <Text size="lg" mb="md">
              Users Management - Coming Soon
            </Text>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Text c="dimmed">
                This section will allow you to manage users and roles.
              </Text>
            </Card>
          </Container>
        )}
      </AppShell.Main>
      <Modal
        opened={categoryModalOpen}
        onClose={closeCategoryModal}
        title={editingCategoryId ? 'Edit Category' : 'Create Category'}
        centered
      >
        <Stack>
          <TextInput
            label="Name"
            required
            value={categoryForm.name}
            onChange={(event) =>
              setCategoryForm((prev) => ({ ...prev, name: (event.currentTarget || event.target).value }))
            }
          />
          <Textarea
            label="Description"
            minRows={3}
            value={categoryForm.description}
            onChange={(event) =>
              setCategoryForm((prev) => ({ ...prev, description: (event.currentTarget || event.target).value }))
            }
          />
          <TextInput
            label="Color"
            description="Any Mantine color name or CSS color value."
            value={categoryForm.color}
            onChange={(event) =>
              setCategoryForm((prev) => ({ ...prev, color: (event.currentTarget || event.target).value }))
            }
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeCategoryModal}>
              Cancel
            </Button>
            <Button
              onClick={handleCategorySubmit}
              loading={createCategory.isPending || updateCategory.isPending}
            >
              {editingCategoryId ? 'Save Changes' : 'Create Category'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={itemModalOpen}
        onClose={closeItemModal}
        title={editingItemId ? 'Edit Ranking Item' : 'Create Ranking Item'}
        centered
      >
        <Stack>
          <TextInput
            label="Name"
            required
            value={itemForm.name}
            onChange={(event) =>
              setItemForm((prev) => ({ ...prev, name: (event.currentTarget || event.target).value }))
            }
          />
          <Textarea
            label="Description"
            minRows={3}
            value={itemForm.description}
            onChange={(event) =>
              setItemForm((prev) => ({ ...prev, description: (event.currentTarget || event.target).value }))
            }
          />
          <Select
            label="Category"
            data={(categories ?? []).map((cat) => ({ value: cat.id, label: cat.name }))}
            value={itemForm.categoryId}
            onChange={(value) =>
              setItemForm((prev) => ({ ...prev, categoryId: value ?? '' }))
            }
            required
          />
          <TextInput
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={itemForm.imageUrl ?? ''}
            onChange={(event) =>
              setItemForm((prev) => ({ ...prev, imageUrl: (event.currentTarget || event.target).value }))
            }
          />
          <Switch
            label="Featured"
            checked={itemForm.featured}
            onChange={(event) =>
              setItemForm((prev) => ({ ...prev, featured: (event.currentTarget || event.target).checked }))
            }
          />
          <NumberInput
            label="Display Order"
            value={itemForm.order}
            onChange={(value) =>
              setItemForm((prev) => ({ ...prev, order: value ?? 0 }))
            }
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeItemModal}>
              Cancel
            </Button>
            <Button
              onClick={handleItemSubmit}
              loading={createItem.isPending || updateItem.isPending}
            >
              {editingItemId ? 'Save Changes' : 'Create Item'}
            </Button>
          </Group>
        </Stack>
      </Modal>
      
      <Modal
        opened={ratingModalOpen}
        onClose={closeRatingModal}
        title="Edit Rating"
        centered
      >
        <Stack>
          <NumberInput
            label="Rating"
            min={1}
            max={10}
            value={ratingForm.value}
            onChange={(value) =>
              setRatingForm((prev) => ({
                ...prev,
                value: typeof value === 'number' ? value : prev.value,
              }))
            }
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeRatingModal}>
              Cancel
            </Button>
            <Button
              onClick={handleRatingSubmit}
              loading={updateRatingMutation.isPending}
            >
              Save Rating
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}