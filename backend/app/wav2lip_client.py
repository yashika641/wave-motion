import os
import subprocess
from pathlib import Path

# CORRECT: Wav2Lip folder is inside backend/, not backend/app/
BASE_DIR = Path(__file__).resolve().parent.parent / "Wav2Lip"

CHECKPOINT = BASE_DIR / "checkpoints" / "wav2lip.pth"

def run_wav2lip(face_path: str, audio_path: str, output_path: str):
    """
    Runs local Wav2Lip inference and returns output video path.
    """

    command = [
        "python",
        str(BASE_DIR / "inference.py"),
        "--checkpoint_path", str(CHECKPOINT),
        "--face", face_path,
        "--audio", audio_path,
        "--outfile", output_path,
        "--static","True" # to handle static images better
    ]

    print("🔥 Running Wav2Lip:")
    print(" ".join(command))

    process = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    if process.returncode != 0:
        print("❌ Wav2Lip FAILED")
        print("----- STDERR -----")
        print(process.stderr)
        print("----- STDOUT -----")
        print(process.stdout)
        raise Exception("Wav2Lip failed")
    else:
        print("✅ Wav2Lip Completed Successfully!")
        print("----- STDOUT -----")
        print(process.stdout)

    return output_path
