from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..utils import get_client_ip, parse_user_agent, get_location_from_ip

router = APIRouter(prefix="/api/card", tags=["card"])

@router.get("/qr-design", response_model=schemas.QRDesignResponse)
async def get_qr_design(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    qr_design = crud.get_qr_design_by_user(db, current_user.id)
    if not qr_design:
        qr_create = schemas.QRDesignCreate(user_id=current_user.id)
        qr_design = crud.create_qr_design(db, qr_create)
    return qr_design

@router.put("/qr-design", response_model=schemas.QRDesignResponse)
async def update_qr_design(
    qr_update: schemas.QRDesignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    qr_design = crud.update_qr_design(db, current_user.id, qr_update)
    if not qr_design:
        qr_create = schemas.QRDesignCreate(user_id=current_user.id, **qr_update.dict(exclude_unset=True))
        qr_design = crud.create_qr_design(db, qr_create)
    return qr_design

@router.get("/vcf")
async def download_vcf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vcf_content = crud.generate_vcf(current_user)
    return {
        "content": vcf_content,
        "filename": f"{current_user.name or 'contact'}.vcf"
    }

@router.get("/text")
async def get_text_content(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text_content = crud.generate_text_content(current_user)
    return {"content": text_content}


@router.post("/{user_id}/track")
async def track_card_event(
    user_id: int,
    payload: schemas.TrackEventRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Нийтэд нээлттэй (AUTH ШААРДАХГVЙ) endpoint — /c/[id] хуудаснаас QR
    уншуулалт болон товч дарсан vйлдлийг бvртгэнэ. Frontend-ийн
    `trackCardEvent()` энд дуудагдана.

    Картын эзэн олдохгvй тохиолдолд ч зочны хуудсыг тасалдуулахгvйн тулд
    алдаа биш "ignored" төлөв буцаана.
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        return {"status": "ignored"}

    ip = get_client_ip(request)
    device, browser = parse_user_agent(payload.user_agent or "")
    location = get_location_from_ip(ip)

    if payload.type == "scan":
        crud.create_scan_event(
            db,
            user_id=user_id,
            ip_address=ip,
            location=location,
            device=device,
            browser=browser,
            referrer=payload.referrer,
        )
    elif payload.type == "click":
        crud.create_click_event(
            db,
            user_id=user_id,
            label=payload.label or "unknown",
            href=payload.href,
            ip_address=ip,
            location=location,
            device=device,
        )

    return {"status": "ok"}


@router.get("/analytics", response_model=schemas.CardAnalyticsSummary)
async def get_card_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Нэвтэрсэн хэрэглэгчийн ӨӨРИЙН картын статистикийг буцаана."""
    return crud.get_analytics_summary(db, current_user.id)