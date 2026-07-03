import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import {
  generateFromText,
  generateFromAudio,
  getJobStatus,
  getJobLogs,
  getJobResult,
} from "../api/client";

const UploadWorkspace = () => {
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [text, setText] = useState("");

  const [previewImg, setPreviewImg] = useState("");
  const [previewAud, setPreviewAud] = useState("");

  const [videoUrl, setVideoUrl] = useState("");
  const [logs, setLogs] = useState([]);
  const [jobId, setJobId] = useState(null);

  const [loading, setLoading] = useState(false);

  const logIndexRef = useRef(0);
  const pollIntervalRef = useRef(null);

  const resetOutput = () => {
    setVideoUrl("");
    setLogs([]);
    setJobId(null);
    logIndexRef.current = 0;
  };

  // -------------------------------------------
  // File Handlers
  // -------------------------------------------
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    setImage(file);
    setPreviewImg(URL.createObjectURL(file));
    resetOutput();
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("Please upload a valid audio file.");
      return;
    }

    setAudio(file);
    setPreviewAud(URL.createObjectURL(file));
    resetOutput();
  };

  // -------------------------------------------
  // POLLING LOGIC
  // -------------------------------------------
  const startPolling = (jobId) => {
    // Clear old interval if any
    clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        // 1) Fetch logs
        const logData = await getJobLogs(jobId, logIndexRef.current);
        if (logData.logs.length > 0) {
          setLogs((prev) => [...prev, ...logData.logs]);
          logIndexRef.current = logData.next_index;
        }

        // 2) Job status
        const status = await getJobStatus(jobId);

        if (status.status === "finished") {
          clearInterval(pollIntervalRef.current);
          const video = await getJobResult(jobId);
          setVideoUrl(video);
          setLoading(false);
        }

        if (status.status === "failed") {
          clearInterval(pollIntervalRef.current);
          setLoading(false);
          alert("Job failed: " + status.error);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  };

  // -------------------------------------------
  // SUBMIT TEXT → GPU PIPELINE
  // -------------------------------------------
  const handleTextSubmit = async (e) => {
    e.preventDefault();

    if (!image || !text.trim()) {
      return alert("Upload image and enter text first!");
    }

    resetOutput();
    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        alert("You must be logged in!");
        setLoading(false);
        return;
      }

      const job = await generateFromText(image, text, token);
      setJobId(job.job_id);

      startPolling(job.job_id);
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  // -------------------------------------------
  // SUBMIT AUDIO → GPU PIPELINE
  // -------------------------------------------
  const handleAudioSubmit = async (e) => {
    e.preventDefault();

    if (!image || !audio) {
      return alert("Upload image and audio first!");
    }

    resetOutput();
    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        alert("You must be logged in!");
        setLoading(false);
        return;
      }

      const job = await generateFromAudio(image, audio, token);
      setJobId(job.job_id);

      startPolling(job.job_id);
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => clearInterval(pollIntervalRef.current);
  }, []);

  return (
    <div style={{ padding: "20px", marginTop: "20px" }}>
      <h2>📤 Upload Workspace</h2>
      <p>Upload your files and generate lip-synced videos using the GPU pipeline.</p>

      {/* UPLOAD ROW */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        
        {/* IMAGE */}
        <div>
          <h3>1️⃣ Upload Image</h3>
          <input type="file" accept="image/*" onChange={handleImageSelect} />
          {previewImg && (
            <img
              src={previewImg}
              alt="preview"
              width="180"
              style={{ marginTop: "10px", borderRadius: "10px", border: "1px solid #ccc" }}
            />
          )}
        </div>

        {/* AUDIO */}
        <div>
          <h3>2️⃣ Upload Audio (optional)</h3>
          <input type="file" accept="audio/*" onChange={handleAudioSelect} />
          {previewAud && (
            <audio controls src={previewAud} style={{ marginTop: "10px" }} />
          )}
        </div>

        {/* TEXT */}
        <div>
          <h3>3️⃣ Enter Text (optional)</h3>
          <textarea
            placeholder="Enter text to generate speech…"
            rows={5}
            style={{ width: "200px" }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* BUTTONS */}
      <div style={{ marginTop: "30px" }}>
        <button
          disabled={loading || !image || !text.trim()}
          onClick={handleTextSubmit}
          style={{ padding: "10px 20px", marginRight: "10px" }}
        >
          📝 Generate from Text
        </button>

        <button
          disabled={loading || !image || !audio}
          onClick={handleAudioSubmit}
          style={{ padding: "10px 20px" }}
        >
          🎵 Generate from Audio
        </button>

        {loading && <p style={{ marginTop: "15px" }}>⏳ Processing on GPU…</p>}
      </div>

      {/* LOG VIEWER */}
      {logs.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            background: "#111",
            color: "#0f0",
            padding: "10px",
            borderRadius: "8px",
            maxHeight: "250px",
            overflowY: "scroll",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          {logs.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}

      {/* VIDEO OUTPUT */}
      {videoUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>🎬 Generated Video</h3>
          <video src={videoUrl} controls width="400" autoPlay />
          <p>
            <a href={videoUrl} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadWorkspace;
