from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    address: Mapped[str] = mapped_column(String, index=True)
    # Guardaremos los datos "crudos" (m2, baños, etc) como un texto o JSON
    features: Mapped[str] = mapped_column(Text) 
    # Aquí guardaremos el texto generado por la IA
    generated_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Clave foránea al dueño (User)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="properties")