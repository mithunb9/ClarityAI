import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";
import { authOptions } from "@/lib/auth";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }