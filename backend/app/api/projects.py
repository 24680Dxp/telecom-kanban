from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Project, Stage, AccessPoint
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse, StageResponse

router = APIRouter()

DEFAULT_STAGES = [
    {"name": "方案设计环节", "sort_order": 0, "color": "#1890ff", "is_bottleneck": 0},
    {"name": "光缆施工环节", "sort_order": 1, "color": "#1890ff", "is_bottleneck": 0},
    {"name": "现场跳纤环节", "sort_order": 2, "color": "#1890ff", "is_bottleneck": 0},
    {"name": "现场完工待工单开通", "sort_order": 3, "color": "#1890ff", "is_bottleneck": 0},
    {"name": "网络侧瓶颈", "sort_order": 4, "color": "#ff4d4f", "is_bottleneck": 1},
]


def _count_access_points(db: Session, project_id: int) -> int:
    return db.query(AccessPoint).filter(AccessPoint.project_id == project_id).count()


def _stage_to_response(stage: Stage, db: Session) -> StageResponse:
    count = db.query(AccessPoint).filter(AccessPoint.stage_id == stage.id).count()
    return StageResponse(
        id=stage.id,
        project_id=stage.project_id,
        name=stage.name,
        sort_order=stage.sort_order,
        is_bottleneck=stage.is_bottleneck,
        color=stage.color,
        access_point_count=count,
    )


@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.updated_at.desc()).all()
    return [
        ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            created_at=p.created_at,
            updated_at=p.updated_at,
            access_point_count=_count_access_points(db, p.id),
        )
        for p in projects
    ]


@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    stages = (
        db.query(Stage)
        .filter(Stage.project_id == project_id)
        .order_by(Stage.sort_order)
        .all()
    )
    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
        access_point_count=_count_access_points(db, project.id),
        stages=[_stage_to_response(s, db) for s in stages],
    )


@router.post("/projects", response_model=ProjectDetailResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(name=data.name, description=data.description)
    db.add(project)
    db.flush()

    # 创建默认 5 个阶段
    for stage_data in DEFAULT_STAGES:
        stage = Stage(project_id=project.id, **stage_data)
        db.add(stage)

    db.commit()
    db.refresh(project)

    stages = (
        db.query(Stage)
        .filter(Stage.project_id == project.id)
        .order_by(Stage.sort_order)
        .all()
    )
    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
        access_point_count=0,
        stages=[_stage_to_response(s, db) for s in stages],
    )


@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    if data.name is not None:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    db.commit()
    db.refresh(project)
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
        access_point_count=_count_access_points(db, project.id),
    )


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    db.delete(project)
    db.commit()
    return {"message": "已删除"}
