import { UserRole } from "@/config/nav.config";

export interface RegisteredMockUser {
   id: string;
   name: string;
   email: string;
   username: string;
   password: string;
   role: UserRole;
   availableRoles: UserRole[];
}

const mockUsersByEmail = new Map<string, RegisteredMockUser>();
const mockUsersByUsername = new Map<string, RegisteredMockUser>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeUsername = (username: string) => username.trim().toLowerCase();

export const getRegisteredMockUserByEmail = (
   email: string
): RegisteredMockUser | undefined => {
   return mockUsersByEmail.get(normalizeEmail(email));
};

export const getRegisteredMockUserByUsername = (
   username: string
): RegisteredMockUser | undefined => {
   return mockUsersByUsername.get(normalizeUsername(username));
};

export const getRegisteredMockUserByIdentifier = (
   identifier: string
): RegisteredMockUser | undefined => {
   const normalized = identifier.trim().toLowerCase();
   return mockUsersByEmail.get(normalized) ?? mockUsersByUsername.get(normalized);
};

export const createRegisteredMockUser = (input: {
   email: string;
   username: string;
   password: string;
}): RegisteredMockUser => {
   const email = normalizeEmail(input.email);
   const username = normalizeUsername(input.username);

   const user: RegisteredMockUser = {
      id: `std-${Date.now()}`,
      name: input.username.trim(),
      email,
      username,
      password: input.password,
      role: UserRole.STUDENT,
      availableRoles: [UserRole.STUDENT],
   };

   mockUsersByEmail.set(email, user);
   mockUsersByUsername.set(username, user);
   return user;
};
