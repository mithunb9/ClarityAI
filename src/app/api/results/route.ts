import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export async function GET(
  request: NextRequest,
) {
  try {
    const fileid = request.nextUrl.searchParams.get('fileid');
    
    if (!fileid) {
      return new Response(
        JSON.stringify({ error: "File ID is required" }),
        { status: 400 }
      );
    }

    console.log("Fetching results for file:", fileid);

    const file = await db.collection('files').findOne({
      _id: new ObjectId(fileid)
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

    // Update last accessed timestamp
    await db.collection('files').updateOne(
      { _id: new ObjectId(fileid) },
      { $set: { lastAccessed: new Date() } }
    );

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