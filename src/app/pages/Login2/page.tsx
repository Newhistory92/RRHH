'use client';

import { useState, FormEvent } from 'react';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);

  const handleSignUp = (e: FormEvent) => {
    e.preventDefault();
    setIsActive(true);
  };

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    setIsActive(false);
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Login submitted');
    // Aquí puedes agregar tu lógica de login
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Register submitted');
    // Aquí puedes agregar tu lógica de registro
  };

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.container} ${isActive ? styles.active : ''}`}>
        <div className={styles.curvedShape}></div>
        <div className={styles.curvedShape2}></div>

        {/* Login Form */}
        <div className={`${styles.formBox} ${styles.login}`}>
          <h2 className={styles.animation} style={{ '--D': 0, '--S': 21 } as React.CSSProperties}>
            Login
          </h2>
          <form onSubmit={handleLoginSubmit}>
            <div className={styles.inputBox} style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
              <input type="text" required />
              <label>Username</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>

            <div className={styles.inputBox} style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
              <input type="password" required />
              <label>Password</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>

            <div className={styles.inputBox} style={{ '--D': 3, '--S': 24 } as React.CSSProperties}>
              <button className={styles.btn} type="submit">Login</button>
            </div>

            <div className={styles.regiLink} style={{ '--D': 4, '--S': 25 } as React.CSSProperties}>
              <p>
                Don&apos;t have an account? <br />
                <a href="#" onClick={handleSignUp}>Sign Up</a>
              </p>
            </div>
          </form>
        </div>

        {/* Login Info */}
        <div className={`${styles.infoContent} ${styles.loginInfo}`}>
          <h2 className={styles.animation} style={{ '--D': 0, '--S': 20 } as React.CSSProperties}>
            WELCOME BACK!
          </h2>
          <p className={styles.animation} style={{ '--D': 1, '--S': 21 } as React.CSSProperties}>
            We are happy to have you with us again. If you need anything, we are here to help.
          </p>
        </div>

        {/* Register Form */}
        <div className={`${styles.formBox} ${styles.register}`}>
          <h2 className={styles.animation} style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
            Register
          </h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className={styles.inputBox} style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
              <input type="text" required />
              <label>Username</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>

            <div className={styles.inputBox} style={{ '--li': 19, '--S': 2 } as React.CSSProperties}>
              <input type="email" required />
              <label>Email</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>

            <div className={styles.inputBox} style={{ '--li': 19, '--S': 3 } as React.CSSProperties}>
              <input type="password" required />
              <label>Password</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>

            <div className={styles.inputBox} style={{ '--li': 20, '--S': 4 } as React.CSSProperties}>
              <button className={styles.btn} type="submit">Register</button>
            </div>

            <div className={styles.regiLink} style={{ '--li': 21, '--S': 5 } as React.CSSProperties}>
              <p>
                Already have an account? <br />
                <a href="#" onClick={handleSignIn}>Sign In</a>
              </p>
            </div>
          </form>
        </div>

        {/* Register Info */}
        <div className={`${styles.infoContent} ${styles.registerInfo}`}>
          <h2 className={styles.animation} style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
            WELCOME!
          </h2>
          <p className={styles.animation} style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
            We&apos;re delighted to have you here. If you need any assistance, feel free to reach out.
          </p>
        </div>
      </div>
    </div>
  );
}