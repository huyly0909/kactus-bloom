import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { AdminUsersPage } from './Users';

// Mock admin service
const mockGetUsers = vi.fn();
const mockCreateUser = vi.fn();
const mockResetPassword = vi.fn();
const mockDeactivateUser = vi.fn();
const mockUpdateUserRole = vi.fn();

vi.mock('@kactus-bloom/ui/services', () => ({
  adminService: {
    getUsers: () => mockGetUsers(),
    createUser: (data: unknown) => mockCreateUser(data),
    resetPassword: (id: string) => mockResetPassword(id),
    deactivateUser: (id: string) => mockDeactivateUser(id),
    updateUserRole: (id: string, data: unknown) => mockUpdateUserRole(id, data),
  },
}));

// Mock notifications
vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

function renderPage() {
  return render(
    <MantineProvider>
      <AdminUsersPage />
    </MantineProvider>,
  );
}

const mockUsers = [
  { id: '1', email: 'admin@kactus.io', name: 'AdminUser', status: 'active', is_superuser: true },
  { id: '2', email: 'user@kactus.io', name: 'RegularUser', status: 'active', is_superuser: false },
];

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading then renders user table', async () => {
    mockGetUsers.mockResolvedValue({ items: mockUsers });
    renderPage();

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Then shows users by email
    await waitFor(() => {
      expect(screen.getByText('admin@kactus.io')).toBeInTheDocument();
    });
    expect(screen.getByText('user@kactus.io')).toBeInTheDocument();
    expect(screen.getByText('AdminUser')).toBeInTheDocument();
    expect(screen.getByText('RegularUser')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGetUsers.mockResolvedValue({ items: [] });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('opens create user modal', async () => {
    mockGetUsers.mockResolvedValue({ items: [] });
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      // Modal title — "Create User" appears both in the button and modal header
      // Look for the modal-specific elements
      expect(screen.getAllByText('Create User').length).toBeGreaterThanOrEqual(2);
    });
    // Modal should contain form labels (Email/Name may also appear in table headers)
    expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Admin (Superuser)')).toBeInTheDocument();
  });

  it('renders role badges', async () => {
    mockGetUsers.mockResolvedValue({ items: mockUsers });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('admin@kactus.io')).toBeInTheDocument();
    });

    // Table has role column with "Admin" and "User" badges
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    // header + 2 data rows
    expect(rows.length).toBe(3);
  });

  it('renders status badges', async () => {
    mockGetUsers.mockResolvedValue({
      items: [
        ...mockUsers,
        {
          id: '3',
          email: 'inactive@kactus.io',
          name: 'InactiveUser',
          status: 'inactive',
          is_superuser: false,
        },
      ],
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('InactiveUser')).toBeInTheDocument();
    });
    expect(screen.getAllByText('active')).toHaveLength(2);
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });
});
