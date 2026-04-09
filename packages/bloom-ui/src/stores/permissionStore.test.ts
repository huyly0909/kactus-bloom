import { describe, it, expect, beforeEach } from 'vitest';
import { usePermissionStore } from './permissionStore';

describe('permissionStore', () => {
  beforeEach(() => {
    usePermissionStore.setState({
      permissions: [],
      role: null,
      isSuperuser: false,
      isLoading: false,
    });
  });

  it('has correct initial state', () => {
    const state = usePermissionStore.getState();
    expect(state.permissions).toEqual([]);
    expect(state.role).toBeNull();
    expect(state.isSuperuser).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('setPermissions stores permissions and role', () => {
    const perms = [
      { permission: 'project', act: 'read' as const },
      { permission: 'finance', act: 'write' as const },
    ];
    usePermissionStore.getState().setPermissions(perms, 'member', false);

    const state = usePermissionStore.getState();
    expect(state.permissions).toEqual(perms);
    expect(state.role).toBe('member');
    expect(state.isSuperuser).toBe(false);
  });

  it('clearPermissions resets all state', () => {
    usePermissionStore
      .getState()
      .setPermissions([{ permission: 'project', act: 'read' }], 'owner', true);
    usePermissionStore.getState().clearPermissions();

    const state = usePermissionStore.getState();
    expect(state.permissions).toEqual([]);
    expect(state.role).toBeNull();
    expect(state.isSuperuser).toBe(false);
  });

  it('hasPermission returns true for superuser regardless', () => {
    usePermissionStore.getState().setPermissions([], null, true);
    expect(usePermissionStore.getState().hasPermission('anything', 'manage')).toBe(true);
  });

  it('hasPermission checks permission name', () => {
    usePermissionStore
      .getState()
      .setPermissions([{ permission: 'project', act: 'read' }], 'member', false);

    expect(usePermissionStore.getState().hasPermission('project')).toBe(true);
    expect(usePermissionStore.getState().hasPermission('finance')).toBe(false);
  });

  it('hasPermission checks permission and act', () => {
    usePermissionStore
      .getState()
      .setPermissions([{ permission: 'project', act: 'read' }], 'member', false);

    expect(usePermissionStore.getState().hasPermission('project', 'read')).toBe(true);
    expect(usePermissionStore.getState().hasPermission('project', 'write')).toBe(false);
  });

  it('setLoading updates loading state', () => {
    usePermissionStore.getState().setLoading(true);
    expect(usePermissionStore.getState().isLoading).toBe(true);
  });
});
