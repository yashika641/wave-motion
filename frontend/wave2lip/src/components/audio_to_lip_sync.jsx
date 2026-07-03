import React, { useState } from "react";
import { auth } from "../firebase"; 
import { generateFromAudio } from "../api/client";

const AudioToLipSync = () => {
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const validateFiles = () => {
    if (!image || !audio) {
      alert("Please upload both image and audio.");
      return false;
    }
    if (!image.type.startsWith("image/")) {
      alert("File 1 must be an image.");
      return false;
    }
    if (!audio.type.startsWith("audio/")) {
      alert("File 2 must be an audio file.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFiles()) return;

    setLoading(true);
    setVideoUrl("");

    try {
      // Get Firebase ID Token
      const token = await auth.currentUser.getIdToken(true);
      if (!token) {
        alert("You must be logged in with Google!");
        setLoading(false);
        return;
      }

      // Make API request
      const result = await generateFromAudio(image, audio, token);

      if (!result?.video_url) throw new Error("Invalid server response");

      setVideoUrl(result.video_url);

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "6px" }}>
      <h2>🎵 Audio → Lip Sync Generator</h2>
      <p>Upload an image + audio file and get a Sync.so lipsynced video.</p>

      <form onSubmit={handleSubmit}>
        <label>Upload Image:</label><br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <br /><br />

        <label>Upload Audio:</label><br />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files[0])}
          required
        />
        <br /><br />

        <button type="submit" disabled={loading} style={{ padding: "8px 18px", cursor: "pointer" }}>
          {loading ? "Generating..." : "Generate Video"}
        </button>
      </form>

      {loading && (
        <p style={{ marginTop: "20px" }}>
          ⏳ Your request is processing. Sync.so job may take 30–90 seconds...
        </p>
      )}

      {videoUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Video:</h3>
          <video src={videoUrl} controls width="400" autoPlay />
          <p>
            <a href={videoUrl} target="_blank" rel="noreferrer">Open in new tab</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioToLipSync;
