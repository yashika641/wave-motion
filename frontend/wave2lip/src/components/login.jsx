import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [error, setError] = useState("");

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      console.log("ID TOKEN:", token);
      onLogin(token, result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <button onClick={googleLogin} className="google-btn">
        Sign in with Google
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
