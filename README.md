# ClarityAI

## Project Setup

### Pre-reqs

In order to run this project you need [Python3](https://www.python.org/downloads/) and [NodeJS](https://nodejs.org/en) installed. For [NodeJS](https://nodejs.org/en), I personally recommend using [NVM](https://github.com/nvm-sh/nvm).

### Project setup

#### Client Setup

In the root folder of your project you need to create a .env file with the following contents. There should be a .env file in the server folder as well.

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
OPENAI_API_KEY=
FLASK_API_URL=http://127.0.0.1:5000/
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_BASE_URL=
```

Then, run `npm install` to install all the dependencies.

After, installing the dependencies you can run `npm run dev` to start the project. You can then access the frontend Next.js project at [localhost:3000](https://localhost:3000/)

#### Server setup

Navigate to the `server` folder of your project and create a virtualenv.


MacOS:
```
cd server
python3 -m venv venv
source venv/bin/activate
```

Windows:
```
cd server
python -m venv venv
.\venv\Scripts\activate
```

Then install the required dependencies with
```
pip3 install -r requirements.txt
or
pip install -r requirements.txt
```

Create a .env file with these values (should be stored at server/.env):
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
```

Finally, make sure that the value of the `FLASK_API_URL` in the root `.env` points to the URL of the backend server and run it (while in the server directory) with:
```
python3 app.py
or 
python app.py
```



