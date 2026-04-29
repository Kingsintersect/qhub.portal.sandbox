import { UserRole } from "@/config/nav.config";

export const DUMMY_PASSWORD = "password123";

export interface DummyAuthUser {
   id: string;
   name: string;
   email: string;
   username: string;
   role: UserRole;
   availableRoles: UserRole[];
}

export const DUMMY_AUTH_USERS: DummyAuthUser[] = [
   {
      id: "std-001",
      name: "Chukwuemeka Okonkwo",
      email: "c.okonkwo@students.unilag.edu.ng",
      username: "c.okonkwo",
      role: UserRole.STUDENT,
      availableRoles: [UserRole.STUDENT],
   },
   {
      id: "lec-001",
      name: "Dr. Aisha Bello",
      email: "a.bello@unilag.edu.ng",
      username: "a.bello",
      role: UserRole.LECTURER,
      availableRoles: [UserRole.LECTURER],
   },
   {
      id: "hod-001",
      name: "Prof. Funke Adeyemi",
      email: "f.adeyemi@unilag.edu.ng",
      username: "f.adeyemi",
      role: UserRole.HOD,
      availableRoles: [UserRole.HOD],
   },
   {
      id: "dean-001",
      name: "Prof. Ngozi Ekanem",
      email: "n.ekanem@unilag.edu.ng",
      username: "n.ekanem",
      role: UserRole.DEAN,
      availableRoles: [UserRole.DEAN],
   },
   {
      id: "bur-001",
      name: "Ibrahim Musa",
      email: "i.musa@unilag.edu.ng",
      username: "i.musa",
      role: UserRole.BURSARY,
      availableRoles: [UserRole.BURSARY],
   },
   {
      id: "dir-001",
      name: "Dr. Adebayo Oladipo",
      email: "a.oladipo@unilag.edu.ng",
      username: "a.oladipo",
      role: UserRole.DIRECTOR,
      availableRoles: [UserRole.DIRECTOR],
   },
   {
      id: "adm-001",
      name: "Oluwaseun Adeyemi",
      email: "o.adeyemi@admin.unilag.edu.ng",
      username: "o.adeyemi",
      role: UserRole.ADMIN,
      availableRoles: [UserRole.ADMIN],
   },
   {
      id: "sa-001",
      name: "Prof. Ngozi Okafor",
      email: "registrar@unilag.edu.ng",
      username: "registrar",
      role: UserRole.SUPER_ADMIN,
      availableRoles: [UserRole.SUPER_ADMIN],
   },
];

export const findDummyUserByEmail = (email: string): DummyAuthUser | undefined => {
   const normalized = email.trim().toLowerCase();
   return DUMMY_AUTH_USERS.find((user) => user.email.toLowerCase() === normalized);
};

export const findDummyUserByUsername = (
   username: string
): DummyAuthUser | undefined => {
   const normalized = username.trim().toLowerCase();
   return DUMMY_AUTH_USERS.find((user) => user.username.toLowerCase() === normalized);
};

export const findDummyUserByIdentifier = (
   identifier: string
): DummyAuthUser | undefined => {
   const normalized = identifier.trim().toLowerCase();

   return DUMMY_AUTH_USERS.find(
      (user) =>
         user.email.toLowerCase() === normalized ||
         user.username.toLowerCase() === normalized
   );
};

export const findDummyUserByRole = (role: UserRole): DummyAuthUser | undefined => {
   return DUMMY_AUTH_USERS.find((user) => user.role === role);
};
