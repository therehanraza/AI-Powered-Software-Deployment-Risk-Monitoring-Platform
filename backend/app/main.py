from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import close_mongo, connect_to_mongo
from app.routes import ai_reviews, auth, dashboard, incidents, releases, rollout, seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo()


app = FastAPI(
    title="AI-Powered Software Deployment Risk Monitoring Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [origin.strip() for origin in settings.client_url.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"success": False, "message": "Invalid request payload", "errors": exc.errors()})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"success": False, "message": str(exc)})


@app.get("/")
async def root():
    return {
        "success": True,
        "message": "AI-Powered Software Deployment Risk Monitoring Platform API",
        "aiProvider": "gemini-with-mock-fallback" if settings.gemini_api_key else "mock",
        "geminiModel": settings.gemini_model,
        "fallbackGeminiModel": settings.fallback_gemini_model,
    }


@app.get("/api/health")
async def health():
    return {"success": True, "status": "ok"}


app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(releases.router)
app.include_router(ai_reviews.router)
app.include_router(rollout.router)
app.include_router(incidents.router)
app.include_router(seed.router)
