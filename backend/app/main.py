from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uuid
import shutil
import torch

# -------- Internal Modules --------
from .tts import text_to_wav
from .supabse_client import upload_user_file, save_user_profile
from .wav2lip_client import run_wav2lip     
from .auth import verify_firebase_token
from .image_to_video import generate_motion_video      # <-- MagicAnimate module

# ============================================================
# CONFIGURATION
# ============================================================
TMP = Path("tmp")
TMP.mkdir(exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Backend Running 👍"}



# ============================================================
# 1️⃣ TEXT → (Image → Motion Video → Wav2Lip)
# ============================================================
@app.post("/generate-from-text")
async def generate_from_text(
    image: UploadFile = File(...),
    text: str = Form(...),
    authorization: str = Header(None),
):

    # ---------- Authentication ----------
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.replace("Bearer ", "")
    user = verify_firebase_token(token)
    uid = user["uid"]

    # ---------- Temp paths ----------
    tmp_id = uuid.uuid4().hex
    img_path = TMP / f"{tmp_id}_{image.filename}"
    wav_path = TMP / f"{tmp_id}.wav"
    motion_video_path = TMP / f"{tmp_id}_motion.mp4"
    output_path = TMP / f"{tmp_id}_result.mp4"

    # ---------- Save input image ----------
    with open(img_path, "wb") as f:
        f.write(await image.read())

    # ---------- Convert Text → Audio ----------
    text_to_wav(text, wav_path)

    # ---------- Upload Inputs (Optional Logging) ----------
    upload_user_file(str(img_path), uid, "image")
    upload_user_file(str(wav_path), uid, "audio")

    # ----------------------------------------------------
    # STEP 1: LivePortrait — Generate a motion video
    # ----------------------------------------------------
    try:
        from .image_to_video import generate_motion_video
        generate_motion_video(str(img_path), str(motion_video_path))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LivePortrait Motion Generation Failed: {str(e)}"
        )

    # ----------------------------------------------------
    # STEP 2: Wav2Lip — Sync Lips with Generated Audio
    # ----------------------------------------------------
    try:
        final_video_path = run_wav2lip(
            face_path=str(motion_video_path),
            audio_path=str(wav_path),
            output_path=str(output_path)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Wav2Lip Failed: {str(e)}"
        )

    # ---------- Upload Final Video ----------
    video_url = upload_user_file(final_video_path, uid, "video")

    return {"video_url": video_url}




# ============================================================
# 2️⃣ AUDIO → (Image → Motion Video → Wav2Lip)
# ============================================================
@app.post("/generate-from-audio")
async def generate_from_audio(
    image: UploadFile = File(...),
    audio: UploadFile = File(...),
    authorization: str = Header(None)
):

    # ---------- Authentication ----------
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.replace("Bearer ", "")
    user = verify_firebase_token(token)
    uid = user["uid"]

    # ---------- Temp paths ----------
    tmp_id = uuid.uuid4().hex
    img_path = TMP / f"{tmp_id}_{image.filename}"
    audio_path = TMP / f"{tmp_id}_{audio.filename}"
    motion_video_path = TMP / f"{tmp_id}_motion.mp4"
    output_path = TMP / f"{tmp_id}_result.mp4"

    # ---------- Save files ----------
    with open(img_path, "wb") as f:
        f.write(await image.read())

    with open(audio_path, "wb") as f:
        f.write(await audio.read())

    # ---------- Upload inputs ----------
    upload_user_file(str(img_path), uid, "image")
    upload_user_file(str(audio_path), uid, "audio")

    # ----------------------------------------------------
    # STEP 1: MagicAnimate — Create motion video
    # ----------------------------------------------------
    try:
        generate_motion_video(str(img_path), str(motion_video_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MagicAnimate failed: {str(e)}")

    # ----------------------------------------------------
    # STEP 2: Wav2Lip — Sync lips
    # ----------------------------------------------------
    try:
        final_video_path = run_wav2lip(
            face_path=str(motion_video_path),
            audio_path=str(audio_path),
            output_path=str(output_path)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wav2Lip failed: {str(e)}")

    # ---------- Upload output ----------
    video_url = upload_user_file(final_video_path, uid, "video")

    return {"video_url": video_url}



# ============================================================
# 3️⃣ UPLOAD PROFILE
# ============================================================
@app.post("/auth/upload-profile")
async def upload_profile(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "")
    user = verify_firebase_token(token)
    uid = user["uid"]

    temp_path = TMP / f"profile_{uid}_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    profile_url = upload_user_file(str(temp_path), uid, "profile")

    save_user_profile(uid, profile_image=profile_url)

    return {"profile_url": profile_url}



# ============================================================
# 4️⃣ VERIFY USER
# ============================================================
@app.post("/auth/verify")
async def verify_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing header")

    token = authorization.replace("Bearer ", "")
    user = verify_firebase_token(token)

    save_user_profile(
        user["uid"],
        email=user.get("email"),
        name=user.get("name") or "",
    )

    return {"status": "verified", "user": user}
