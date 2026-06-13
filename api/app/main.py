"""FastAPI application entrypoint.

This module creates the ASGI app, registers routers, and maps service-level
errors to HTTP errors suitable for client integrations.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import get_dmrc_client
from app.api.dependencies import get_dmrc_frontend_client
from app.api.router import api_router
from app.core.config import settings
from app.core.errors import UpstreamApiError

# --- PREMIUM DOCUMENTATION CONTENT ---
API_DESCRIPTION = """
# 🚇 Delhi Metro Network API

Welcome to the official developer documentation for the **Delhi Metro Clean API**. This premium RESTful API provides lightning-fast access to Delhi Metro Rail Corporation (DMRC) network data, optimized for modern web and mobile applications.

## 🚀 Core Capabilities
* **Network Topology**: Fetch comprehensive data on all metro lines, colors, and station coordinates.
* **Journey Planning**: Calculate optimal routes between any two stations, including exact interchanges and transit times.
* **Fare Calculation**: Get accurate pricing for any journey across the NCR.

## 💻 Using the Client Libraries (SDKs)
The code snippets generated on the right side of this dashboard are **100% production-ready**. 
1. Click on any endpoint from the sidebar (e.g., `GET /stations`).
2. On the right panel, select your preferred environment (e.g., select **JavaScript -> Fetch** for React Native/Web, or **Python -> Requests** for backend scripts).
3. The generated code automatically targets the live cloud server. Simply copy and paste the snippet directly into your application!

## 🔐 Authentication & Limits
This API is currently open for public access. No API keys are required for `v1` endpoints. Please ensure your applications cache responses (like station lists) locally to minimize unnecessary network requests.
"""


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Ensure async HTTP clients are closed on shutdown."""

    yield
    await get_dmrc_client().close()
    await get_dmrc_frontend_client().close()


app = FastAPI(
    title="Delhi Metro Premium API",
    version="1.0.0",
    description=API_DESCRIPTION,
    debug=settings.debug,
    lifespan=lifespan,
    servers=[
        {"url": "https://siddharth7307-delhi-metro-api.hf.space", "description": "Production Cloud Server"}
    ],
    contact={
        "name": "API Support",
        "email": "app.details@zohomail.in",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url=None,  
    redoc_url=None, 
    openapi_tags=[
        {
            "name": "health",
            "description": "Operational probes for the API process.",
        },
        {
            "name": "dmrc",
            "description": "Core routing, fare, and station endpoints.",
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(UpstreamApiError)
async def handle_upstream_error(
    _: Request,
    exc: UpstreamApiError,
) -> JSONResponse:
    """Translate upstream failures to API-friendly 502 responses."""

    status_code = 502
    if exc.status_code is not None and 400 <= exc.status_code < 500:
        status_code = exc.status_code

    return JSONResponse(
        status_code=status_code,
        content={
            "detail": exc.message,
            "upstream_status_code": exc.status_code,
        },
    )


@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url='/docs')


@app.get("/docs", include_in_schema=False)
async def custom_scalar_ui_html():
    """Custom Scalar UI for premium API documentation."""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
      <head>
        <title>Delhi Metro API - Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; padding: 0; background-color: #0f0f11; }
        </style>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/openapi.json"
          data-theme="deepSpace"
          data-proxy-url=""
        ></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
    """)


@app.get("/api/v1")
def health_check():
    return {"status": "healthy", "message": "Delhi Metro API is Live 24/7!"}


app.include_router(api_router, prefix="/api/v1")