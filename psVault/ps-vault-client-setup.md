# PS Vault — Quick Setup (Client Instructions)

This guide is **short + simple** so you can start the project fast.

### Logs Are Present to show the flow

---

## ✅ 1) Install Required Software

### Install Docker Desktop

- Download + install **Docker Desktop**
- Start Docker Desktop and make sure it shows: ✅ **Running**

Check Docker is installed:

```bash
docker --version
docker compose version
```

---

## ✅ 2) Project Setup

### Download project code

Unzip the project folder and open it in terminal:

```bash
cd psVault
```

---

## ✅ 3) Create `.env` file (Backend)

Go inside backend folder:

```bash
cd backend
```

Create a file named **`.env`** inside `/backend`

Example `.env`:

````env
DATABASE=mongodb+srv://"DB USER"_db_user:'DB PASS'@cluster0.zptiroz.mongodb.net/?appName=Cluster0      //REMOVE double quote and single qoute and write credentials
JWT_SECRET=super_strong_random_secret_123!@
OPENAI_API_KEY=sk-proj-wtWRS6XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REDIS_URL = redis://default:AVBoAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX4.upstash.io:6379

NODE_ENV=production
PORT=3001

AWS_BUCKET=ps-vault-123
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=D2caVXXXXXXXXXXXXXXXXXXXX

✅ Save the file.

---

## ✅ 4) Create MongoDB (Database)

### Option A (Recommended): MongoDB Atlas
1. Create account on **MongoDB Atlas**
2. Create a **cluster**
3. Create a **database user + password**
4. Copy the connection string and put inside:
   ✅ `DATABASE=...`

⚠️ Important:
- In Atlas → **Network Access**
- Allow your server IP (or allow `0.0.0.0/0` for testing)

---

## ✅ 5) Setup Redis (Recommended: Upstash)

✅ You can use Upstash Redis for production.

1. Create account on **Upstash**
2. Create a **Redis Database**
3. Copy Redis URL and set:
```env
REDIS_URL=redis://default:xxxxx@xxxx.upstash.io:6379
````

⚠️ Very important:

- `REDIS_URL` should be only the URL
- Don’t paste CLI command like `redis-cli --tls -u ...`

✅ Correct:

```env
REDIS_URL=redis://default:xxxxx@xxxx.upstash.io:6379
```

❌ Wrong:

```env
REDIS_URL=redis-cli --tls -u redis://...
```

---

## ✅ 6) Setup AWS S3 (For Image Uploads)

### Step 1: Create AWS Account + S3 Bucket

1. Go to AWS → S3
2. Create a bucket (example):
   ✅ `ps-vault-123`

Region must match `.env`:
✅ `AWS_REGION=ap-south-1`

---

### Step 2: Allow Public Image Viewing (Important ✅)

Your images must be viewable in listings.

#### ✅ Option A (Recommended): Make bucket files public using Bucket Policy

Go to:
S3 → Your Bucket → **Permissions** → **Bucket Policy**

Paste this (replace BUCKET_NAME):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

✅ Example:

```json
"Resource": "arn:aws:s3:::ps-vault-123/*"
```

---

### Step 3: Disable "Block Public Access"

Go to:
S3 → Bucket → **Permissions** → **Block public access**

✅ Uncheck:

- **Block all public access**

Click Save.

---

### Step 4: Create AWS Access Keys

1. Go to AWS IAM
2. Create a user
3. Give permissions: ✅ `AmazonS3FullAccess`
4. Create **Access Key**
5. Put in `.env`:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## ✅ 7) Run Project Using Docker

Go back to main project folder:

```bash
cd ..
```

Start everything:

```bash
docker compose up --build
```

---

## ✅ 8) Open the App

Frontend:
✅ http://localhost:5173

Backend API:
✅ http://localhost:3001

Health Check:
✅ http://localhost:3001/api/health

---

## ✅ 9) Stop / Restart Commands

Stop all containers:

```bash
docker compose down
```

Restart:

```bash
docker compose up
```

Rebuild after code change:

```bash
docker compose up --build
```

---

## ✅ 10) What This Project Does (Simple)

✅ User posts a game listing  
✅ Images upload to AWS S3  
✅ Listing goes to **pending_listings**  
✅ AI verifies using `listingWorker`  
✅ If approved → saved into **listings**  
✅ Frontend gets live updates using Socket + Redis

---

## ✅ Notes (Important)

- If AWS S3 images are not visible → check bucket policy + public access settings.
- If AI verification stuck → Redis URL / worker connection issue.
- If login fails → JWT_SECRET missing or invalid token.

---

✅ Done! Project is ready to use.
