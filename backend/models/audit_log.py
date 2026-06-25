from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .campaign import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    method = Column(String(10), nullable=False)
    path = Column(String(500), nullable=False)
    status_code = Column(Integer, nullable=True)
    client_ip = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "method": self.method,
            "path": self.path,
            "status_code": self.status_code,
            "client_ip": self.client_ip,
            "created_at": str(self.created_at) if self.created_at else None,
        }
