import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export async function GET(
  request: NextRequest,
  { params }: { params: { fileid: string } }
) {
  try {
    const fileId = params.fileid;
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "File ID is required" }),
        { status: 400 }
      );
    }

    console.log("Fetching results for file:", fileId);

    const file = await db.collection('files').findOne({
      _id: new ObjectId(fileId)
    });

    if (!file) {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        { status: 404 }
      );
    }

    if (!file.quiz) {
      return new Response(
        JSON.stringify({ status: "processing" }),
        { status: 200 }
      );
    }

    const questions = JSON.parse(file.quiz);

    console.log("Questions retrieved:", questions);

    return new Response(
      JSON.stringify({
        quiz: questions
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching results:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch results" }),
      { status: 500 }
    );
  }
}