from gtts import gTTS
from pydub import AudioSegment
from pathlib import Path

def text_to_wav(text: str, out_wav_path: str, lang="en"):
    out_wav_path = Path(out_wav_path)
    tmp_mp3 = out_wav_path.with_suffix(".mp3")

    tts = gTTS(text=text, lang=lang)
    tts.save(str(tmp_mp3))

    audio = AudioSegment.from_mp3(str(tmp_mp3))
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(out_wav_path, format="wav")

    tmp_mp3.unlink(missing_ok=True)
    return str(out_wav_path)
