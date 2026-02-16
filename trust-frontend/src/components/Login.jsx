import React, { useState } from 'react';
import { Phone, Eye, EyeOff } from 'lucide-react';
import { styles } from '../utils/styles';

export default function Login({ onLogin, language, setLanguage, t }) {
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    onLogin(loginPhone, loginPassword);
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <div style={styles.loginHeader}>
          <div style={styles.templeIcon}>🕉️</div>
          <h1 style={styles.loginTitle}>{t.appTitle}</h1>
          <div style={styles.languageSelector}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={styles.languageSelect}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
        </div>

        <div style={styles.loginForm}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t.phoneNumber}</label>
            <div style={styles.inputWithIcon}>
              <Phone size={20} style={styles.inputIcon} />
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={styles.input}
                placeholder="Enter 10 digit number"
                maxLength={10}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t.password}</label>
            <div style={styles.inputWithIcon}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} style={styles.loginButton}>
            {t.loginButton}
          </button>

          <div style={styles.loginHint}>
            Admin: 1234567890 / 1234567890 | Member: 9876543210 / 9876543210
          </div>
        </div>
      </div>
    </div>
  );
}
