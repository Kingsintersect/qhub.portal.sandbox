import { DefaultSession } from "next-auth";
import { UserRole } from "@/config/nav.config";

declare module "next-auth" {
   interface Session {
      user: DefaultSession["user"] & {
         id: string;
         role: UserRole;
         availableRoles: UserRole[];
      };
   }

   interface User {
      id: string;
      role: UserRole;
      availableRoles: UserRole[];
   }
}

declare module "next-auth/jwt" {
   interface JWT {
      id?: string;
      role?: UserRole;
      availableRoles?: UserRole[];
   }
}
