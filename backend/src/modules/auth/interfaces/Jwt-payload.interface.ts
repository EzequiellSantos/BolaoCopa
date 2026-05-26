import { UserRole } from '../../users/schemas/user.schema';

export interface JwtPayload {
  sub: string;   // userId (MongoDB ObjectId como string)
  email: string;
  role: UserRole;
}