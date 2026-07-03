from supabase import create_client
from pathlib import Path
import os
from dotenv import load_dotenv
import uuid
import mimetypes
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)



def upload_user_file(file_path: str, uid: str, file_type: str) -> str:
    """
    Uploads a file to Supabase Storage with correct MIME type.
    Saves file in a folder for that user.
    """

    file_path = Path(file_path)

    # EXTRACT MIME TYPE (image/jpeg, audio/wav)
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if mime_type is None:
        mime_type = "application/octet-stream"  # fallback

    # storage path: bucket / uid / filename
    dest_path = f"{uid}/{file_path.name}"

    # upload
    with open(file_path, "rb") as f:
        supabase.storage.from_(BUCKET).upload(
            dest_path,
            f,
            {
                "content-type": mime_type,
                "x-upsert": "true"
            }
        )

    # return public url
    public_url = supabase.storage.from_(BUCKET).get_public_url(dest_path)
    return public_url


def save_user_profile(uid, email=None, name=None, profile_image=None):
    data = {"uid": uid}

    if email:
        data["email"] = email
    if name:
        data["name"] = name
    if profile_image:
        data["profile_image_url"] = profile_image

    supabase.table("users").upsert(data).execute()
