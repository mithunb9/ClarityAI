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
    const file = formData.get("file") as Blob;
    const questionType = formData.get("questionType") as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided." }),
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${Date.now()}-${file.type.split('/').pop()}`; // Use file type extension instead of name

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    const uploadResult = await s3.upload(params).promise();

    return new Response(
      JSON.stringify({
        message: "File uploaded successfully!",
        key: uploadResult.Key,
        url: uploadResult.Location,
        filename: file.type.split('/').pop(), // Use file type extension instead of name property
        questionType
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload file." }),
      { status: 500 }
    );
  }
}