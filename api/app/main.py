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


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Ensure async HTTP clients are closed on shutdown."""

    yield
    await get_dmrc_client().close()
    await get_dmrc_frontend_client().close()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    debug=settings.debug,
    lifespan=lifespan,
    servers=[
        {"url": "https://siddharth7307-delhi-metro-api.hf.space", "description": "Production Cloud"}
    ],
    contact={
        "name": "Delhi Metro API Support",
        "email": "app.details@zohomail.in",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,  # Hides the verbose schemas section at the bottom
        "displayRequestDuration": True,  # Shows request execution time
    },
    docs_url=None,  # Disabled to mount the custom Swagger UI below
    redoc_url=None,  # Disabled to mount the custom ReDoc UI below
    openapi_tags=[
        {
            "name": "health",
            "description": "Operational probes for the API process.",
        },
        {
            "name": "dmrc",
            "description": "Delhi Metro resource and journey planning endpoints.",
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


@app.get("/redoc", include_in_schema=False)
async def custom_redoc_ui_html():
    """Custom ReDoc UI dynamically injected with a dark theme."""
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{app.title} - ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" href="https://delhimetrorail.com/favicon.ico">
        <style>body {{ margin: 0; padding: 0; background-color: #1a1a1a; }}</style>
    </head>
    <body>
        <div id="redoc-container"></div>
        <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
        <script>
            Redoc.init(
                "{app.openapi_url}",
                {{
                    theme: {{
                        colors: {{
                            text: {{ primary: "#ffffff", secondary: "#cccccc" }},
                            primary: {{ main: "#90caf9" }}
                        }},
                        typography: {{ color: "#ffffff" }},
                        sidebar: {{ backgroundColor: "#2d2d2d", textColor: "#ffffff" }},
                        rightPanel: {{ backgroundColor: "#1e1e1e" }}
                    }}
                }},
                document.getElementById('redoc-container')
            );
        </script>
    </body>
    </html>
    """)


@app.get("/api/v1")
def health_check():
    return {"status": "healthy", "message": "Delhi Metro API is Live 24/7!"}


app.include_router(api_router, prefix="/api/v1")
