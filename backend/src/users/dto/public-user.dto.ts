import { User } from 'generated/prisma';

export type PublicUserDto = Omit<User, 'createdAt' | 'updatedAt'>;