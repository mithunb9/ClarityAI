import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export async function POST(request: NextRequest) {
  try {
    const { query, fileId, useContext } = await request.json();

    const file = await db.collection("files").findOne({
      _id: new ObjectId(fileId),
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const response = await fetch(`${process.env.FLASK_API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        text: file.text,
        use_context: useContext,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed chat request" },
      { status: 500 }
    );
  }
} 