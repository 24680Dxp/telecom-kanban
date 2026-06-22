from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import projects, stages, access_points

Base.metadata.create_all(bind=engine)

app = FastAPI(title="项目看板", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api", tags=["项目"])
app.include_router(stages.router, prefix="/api", tags=["阶段"])
app.include_router(access_points.router, prefix="/api", tags=["接入点"])


@app.get("/")
def root():
    return {"message": "项目看板 API"}
