import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export async function PATCH(
  request: NextRequest,
  { params }: { params: { fileid: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const result = await db.collection('files').updateOne(
      { _id: new ObjectId(params.fileid) },
      { $set: { name } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating file name:', error);
    return NextResponse.json(
      { error: "Failed to update file name" },
      { status: 500 }
    );
  }
} 