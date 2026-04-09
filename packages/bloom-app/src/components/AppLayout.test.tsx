import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { AppLayout } from '@kactus-bloom/ui';

const navSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: <span>D</span>, href: '/dashboard' },
      { label: 'Settings', icon: <span>S</span>, href: '/settings' },
    ],
  },
  {
    items: [{ label: 'Admin', icon: <span>A</span>, href: '/admin' }],
  },
];

function renderLayout(props: Partial<Parameters<typeof AppLayout>[0]> = {}) {
  return render(
    <MantineProvider>
      <AppLayout navSections={navSections} {...props}>
        <div>Page Content</div>
      </AppLayout>
    </MantineProvider>,
  );
}

describe('AppLayout', () => {
  it('renders default title', () => {
    renderLayout();
    expect(screen.getByText('Kactus Bloom')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    renderLayout({ title: 'Admin Panel' });
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders nav items', () => {
    renderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders nav section label', () => {
    renderLayout();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderLayout();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderLayout();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls onLogout when logout clicked', async () => {
    const onLogout = vi.fn();
    renderLayout({ onLogout });

    const user = userEvent.setup();
    await user.click(screen.getByText('Logout'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate when nav item clicked', async () => {
    const onNavigate = vi.fn();
    renderLayout({ onNavigate });

    const user = userEvent.setup();
    await user.click(screen.getByText('Dashboard'));
    expect(onNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('renders header right content', () => {
    renderLayout({ headerRight: <span>Project Badge</span> });
    expect(screen.getByText('Project Badge')).toBeInTheDocument();
  });
});
