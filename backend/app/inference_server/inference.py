import torch
import subprocess

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Running Wav2Lip on:", device)

CHECKPOINT = "wav2lip/checkpoints/wav2lip_gan.pth"

def run_wav2lip(image_path, audio_path, output_path):
    cmd = f"""
    python wav2lip/inference.py \
        --checkpoint_path {CHECKPOINT} \
        --face {image_path} \
        --audio {audio_path} \
        --outfile {output_path}
    """
    subprocess.call(cmd, shell=True)
