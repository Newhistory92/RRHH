'use client';

import { useState, useEffect, CSSProperties } from 'react';
import Script from 'next/script';
import styles from '@/app/Componentes/LoginForm/Loading.module.css';

interface VismeFormAttributes {
  'data-title': string;
  'data-url': string;
  'data-domain': string;
  'data-full-page': string;
  'data-min-height': string;
  'data-form-id': string;
}

interface LoadingState {
  isLoading: boolean;
  scriptReady: boolean;
}

export default function LoginPage() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    scriptReady: false
  });

  useEffect(() => {
    if (loadingState.scriptReady) {
      const timer = setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loadingState.scriptReady]);

  const handleScriptLoad = (): void => {
    setLoadingState(prev => ({ ...prev, scriptReady: true }));
  };

  const handleScriptError = (): void => {
    console.error('Error loading Visme form');
    setLoadingState(prev => ({ ...prev, isLoading: false }));
  };

  const containerStyle: CSSProperties = {
    margin: 0,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f0f0f0',
    position: 'relative'
  };

  const loadingOverlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    opacity: loadingState.isLoading ? 1 : 0,
    pointerEvents: loadingState.isLoading ? 'auto' : 'none',
    transition: 'opacity 0.5s ease-out'
  };

  const formContainerStyle: CSSProperties = {
    minHeight: '200px',
    width: '100%'
  };

  const vismeFormAttributes: VismeFormAttributes = {
    'data-title': 'Webinar Registration Form',
    'data-url': 'g7ddqxx0-untitled-project?fullPage=true',
    'data-domain': 'forms',
    'data-full-page': 'true',
    'data-min-height': '100vh',
    'data-form-id': '133190'
  };

  return (
    <>
      <Script
        src="https://static-bundles.visme.co/forms/vismeforms-embed.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />

      <div style={containerStyle}>
        {/* Loading Screen con fade out */}
        <div style={loadingOverlayStyle}>
          <div className={styles.container}>
            <div className={styles.divider} aria-hidden="true"></div>
            <p className={styles.loadingText} aria-label="Loading">
              <span className={styles.letter} aria-hidden="true">L</span>
              <span className={styles.letter} aria-hidden="true">o</span>
              <span className={styles.letter} aria-hidden="true">a</span>
              <span className={styles.letter} aria-hidden="true">d</span>
              <span className={styles.letter} aria-hidden="true">i</span>
              <span className={styles.letter} aria-hidden="true">n</span>
              <span className={styles.letter} aria-hidden="true">g</span>
            </p>
          </div>
        </div>

        {/* Visme Login Form */}
        <div 
          className="visme_d" 
          {...vismeFormAttributes}
          style={formContainerStyle}
        />
      </div>
    </>
  );
}