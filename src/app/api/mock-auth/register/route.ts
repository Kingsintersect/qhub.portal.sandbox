import { NextResponse } from "next/server";
import { findDummyUserByEmail, findDummyUserByUsername } from "@/lib/auth/dummyUsers";
import {
   createRegisteredMockUser,
   getRegisteredMockUserByEmail,
   getRegisteredMockUserByUsername,
} from "@/lib/auth/mockRegistry";
import z from "zod";
import {
   emailSchema,
   passwordSchema,
   usernameSchema,
} from "@/lib/validations/zod";

const registerPayloadSchema = z.object({
   email: emailSchema("Email"),
   username: usernameSchema("Username"),
   password: passwordSchema.min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
   try {
      const body = await request.json();
      const parsed = registerPayloadSchema.safeParse(body);

      if (!parsed.success) {
         return NextResponse.json(
            { message: parsed.error.issues[0]?.message ?? "Invalid payload." },
            { status: 400 }
         );
      }

      const email = parsed.data.email.trim().toLowerCase();
      const username = parsed.data.username.trim().toLowerCase();
      const password = parsed.data.password;

      if (findDummyUserByEmail(email) || getRegisteredMockUserByEmail(email)) {
         return NextResponse.json(
            { message: "An account with this email already exists." },
            { status: 409 }
         );
      }

      if (findDummyUserByUsername(username) || getRegisteredMockUserByUsername(username)) {
         return NextResponse.json(
            { message: "An account with this username already exists." },
            { status: 409 }
         );
      }

      const user = createRegisteredMockUser({
         email,
         username,
         password,
      });

      return NextResponse.json(
         {
            message: "Registration successful.",
            user: {
               id: user.id,
               name: user.name,
               email: user.email,
               role: user.role,
            },
         },
         { status: 201 }
      );
   } catch {
      return NextResponse.json(
         { message: "Invalid request payload." },
         { status: 400 }
      );
   }
}
