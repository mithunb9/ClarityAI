import AWS from "aws-sdk";

// Validate environment variables
const requiredEnvVars = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET_NAME",
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is not set.`);
  }
});

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const chunk = formData.get("chunk") as Blob;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const fileName = formData.get("fileName") as string;
    const fileType = formData.get("fileType") as string;

    if (!chunk) {
      return new Response(
        JSON.stringify({ error: "No chunk provided." }),
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());
    const key = `uploads/${Date.now()}-${fileName}${totalChunks > 1 ? `.part${chunkIndex}` : ''}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key,
      Body: buffer,
      ContentType: fileType,
    };

    const uploadResult = await s3.upload(params).promise();

    // If this is the last chunk, merge all chunks
    if (chunkIndex === totalChunks - 1) {
      // Return the final file information
      return new Response(
        JSON.stringify({
          message: "File uploaded successfully!",
          key: uploadResult.Key,
          url: uploadResult.Location,
          filename: fileName
        }),
        { status: 200 }
      );
    }

    // Return progress for intermediate chunks
    return new Response(
      JSON.stringify({
        message: `Chunk ${chunkIndex + 1} of ${totalChunks} uploaded successfully`,
        chunkIndex,
        totalChunks
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading chunk:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload chunk." }),
      { status: 500 }
    );
  }
}