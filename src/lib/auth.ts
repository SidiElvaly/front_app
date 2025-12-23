import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // ✅ IMPORTANT: required to encrypt/decrypt JWT sessions consistently
  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await db.user.findUnique({
          where: { email: creds.email.toLowerCase() },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(creds.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).user = {
        ...(session.user ?? {}),
        id: token.id as string,
        image: token.picture as string | undefined,
      };
      return session;
    },
  },
};
