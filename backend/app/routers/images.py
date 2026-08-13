import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from ..auth import get_current_user
from ..config import settings
from ..models import User
from ..schemas import ImageUploadResponse

router = APIRouter(prefix="/images", tags=["images"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}


@router.post("/upload", response_model=ImageUploadResponse, status_code=201)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다")

    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    # 파일명 앞에 유저 id를 붙여 소유권 확인에 사용한다
    filename = f"{current_user.id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.upload_dir, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    return ImageUploadResponse(image_url=f"/images/{filename}")


@router.get("/{filename}")
def get_image(filename: str, current_user: User = Depends(get_current_user)):
    # 경로 조작 방지 + 본인 소유 파일인지 확인
    safe_name = os.path.basename(filename)
    if not safe_name.startswith(f"{current_user.id}_"):
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다")

    file_path = os.path.join(settings.upload_dir, safe_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다")

    return FileResponse(file_path)
