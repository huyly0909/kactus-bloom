import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('setUser sets user and marks authenticated', () => {
    const user = {
      id: '1',
      email: 'test@kactus.io',
      username: 'test',
      name: 'Test',
      status: 'active',
      is_superuser: false,
    };
    useAuthStore.getState().setUser(user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('setUser with null clears authentication', () => {
    useAuthStore.getState().setUser({
      id: '1',
      email: 'test@kactus.io',
      username: 'test',
      name: 'Test',
      status: 'active',
      is_superuser: false,
    });
    useAuthStore.getState().setUser(null);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('clearAuth resets to initial state', () => {
    useAuthStore.getState().setUser({
      id: '1',
      email: 'test@kactus.io',
      username: 'test',
      name: 'Test',
      status: 'active',
      is_superuser: false,
    });
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});
