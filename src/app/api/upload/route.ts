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
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      console.error("No files provided.");
      return new Response(
        JSON.stringify({ error: "No files provided." }),
        { status: 400 }
      );
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        if (!file.name) {
          throw new Error("Invalid file format.");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const key = `uploads/${Date.now()}-${file.name}`;

        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME || '',
          Key: key,
          Body: buffer,
        };

        const uploadResult = await s3.upload(params).promise();
        console.log("File uploaded:", uploadResult);
        return {
          url: uploadResult.Location,
          key: uploadResult.Key,
          filename: file.name
        };
      })
    );

    return new Response(
      JSON.stringify({ 
        message: "Files uploaded successfully!",
        files: uploadResults 
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload files." }),
      { status: 500 }
    );
  }
}