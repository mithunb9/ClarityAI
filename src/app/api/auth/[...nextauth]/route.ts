import NextAuth, { NextAuthOptions, Account, Profile, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        await client.connect();
        const users = db.collection("users");
        
        await users.updateOne(
          { email: user.email },
          { 
            $set: {
              name: user.name,
              email: user.email,
              image: user.image,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );

        const dbUser = await users.findOne({ email: user.email });
        if (dbUser) {
          user.id = dbUser._id.toString();
          console.log("User saved/updated in database:", {
            id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            updatedAt: dbUser.updatedAt
          });
        }
        
        return true;
      } catch (error) {
        console.error("Error saving user to database:", error);
        return false;
      } finally {
        await client.close();
      }
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }