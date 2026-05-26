export { useAuth } from '../contexts/AuthContext';

import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === UserRole.ADMIN;
}