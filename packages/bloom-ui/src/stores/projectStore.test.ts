import { describe, it, expect, beforeEach, vi } from 'vitest';
import Cookies from 'js-cookie';
import { useProjectStore } from './projectStore';

vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    remove: vi.fn(),
    get: vi.fn(),
  },
}));

const mockProject = {
  id: '123',
  name: 'Test Project',
  code: 'TP',
  status: 'active',
};

describe('projectStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.setState({
      currentProject: null,
      isLoading: false,
    });
  });

  it('has correct initial state', () => {
    const state = useProjectStore.getState();
    expect(state.currentProject).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('setProject sets project and cookie', () => {
    useProjectStore.getState().setProject(mockProject);

    const state = useProjectStore.getState();
    expect(state.currentProject).toEqual(mockProject);
    expect(state.isLoading).toBe(false);
    expect(Cookies.set).toHaveBeenCalledWith('kactus_project_id', '123', { expires: 365 });
  });

  it('clearProject removes project and cookie', () => {
    useProjectStore.getState().setProject(mockProject);
    useProjectStore.getState().clearProject();

    const state = useProjectStore.getState();
    expect(state.currentProject).toBeNull();
    expect(Cookies.remove).toHaveBeenCalledWith('kactus_project_id');
  });

  it('getProjectIdFromCookie reads from cookie', () => {
    vi.mocked(Cookies.get).mockReturnValue('456');
    const id = useProjectStore.getState().getProjectIdFromCookie();
    expect(id).toBe('456');
    expect(Cookies.get).toHaveBeenCalledWith('kactus_project_id');
  });

  it('setLoading updates loading state', () => {
    useProjectStore.getState().setLoading(true);
    expect(useProjectStore.getState().isLoading).toBe(true);
  });
});
