import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export async function GET(
  request: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = request.nextUrl.searchParams.get('userid');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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
      lastAccessed: file.lastAccessed?.toISOString() || file.createdAt.toISOString(),
      userId: file.userId,
      text: file.text,
      quiz: file.quiz
    }));

    return NextResponse.json(transformedFiles, { status: 200 });

  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch files",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const fileId = request.nextUrl.searchParams.get('fileid');
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
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
      { _id: new ObjectId(fileId) },
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
