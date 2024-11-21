import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";

let client: MongoClient;

const getMongoClient = async () => {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
  }
  return client;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const client = await getMongoClient();
        const db = client.db("clarity");
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
        }
        
        return true;
      } catch (error) {
        console.error("Error saving user to database:", error);
        return false;
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