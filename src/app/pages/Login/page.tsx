'use client';

import { useState, FormEvent } from 'react';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);

  const handleSignUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsActive(true);
  };

  const handleSignInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
        <div className={`${styles.formBox} ${styles.Login}`}>
          <h2 className={styles.animation} style={{ '--D': 0, '--S': 21 } as React.CSSProperties}>
            Accede a tu cuenta
          </h2>
          <form onSubmit={handleLoginSubmit}>
            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
              <input type="text" required />
              <label>Usuario</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>

            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
              <input type="password" required />
              <label>Contraseña</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>

            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--D': 3, '--S': 24 } as React.CSSProperties}>
              <button className={styles.btn} type="submit">Acceso</button>
            </div>

            <div className={`${styles.regiLink} ${styles.animation}`} style={{ '--D': 4, '--S': 25 } as React.CSSProperties}>
              <p>
               ¿No tienes una cuenta? <br />
                <a href="#" className={styles.SignUpLink} onClick={handleSignUpClick}>Regístrate</a>
              </p>
            </div>
          </form>
        </div>

        {/* Login Info */}
        <div className={`${styles.infoContent} ${styles.Login}`}>
          <h2 className={styles.animation} style={{ '--D': 0, '--S': 20 } as React.CSSProperties}>
            ¡BIENVENIDO DE NUEVO!
          </h2>
          <p className={styles.animation} style={{ '--D': 1, '--S': 21 } as React.CSSProperties}>
            Nos alegra tenerte con nosotros nuevamente. Si necesitas algo, estamos aquí para ayudar.
          </p>
        </div>

        {/* Register Form */}
        <div className={`${styles.formBox} ${styles.Register}`}>
          <h2 className={styles.animation} style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
            Regístrate
          </h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
              <input type="text" required />
              <label>Usuario</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>

            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--li': 19, '--S': 2 } as React.CSSProperties}>
              <input type="email" required />
              <label>Email</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>

            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--li': 19, '--S': 3 } as React.CSSProperties}>
              <input type="password" required />
              <label>Contraseña</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>

            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--li': 20, '--S': 4 } as React.CSSProperties}>
              <button className={styles.btn} type="submit">Regístrate</button>
            </div>

            <div className={`${styles.regiLink} ${styles.animation}`} style={{ '--li': 21, '--S': 5 } as React.CSSProperties}>
              <p>
                ¿Ya tienes una cuenta? <br />
                <a href="#" className={styles.SignInLink} onClick={handleSignInClick}>Accede</a>
              </p>
            </div>
          </form>
        </div>

        {/* Register Info */}
        <div className={`${styles.infoContent} ${styles.Register}`}>
          <h2 className={styles.animation} style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
            ¡BIENVENIDO!
          </h2>
          <p className={styles.animation} style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
            Nos complace tenerle aquí. Si necesita cualquier tipo de ayuda, no dude en contactarnos.
          </p>
        </div>
      </div>
    </div>
  );
}