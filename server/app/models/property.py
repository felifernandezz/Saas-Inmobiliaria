from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    address: Mapped[str] = mapped_column(String, index=True)
    features: Mapped[str] = mapped_column(Text)
    vibe: Mapped[str | None] = mapped_column(String, nullable=True) # <--- NUEVA COLUMNA
    generated_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="properties")