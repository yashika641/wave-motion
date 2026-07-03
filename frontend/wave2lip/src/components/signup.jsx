import React, { useState } from "react";
import { signupWithEmail, googleSignup } from "../api/auth";

const Signup = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const user = await signupWithEmail(email, password);
      const token = await user.getIdToken();

      console.log("Signed up (email):", user);

      onSignupSuccess?.(user, token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const { user, token } = await googleSignup();

      console.log("Signed up (google):", user);

      onSignupSuccess?.(user, token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Create an Account</h2>

      {/* Email Signup */}
      <form onSubmit={handleEmailSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Sign Up</button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      {/* Google Signup */}
      <button onClick={handleGoogleSignup} style={{ padding: "10px 15px" }}>
        Sign Up with Google
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Signup;
