from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Stage, AccessPoint
from app.schemas import StageCreate, StageUpdate, StageReorderRequest, StageResponse

router = APIRouter()


def _count_access_points(stage_id: int, db: Session) -> int:
    return db.query(AccessPoint).filter(AccessPoint.stage_id == stage_id).count()


def _to_response(stage: Stage, db: Session) -> StageResponse:
    return StageResponse(
        id=stage.id,
        project_id=stage.project_id,
        name=stage.name,
        sort_order=stage.sort_order,
        is_bottleneck=stage.is_bottleneck,
        color=stage.color,
        access_point_count=_count_access_points(stage.id, db),
    )


@router.get("/projects/{project_id}/stages", response_model=List[StageResponse])
def list_stages(project_id: int, db: Session = Depends(get_db)):
    stages = (
        db.query(Stage)
        .filter(Stage.project_id == project_id)
        .order_by(Stage.sort_order)
        .all()
    )
    return [_to_response(s, db) for s in stages]


@router.post("/projects/{project_id}/stages", response_model=StageResponse)
def create_stage(project_id: int, data: StageCreate, db: Session = Depends(get_db)):
    stage = Stage(project_id=project_id, **data.model_dump())
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return _to_response(stage, db)


@router.put("/stages/{stage_id}", response_model=StageResponse)
def update_stage(stage_id: int, data: StageUpdate, db: Session = Depends(get_db)):
    stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="阶段不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(stage, key, value)
    db.commit()
    db.refresh(stage)
    return _to_response(stage, db)


@router.delete("/stages/{stage_id}")
def delete_stage(stage_id: int, db: Session = Depends(get_db)):
    stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="阶段不存在")
    # 将该阶段下的接入点 stage_id 置空
    db.query(AccessPoint).filter(AccessPoint.stage_id == stage_id).update(
        {AccessPoint.stage_id: None}
    )
    db.delete(stage)
    db.commit()
    return {"message": "已删除"}


@router.put("/projects/{project_id}/stages/reorder")
def reorder_stages(project_id: int, data: StageReorderRequest, db: Session = Depends(get_db)):
    order_map = {item.id: item.sort_order for item in data.stages}
    stages = db.query(Stage).filter(Stage.project_id == project_id).all()
    for stage in stages:
        if stage.id in order_map:
            stage.sort_order = order_map[stage.id]
    db.commit()
    return {"message": "排序已更新"}
