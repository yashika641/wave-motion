import uuid
from pathlib import Path

TMP_DIR = Path("tmp")
TMP_DIR.mkdir(exist_ok=True)

def save_upload_file(upload_file, prefix="file"):
    uid = uuid.uuid4().hex
    ext = Path(upload_file.filename).suffix or ""
    path = TMP_DIR / f"{prefix}_{uid}{ext}"
    with open(path, "wb") as f:
        f.write(upload_file.file.read())
    return str(path)
