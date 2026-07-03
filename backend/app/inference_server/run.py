from flask import Flask, request, send_file
import torch, subprocess, uuid, os
from inference import run_wav2lip

app = Flask(__name__)

@app.route("/run-wav2lip", methods=["POST"])
def generate():
    uid = uuid.uuid4().hex
    img = f"/tmp/{uid}.jpg"
    aud = f"/tmp/{uid}.wav"
    out = f"/tmp/{uid}.mp4"

    request.files["image"].save(img)
    request.files["audio"].save(aud)

    run_wav2lip(img, aud, out)
    return send_file(out, mimetype="video/mp4")

if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0")
