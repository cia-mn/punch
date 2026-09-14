from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect

from . import models, database, schemas
from .routers import user_router, card_router
from .crud import get_user_by_phone, create_user, create_session
from .schemas import UserCreate

# Create database tables
models.Base.metadata.create_all(bind=database.engine)


def _ensure_card_design_column():
    """
    `models.Base.metadata.create_all()` зөвхөн ДУТУУ table-уудыг үүсгэдэг —
    аль хэдийн байгаа `users` table-д шинэ багана (card_design) автоматаар
    нэмдэггvй. Иймд эхлэх бvр шалгаад, дутуу бол ALTER TABLE-ээр нэмнэ.
    Энэ нь зөвхөн SQLite/Postgres-т аюулгvйгээр ажиллана (IF NOT EXISTS
    дэмждэггvй хуучин SQLite хувилбар байвал try/except-ээр хамгаалав).
    """
    inspector = inspect(database.engine)
    if "users" not in inspector.get_table_names():
        return  # create_all дөнгөж үvсгэсэн бол багана хэдийнээ орсон байна

    columns = [col["name"] for col in inspector.get_columns("users")]
    if "card_design" in columns:
        return

    with database.engine.connect() as conn:
        try:
            conn.execute(
                text(
                    "ALTER TABLE users ADD COLUMN card_design VARCHAR(20) DEFAULT 'neumorphic'"
                )
            )
            conn.commit()
            print("[migration] users.card_design багана нэмэгдлээ.")
        except Exception as e:
            # Багана аль хэдийн байгаа эсвэл өөр шалтгаанаар алдаа гарвал
            # апп унтрахгvйгээр лог хэвлээд үргэлжлүүлнэ.
            print(f"[migration] card_design багана нэмэхэд алдаа гарлаа (үл тоомсорлов): {e}")


_ensure_card_design_column()

app = FastAPI(title="Digital Business Card API", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://business-card-eight-ochre.vercel.app",  # Өмнөх screenshot дээрх Vercel URL
        "https://digital-business-card-orpin-psi.vercel.app",
        "*"  # Түр хугацаанд CORS алдааг бүрэн хаахын тулд (хэрэв хэрэгтэй бол)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router)
app.include_router(card_router)


# Auth endpoint
@app.post("/api/auth/login", response_model=schemas.LoginResponse)
async def login(
    payload: schemas.LoginRequest, 
    db: Session = Depends(database.get_db)  # SessionLocal-ийг Session болгож зассан
):
    phone = payload.phone
    user = get_user_by_phone(db, phone)

    if not user:
        user_create = UserCreate(phone=phone)
        user = create_user(db, user_create)

    session = create_session(db, user.id, expires_minutes=60 * 24 * 7)

    return {
        "token": session.token,
        "user": user
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Digital Business Card API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
