import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { ProjectSelectPage } from './';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock project store
const mockSetProject = vi.fn();
vi.mock('@kactus-bloom/ui/stores', () => ({
  useProjectStore: () => ({ setProject: mockSetProject }),
}));

// Mock project service
const mockGetProjects = vi.fn();
const mockCreateProject = vi.fn();
vi.mock('@kactus-bloom/ui/services', () => ({
  projectService: {
    getProjects: () => mockGetProjects(),
    createProject: (data: unknown) => mockCreateProject(data),
  },
}));

// Mock notifications
vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <ProjectSelectPage />
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe('ProjectSelectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loader while loading', () => {
    mockGetProjects.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('shows empty state when no projects', async () => {
    mockGetProjects.mockResolvedValue({ items: [] });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/not a member of any projects/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
  });

  it('renders project cards', async () => {
    mockGetProjects.mockResolvedValue({
      items: [
        { id: '1', name: 'Alpha', code: 'ALPHA', status: 'active', description: 'First project' },
        { id: '2', name: 'Beta', code: 'BETA', status: 'active' },
      ],
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('ALPHA')).toBeInTheDocument();
  });

  it('clicking a project sets store and navigates', async () => {
    const project = { id: '1', name: 'Alpha', code: 'ALPHA', status: 'active' };
    mockGetProjects.mockResolvedValue({ items: [project] });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Alpha'));

    expect(mockSetProject).toHaveBeenCalledWith(project);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('opens create project modal', async () => {
    mockGetProjects.mockResolvedValue({ items: [] });
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      // "Create Project" appears in button and modal header
      expect(screen.getAllByText(/create project/i).length).toBeGreaterThanOrEqual(2);
    });
    // Modal should contain form labels
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByText('Project Code')).toBeInTheDocument();
  });
});
