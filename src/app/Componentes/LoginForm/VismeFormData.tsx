'use client';

import { useState, useEffect, useRef, CSSProperties } from 'react';
import styles from './Loading.module.css';

interface VismeFormData {
  title: string;
  url: string;
  domain: string;
  fullPage: boolean;
  minHeight: string;
  formId: string;
}

interface VismeLoginFormProps {
  formData?: VismeFormData;
  loadingDuration?: number;
  backgroundColor?: string;
}

const defaultFormData: VismeFormData = {
  title: 'Webinar Registration Form',
  url: 'g7ddqxx0-untitled-project?fullPage=true',
  domain: 'forms',
  fullPage: true,
  minHeight: '100vh',
  formId: '133190'
};

export default function VismeLoginForm({ 
  formData = defaultFormData, 
  loadingDuration = 1500,
  backgroundColor = '#f0f0f0'
}: VismeLoginFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scriptLoaded = useRef<boolean>(false);

  useEffect(() => {
    // Evitar cargar el script múltiples veces
    if (scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://static-bundles.visme.co/forms/vismeforms-embed.js';
    script.async = true;

    script.onload = () => {
      scriptLoaded.current = true;
      setTimeout(() => {
        setIsLoading(false);
      }, loadingDuration);
    };

    script.onerror = () => {
      console.error('Error loading Visme form script');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [loadingDuration]);

  const containerStyle: CSSProperties = {
    margin: 0,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: backgroundColor,
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
    transition: 'opacity 0.3s ease-out'
  };

  const formContainerStyle: CSSProperties = {
    minHeight: '200px',
    width: '100%',
    opacity: isLoading ? 0 : 1,
    transition: 'opacity 0.5s ease-in'
  };

  return (
    <div style={containerStyle}>
      {/* Loading Screen */}
      {isLoading && (
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
      )}

      {/* Visme Form Container */}
      <div 
        className="visme_d" 
        data-title={formData.title}
        data-url={formData.url}
        data-domain={formData.domain}
        data-full-page={formData.fullPage.toString()}
        data-min-height={formData.minHeight}
        data-form-id={formData.formId}
        style={formContainerStyle}
      />
    </div>
  );
}