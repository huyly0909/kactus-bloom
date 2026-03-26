import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { DataTable } from '@kactus-bloom/ui';

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
];

const data = [
  { name: 'Alice', email: 'alice@test.com' },
  { name: 'Bob', email: 'bob@test.com' },
  { name: 'Charlie', email: 'charlie@test.com' },
] as Record<string, unknown>[];

function renderTable(props: Partial<Parameters<typeof DataTable>[0]> = {}) {
  return render(
    <MantineProvider>
      <DataTable columns={columns} data={data} {...props} />
    </MantineProvider>,
  );
}

describe('DataTable', () => {
  it('renders columns and rows', () => {
    renderTable();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    renderTable({ data: [] });
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    renderTable({ data: [], emptyMessage: 'Nothing here' });
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows loader when loading', () => {
    renderTable({ loading: true });
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('filters data by search', async () => {
    renderTable();
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'alice');

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('paginates data', () => {
    renderTable({ pageSize: 2 });
    // First page shows 2 items
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    renderTable({ title: 'User List' });
    expect(screen.getByText('User List')).toBeInTheDocument();
  });

  it('uses custom render for column', () => {
    const customColumns = [
      {
        key: 'name',
        title: 'Name',
        render: (row: Record<string, unknown>) => <strong>{String(row.name)}</strong>,
      },
    ];
    render(
      <MantineProvider>
        <DataTable columns={customColumns} data={data} />
      </MantineProvider>,
    );
    const strong = screen.getByText('Alice');
    expect(strong.tagName).toBe('STRONG');
  });
});
