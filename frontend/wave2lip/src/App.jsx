import React, { useState, useEffect } from "react";
import TextToLipSync from "./components/text_to_lip_sync";
import AudioToLipSync from "./components/audio_to_lip_sync";
import UploadWorkspace from "./components/upload";
import { auth } from "./firebase";
import Login from "./components/login";
import Signup from "./components/signup";

function App() {
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState("login"); // "login" or "signup"
  const [tab, setTab] = useState("workspace"); // or "text" or "audio"

  // Keep track of Firebase authenticated user
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  // ----------------------------------
  // If NOT LOGGED IN → Show LOGIN UI
  // ----------------------------------
  if (!user) {
    return (
      <div style={{ padding: "20px", maxWidth: "450px", margin: "auto" }}>
        <h1>AI Lip Sync Generator</h1>

        {authPage === "login" ? (
          <>
            <Login onLoginSuccess={(u) => setUser(u)} />
            <p>
              Don’t have an account?{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => setAuthPage("signup")}
              >
                Sign Up
              </span>
            </p>
          </>
        ) : (
          <>
            <Signup onSignupSuccess={(u) => setUser(u)} />
            <p>
              Already have an account?{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => setAuthPage("login")}
              >
                Login
              </span>
            </p>
          </>
        )}
      </div>
    );
  }

  // ----------------------------------
  // LOGGED-IN UI
  // ----------------------------------
  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Lip Sync Generator</h1>
      <p>Welcome, {user.email} 👋</p>

      {/* Logout Button */}
      <button
        onClick={() => auth.signOut()}
        style={{
          padding: "8px 12px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* ---------------------------
        TABS (Workspace, Text, Audio)
      ------------------------------*/}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setTab("workspace")}
          style={{
            padding: "10px 15px",
            marginRight: "10px",
            background: tab === "workspace" ? "#333" : "#ccc",
            color: tab === "workspace" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          Upload Workspace
        </button>

        <button
          onClick={() => setTab("text")}
          style={{
            padding: "10px 15px",
            marginRight: "10px",
            background: tab === "text" ? "#333" : "#ccc",
            color: tab === "text" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          Text → Lip Sync
        </button>

        <button
          onClick={() => setTab("audio")}
          style={{
            padding: "10px 15px",
            background: tab === "audio" ? "#333" : "#ccc",
            color: tab === "audio" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          Audio → Lip Sync
        </button>
      </div>

      {/* -------------------------------------
        PAGE CONTENT BASED ON ACTIVE TAB
      --------------------------------------*/}

      {tab === "workspace" && <UploadWorkspace />}
      {tab === "text" && <TextToLipSync />}
      {tab === "audio" && <AudioToLipSync />}
    </div>
  );
}

export default App;
