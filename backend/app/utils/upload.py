import os
import shutil
import uuid
from fastapi import UploadFile, HTTPException
from app.core.config import settings

def save_upload_file(upload_file: UploadFile, subdir: str = "") -> str:
    _, ext = os.path.splitext(upload_file.filename)
    allowed_exts = [e.strip() for e in settings.ALLOWED_EXTENSIONS.split(",")]
    
    if ext.lower() not in allowed_exts:
        raise HTTPException(status_code=400, detail="Invalid file extension")
    
    # Validation against MAX_UPLOAD_SIZE typically handled via streaming or middleware,
    # but could be handled progressively here if necessary.
    
    upload_dir = os.path.join(settings.UPLOAD_DIR, subdir)
    os.makedirs(upload_dir, exist_ok=True)
    
    safe_filename = f"{uuid.uuid4()}{ext.lower()}"
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path
