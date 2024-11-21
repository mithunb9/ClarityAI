import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, chunks } = await request.json();

    // Download all chunks
    const downloadPromises = chunks.map(async (chunkKey: string) => {
      const response = await s3
        .getObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: chunkKey,
        })
        .promise();
      return response.Body;
    });

    const chunkBodies = await Promise.all(downloadPromises);
    
    // Merge chunks
    const mergedBuffer = Buffer.concat(chunkBodies as Buffer[]);

    // Upload merged file
    const mergedKey = `uploads/${Date.now()}-${fileName}`;
    await s3
      .putObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: mergedKey,
        Body: mergedBuffer,
      })
      .promise();

    // Clean up chunk files
    await Promise.all(
      chunks.map((chunkKey: string) =>
        s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: chunkKey,
          })
          .promise()
      )
    );

    return NextResponse.json({
      files: [
        {
          key: mergedKey,
          url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${mergedKey}`,
          filename: fileName,
        },
      ],
    });
  } catch (error) {
    console.error("Error merging chunks:", error);
    return NextResponse.json(
      { error: "Failed to merge chunks" },
      { status: 500 }
    );
  }
} 