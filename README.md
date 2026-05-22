# AI-Powered Software Deployment Risk Monitoring Platform

A professional Next.js + Python FastAPI + MongoDB portfolio project for evaluating deployment risk, generating structured AI release analysis, simulating rollout health, and tracking incidents.

## Problem Statement

Software teams often ship releases with scattered context: changed modules, test results, rollback plans, business impact, known issues, and rollout health live in different places. That makes it hard for developers and release managers to decide whether a deployment is safe.

## Solution

This platform lets a team create a release, calculate a 0-100 deployment risk score, generate structured Gemini-powered release analysis, monitor staged rollout health, and track incidents connected to releases.

## Features

- JWT authentication with bcrypt password hashing
- Demo login for admin and developer users
- Release intake form with deployment metadata
- Rule-based deployment risk scoring
- Gemini AI release analysis with fallback Gemini model
- Mock AI fallback when Gemini is missing, unavailable, or rate-limited
- Dashboard cards, charts, and recent release table
- Release approval, rollout, pause, rollback, and completion actions
- Audit logs for release actions
- Rollout simulation for 10%, 25%, 50%, 75%, and 100%
- Incident tracking linked to releases
- AI review history and regenerate action
- Settings page showing AI provider and free-tier fallback logic

## Tech Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Axios

Backend:
- Python
- FastAPI
- Uvicorn
- MongoDB Atlas
- Motor / PyMongo
- JWT Authentication
- bcrypt
- CORS
- python-dotenv

AI:
- Google Gemini API with `google-genai`
- Main model: `gemini-3-flash-preview`
- Fallback model: `gemini-2.5-flash-lite`
- Mock AI fallback for a fully functional free demo

## AI Architecture

The backend calls Gemini when `GEMINI_API_KEY` exists. It first tries `GEMINI_MODEL=gemini-3-flash-preview`. If that fails, it tries `FALLBACK_GEMINI_MODEL=gemini-2.5-flash-lite`. If the key is missing or both Gemini calls fail, it returns structured Mock AI output.

AI output always follows this shape:

```json
{
  "summary": "string",
  "riskExplanation": "string",
  "blastRadius": "string",
  "rollbackRecommendation": "string",
  "stakeholderUpdate": "string",
  "suggestedChecklist": ["string"]
}
```

## Risk Scoring Explanation

The backend calculates a score from 0 to 100 using release details:

- Production environment increases risk
- Database, infrastructure, AI prompt, and full-stack deployments increase risk
- Test pass percentage below 80 increases risk heavily
- Critical files changed increase risk
- Missing rollback plan increases risk heavily
- Known issues increase risk
- Many changed modules increase risk
- Feature flag changes increase risk
- Business impact notes mentioning payment, login, checkout, security, billing, auth, or authentication increase risk

Risk levels:

- `0-30`: Safe
- `31-55`: Medium
- `56-75`: High Risk
- `76-100`: Critical

## Folder Structure

```text
ai-deployment-risk-monitoring-platform/
  frontend/
    app/
    components/
    lib/
    types/
    .env.example
    package.json
  backend/
    app/
      routes/
      services/
      main.py
      config.py
      database.py
      security.py
    scripts/
      seed.py
    .env.example
    requirements.txt
    runtime.txt
    Procfile
  README.md
```

## Local Setup

1. Open the project folder in VS Code:

```text
ai-deployment-risk-monitoring-platform
```

2. Install root tooling:

```bash
npm install
```

3. Install backend and frontend dependencies:

```bash
npm run setup
```

You can also install each app manually:

```bash
cd backend
python -m pip install -r requirements.txt
```

Then install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

5. Start both apps from the project root:

```bash
npm run dev
```

Or start them separately:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000 --app-dir backend
```

6. Open `http://localhost:3000`.

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas account.
2. Create an M0 free cluster.
3. Create a database user.
4. Allow your IP address or use `0.0.0.0/0` for a demo project.
5. Copy the connection string into `backend/.env`:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/deployment_risk_ai?retryWrites=true&w=majority
```

6. Seed demo data:

```bash
npm run seed
```

You can also seed from the frontend demo login button or by calling `POST /api/seed`.

## Gemini API Setup

1. Get a Gemini API key from Google AI Studio free tier.
2. Add it to `backend/.env`:

```env
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3-flash-preview
FALLBACK_GEMINI_MODEL=gemini-2.5-flash-lite
```

The app still works without this key because Mock AI fallback is built in.

## Environment Variables

Backend:

```env
PORT=5000
MONGO_URI=
MONGO_DB_NAME=deployment_risk_ai
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
FALLBACK_GEMINI_MODEL=gemini-2.5-flash-lite
CLIENT_URL=http://localhost:3000
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Free Deployment Plan

- Frontend: Vercel Hobby free tier
- Backend: Render free web service
- Database: MongoDB Atlas M0 free cluster
- AI: Gemini API free tier with Mock AI fallback
- Code hosting: GitHub free

No OpenAI API, Supabase, Firebase, PostgreSQL, paid database, paid hosting, paid authentication provider, paid monitoring tool, vector database, queue, email, or SMS service is required.

## Vercel Frontend Deployment

1. Push the project to GitHub.
2. Import the `frontend` folder in Vercel.
3. Set:

```env
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
```

4. Deploy on the Vercel Hobby free tier.

## Render Backend Deployment

1. Create a new Render free web service.
2. Select the repository and set the root directory to `backend`.
3. Build command:

```bash
pip install -r requirements.txt
```

4. Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Add backend environment variables in Render.
6. Set `CLIENT_URL` to your Vercel frontend URL.

Render free services may sleep. The frontend has loading and error states while the backend wakes up.

## Demo Credentials

- `admin@example.com` / `password123`
- `developer@example.com` / `password123`

## Screenshots

Add screenshots after running locally:

- Landing page
- Dashboard
- Create release
- Release details
- Rollout monitor
- Incidents
- AI reviews
- Settings

## Resume Bullet Point

Built AI-Powered Software Deployment Risk Monitoring Platform, a full-stack portfolio project that analyzes release details, calculates deployment risk scores, generates Gemini-powered rollout recommendations, simulates staged rollouts, and tracks incidents using Next.js, TypeScript, Python, FastAPI, MongoDB, and Gemini API.

## Interview Explanation

My project helps software teams decide whether a new release is safe to deploy. Users enter release details such as changed modules, test pass percentage, deployment type, known issues, and rollback plan. The backend calculates a risk score and Gemini AI generates a release summary, blast radius, rollback recommendation, and stakeholder update. The platform also includes rollout simulation, incident tracking, dashboard analytics, authentication, and audit logs.
