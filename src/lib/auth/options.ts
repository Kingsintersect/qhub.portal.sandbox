import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "@/config/nav.config";
import {
   DUMMY_PASSWORD,
   findDummyUserByIdentifier,
   findDummyUserByRole,
} from "@/lib/auth/dummyUsers";
import { getRegisteredMockUserByIdentifier } from "@/lib/auth/mockRegistry";

export const authOptions: NextAuthOptions = {
   session: {
      strategy: "jwt",
   },
   pages: {
      signIn: "/auth/signin",
   },
   providers: [
      CredentialsProvider({
         name: "Credentials",
         credentials: {
            identifier: { label: "Email or Username", type: "text" },
            password: { label: "Password", type: "password" },
            role: { label: "Role", type: "text" },
         },
         async authorize(credentials) {
            const password = String(credentials?.password ?? "");
            const identifier = String(credentials?.identifier ?? "").trim();
            const roleValue = String(credentials?.role ?? "").trim().toUpperCase();
            const role = (Object.values(UserRole) as string[]).includes(roleValue)
               ? (roleValue as UserRole)
               : null;

            const seededUser = role
               ? findDummyUserByRole(role)
               : findDummyUserByIdentifier(identifier);

            if (seededUser) {
               if (password !== DUMMY_PASSWORD) {
                  return null;
               }

               return {
                  id: seededUser.id,
                  name: seededUser.name,
                  email: seededUser.email,
                  role: seededUser.role,
                  availableRoles: seededUser.availableRoles,
               };
            }

            if (!identifier) {
               return null;
            }

            const registeredUser = getRegisteredMockUserByIdentifier(identifier);
            if (!registeredUser || registeredUser.password !== password) {
               return null;
            }

            return {
               id: registeredUser.id,
               name: registeredUser.name,
               email: registeredUser.email,
               role: registeredUser.role,
               availableRoles: registeredUser.availableRoles,
            };
         },
      }),
   ],
   callbacks: {
      async jwt({ token, user }) {
         if (user) {
            token.id = user.id;
            token.role = user.role;
            token.availableRoles = user.availableRoles;
         }

         return token;
      },
      async session({ session, token }) {
         if (session.user) {
            session.user.id = (token.id as string | undefined) ?? "";
            session.user.role = (token.role as UserRole | undefined) ?? UserRole.STUDENT;
            session.user.availableRoles =
               (token.availableRoles as UserRole[] | undefined) ?? [session.user.role];
         }

         return session;
      },
   },
   secret: process.env.NEXTAUTH_SECRET ?? "qhub-portal-dev-secret-change-me",
};
