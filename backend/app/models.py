from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    stages = relationship("Stage", back_populates="project", cascade="all, delete-orphan")
    access_points = relationship("AccessPoint", back_populates="project", cascade="all, delete-orphan")


class Stage(Base):
    __tablename__ = "stages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    sort_order = Column(Integer, default=0)
    is_bottleneck = Column(Integer, default=0)  # 0=普通阶段, 1=瓶颈标记
    color = Column(String(20), default="#1890ff")

    project = relationship("Project", back_populates="stages")
    access_points = relationship("AccessPoint", back_populates="stage")


class AccessPoint(Base):
    __tablename__ = "access_points"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    stage_id = Column(Integer, ForeignKey("stages.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(200), nullable=False)
    address = Column(Text, default="")
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="access_points")
    stage = relationship("Stage", back_populates="access_points")
