import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export async function GET(
  request: NextRequest,
  { params }: { params: { userid: string } }
) {
  try {
    const userId = params.userid;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }

    console.log("Fetching files for user:", userId);

    const cursor = await db.collection('files').find({
      userId: userId
    });

    const files = await cursor.toArray();

    if (!files.length) {
      return new Response(
        JSON.stringify([])
      );
    }
    
    return new Response(
      JSON.stringify(files)
    );
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch files" }),
      { status: 500 }
    );
  }
}