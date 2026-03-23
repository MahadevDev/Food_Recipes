import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add password reset logic here
    setSubmitted(true);
  };

  return (
    <div className="forgot-password-container">
      {submitted ? (
        <div className="success-message">
          <h2>Email Sent!</h2>
          <p>Check your email for password reset instructions.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>
          <p>Enter your email address to receive password reset instructions.</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
