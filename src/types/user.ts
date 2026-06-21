export type UserRole = 'volunteer' | 'manager' | 'organizer';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar: string;
  skills: string[];
  volunteerHours: number;
  createdAt: string;
}
