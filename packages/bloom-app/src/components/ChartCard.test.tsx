import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ChartCard } from '@kactus-bloom/ui';

// Mock Recharts — jsdom doesn't support SVG rendering
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const sampleData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
];

function renderChart(props: Partial<Parameters<typeof ChartCard>[0]> = {}) {
  return render(
    <MantineProvider>
      <ChartCard title="Revenue" data={sampleData} dataKey="value" {...props} />
    </MantineProvider>,
  );
}

describe('ChartCard', () => {
  it('renders title', () => {
    renderChart();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderChart({ subtitle: 'Last 6 months' });
    expect(screen.getByText('Last 6 months')).toBeInTheDocument();
  });

  it('renders line chart by default', () => {
    renderChart();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders bar chart', () => {
    renderChart({ type: 'bar' });
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders area chart', () => {
    renderChart({ type: 'area' });
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders extra content', () => {
    renderChart({ extra: <button>Export</button> });
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});
