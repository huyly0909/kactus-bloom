import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { DashboardPage } from './';

// Mock ChartCard since it uses Recharts (hard to render in jsdom)
vi.mock('@kactus-bloom/ui', () => ({
  ChartCard: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="chart-card">
      <span>{title}</span>
      {subtitle && <span>{subtitle}</span>}
    </div>
  ),
}));

// Mock utils
vi.mock('@kactus-bloom/ui/utils', () => ({
  formatCurrency: (v: number) => `$${v.toLocaleString()}`,
  formatNumber: (v: number) => v.toLocaleString(),
}));

function renderDashboard() {
  return render(
    <MantineProvider>
      <DashboardPage />
    </MantineProvider>,
  );
}

describe('DashboardPage', () => {
  it('renders the dashboard title', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders four KPI cards', () => {
    renderDashboard();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Growth Rate')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('renders chart cards', () => {
    renderDashboard();
    const charts = screen.getAllByTestId('chart-card');
    expect(charts).toHaveLength(2);
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Daily Transactions')).toBeInTheDocument();
  });

  it('formats growth rate as percent', () => {
    renderDashboard();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });
});
