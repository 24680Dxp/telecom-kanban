from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ====== Project ======
class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    created_at: datetime
    updated_at: datetime
    access_point_count: int = 0  # 动态计算


class ProjectDetailResponse(ProjectResponse):
    stages: List["StageResponse"] = []


# ====== Stage ======
class StageCreate(BaseModel):
    name: str
    sort_order: int = 0
    is_bottleneck: int = 0
    color: str = "#1890ff"


class StageUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None
    is_bottleneck: Optional[int] = None
    color: Optional[str] = None


class StageReorder(BaseModel):
    id: int
    sort_order: int


class StageReorderRequest(BaseModel):
    stages: List[StageReorder]


class StageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    name: str
    sort_order: int
    is_bottleneck: int
    color: str
    access_point_count: int = 0  # 动态计算


# ====== AccessPoint ======
class AccessPointCreate(BaseModel):
    project_id: int
    stage_id: Optional[int] = None
    name: str
    address: str = ""


class AccessPointUpdate(BaseModel):
    stage_id: Optional[int] = None
    name: Optional[str] = None
    address: Optional[str] = None
    sort_order: Optional[int] = None


class AccessPointMove(BaseModel):
    stage_id: int
    sort_order: int


class AccessPointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    stage_id: Optional[int] = None
    name: str
    address: str
    sort_order: int
    created_at: datetime
    updated_at: datetime


# ====== Import Result ======
class ImportResult(BaseModel):
    imported: int
    skipped: int
    skipped_details: List[str] = []
