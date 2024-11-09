import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { createOrUpdateUser } from "@/lib/db";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        console.log('SignIn callback triggered for user:', user.email);
        await createOrUpdateUser(user);
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    }
  }
});

export { handler as GET, handler as POST }