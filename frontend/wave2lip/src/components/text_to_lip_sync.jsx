import React, { useState } from "react";
import { auth } from "../firebase";
import { generateFromText } from "../api/client";

const TextToLipSync = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!image) {
      alert("Please upload an image.");
      return false;
    }
    if (!text.trim()) {
      alert("Please enter some text.");
      return false;
    }
    if (!image.type.startsWith("image/")) {
      alert("Uploaded file must be an image.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setLoading(true);
    setVideoUrl("");

    try {
      // Firebase Auth Token
      const token = await auth.currentUser.getIdToken(true);

      if (!token) {
        alert("You must be logged in with Google to use this feature.");
        setLoading(false);
        return;
      }

      // Call backend
      const result = await generateFromText(image, text, token);

      if (!result?.video_url) {
        throw new Error("Invalid server response: No video_url returned");
      }

      setVideoUrl(result.video_url);

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "6px" }}>
      <h2>📝 Text → Lip Sync Generator</h2>
      <p>Upload an image and enter text. We convert the text → audio → lipsynced video using Sync.so.</p>

      <form onSubmit={handleSubmit}>

        {/* Image input */}
        <label>Upload Image:</label> <br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <br /><br />

        {/* Text input */}
        <label>Enter Text:</label> <br />
        <textarea
          placeholder="Enter text to sync..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{ width: "300px" }}
          required
        />
        <br /><br />

        <button type="submit" disabled={loading} style={{ padding: "8px 18px", cursor: "pointer" }}>
          {loading ? "Generating..." : "Generate Video"}
        </button>
      </form>

      {loading && (
        <p style={{ marginTop: "20px" }}>
          ⏳ Please wait... Sync.so lipsync job usually takes 30–90 seconds.
        </p>
      )}

      {videoUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Video:</h3>
          <video src={videoUrl} controls width="400" autoPlay />
          <p>
            <a href={videoUrl} target="_blank" rel="noreferrer">Open Video in New Tab</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default TextToLipSync;
