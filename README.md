# ClarityAI

## Project Setup

### Pre-reqs

In order to run this project you need [Python3](https://www.python.org/downloads/) and [NodeJS](https://nodejs.org/en) installed. For [NodeJS](https://nodejs.org/en), I personally recommend using [NVM](https://github.com/nvm-sh/nvm).

### Project setup

In the root folder of your project you need to create a .env file with the following contents.

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
OPENAI_API_KEY=
FLASK_API_URL=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_BASE_URL=
```

Then, run `npm install` to install all the dependencies.

After, installing the dependencies you can run `npm run dev` to start the project. You can then access the frontend Next.js project at [localhost:3000](https://localhost:3000/)
