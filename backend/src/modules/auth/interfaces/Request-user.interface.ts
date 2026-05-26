import { UserRole } from '../../users/schemas/user.schema';

// Shape do req.user após validação do JWT
export interface RequestUser {
  userId: string;
  email: string;
  role: UserRole;
}