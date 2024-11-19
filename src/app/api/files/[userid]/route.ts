import { NextRequest } from 'next/server';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export async function GET(
  request: NextRequest,
  { params }: { params: { userid: string } }
) {
  try {
    const userId = await params?.userid;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }

    const files = await db.collection('files')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const transformedFiles = files.map(file => ({
      _id: file._id.toString(),
      fileKey: file.fileKey,
      name: file.name || file.fileKey.split('/').pop(),
      type: file.type || 'application/pdf',
      createdAt: file.createdAt.toISOString(),
      userId: file.userId,
      text: file.text,
      quiz: file.quiz
    }));

    return new Response(
      JSON.stringify(transformedFiles),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch files" }),
      { status: 500 }
    );
  }
}
