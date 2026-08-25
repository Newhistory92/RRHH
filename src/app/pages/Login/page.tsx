'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { registerSchema } from "@/app/util/authValidation";
import styles from './AuthPage.module.css';
import { Toast } from 'primereact/toast';
import { loginUser } from '@/app/util/auth';
import { Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export default function AuthPage() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassLogin, setVerPassLogin] = useState(false);
  const [verPassRegistro, setVerPassRegistro] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    usuario?: string;
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    usuario: boolean;
    email: boolean;
    password: boolean;
  }>({
    usuario: false,
    email: false,
    password: false
  });

  const toast = useRef<Toast>(null);
  const validationTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSignUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsActive(true);
    // Limpiar errores al cambiar de formulario
    setFieldErrors({});
    setTouched({ usuario: false, email: false, password: false });

    toast.current?.show({
      severity: 'info',
      summary: 'El registro no está habilitado',
      detail: 'Las cuentas las crea el área de Sistemas. Comunicate con Sistemas para que te den de alta.',
      life: 6000,
    });
  };

  const handleSignInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsActive(false);
    setFieldErrors({});
    setTouched({ usuario: false, email: false, password: false });
  };

  // Validación en tiempo real con debounce
  useEffect(() => {
    if (!isActive) return; // Solo validar en el formulario de registro

    // Solo validar si al menos un campo ha sido tocado
    if (!touched.usuario && !touched.email && !touched.password) {
      return;
    }

    if (validationTimeout.current) {
      clearTimeout(validationTimeout.current);
    }

    validationTimeout.current = setTimeout(() => {
      const data = { usuario, email, password };
      const result = registerSchema.safeParse(data);

      if (!result.success) {
        const errors: { usuario?: string; email?: string; password?: string } = {};
        result.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          // Solo mostrar error si el campo ha sido tocado
          if (touched[field as keyof typeof touched] && !errors[field as keyof typeof errors]) {
            errors[field as keyof typeof errors] = err.message;
          }
        });
        setFieldErrors(errors);
      } else {
        setFieldErrors({});
      }
    }, 1000); // 1 segundo de delay para validación

    return () => {
      if (validationTimeout.current) {
        clearTimeout(validationTimeout.current);
      }
    };
  }, [usuario, email, password, isActive, touched]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // 🔥 Llamamos la función centralizada
      const data = await loginUser(usuario, password);

      // Guardar en localStorage los datos del usuario
      localStorage.setItem("token", data.access_token || "");
      localStorage.setItem("roleName", data.roleName || "");
      localStorage.setItem("employeeId", data.employeeId || "");
      localStorage.setItem("usuario", data.usuario || "");
      localStorage.setItem("permisos", JSON.stringify(data.permisos ?? []));

      // Mostrar toast de éxito
      toast.current?.show({
        severity: "success",
        summary: "Inicio de sesión exitoso",
        detail: `¡Bienvenido ${data.usuario}!`,
        life: 2000,
      });

      // Redirigir después de 1 segundo
      setTimeout(() => {
        router.push("/");
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error al iniciar sesión:", error);

      toast.current?.show({
        severity: "error",
        summary: "Error de autenticación",
        detail:
          error.message === "Login fallido"
            ? "Usuario o contraseña incorrectos"
            : "No se pudo conectar con el servidor",
        life: 3000,
      });
    }
  };



  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const data = { usuario, email, password };

    // ✅ Validar con Zod antes del POST
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      const errors: { usuario?: string; email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!errors[field as keyof typeof errors]) {
          errors[field as keyof typeof errors] = err.message;
        }
      });
      setFieldErrors(errors);

      toast.current?.show({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Por favor, corrige los errores en el formulario',
        life: 3000
      });
      return;
    }

    // El alta de usuarios se hace únicamente desde el panel de administración
    // (POST /users/employee, restringido a administradores en el backend).
    //
    // Esta llamada a POST /users/register queda deshabilitada SOLO acá, en el
    // frontend: es una mitigación parcial, no un cierre del hueco de seguridad.
    // El endpoint en el backend (Backend_RRHH/app/routes/user.py) sigue sin
    // ninguna autenticación y todavía puede invocarse directo (por ejemplo con
    // curl) para crear una cuenta. Falta una tarea de backend que proteja ese
    // endpoint con algún tipo de autorización solo-admin, siguiendo el mismo
    // patrón que ya restringe POST /users/employee en el mismo archivo.
    //
    // try {
    //   const response = await fetch(`${BACKEND_URL}/users/register`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });
    //   ...
    // } catch (error) { ... }

    toast.current?.show({
      severity: 'info',
      summary: 'El registro no está habilitado',
      detail: 'Las cuentas las crea el área de Sistemas. Comunicate con Sistemas para que te den de alta.',
      life: 6000,
    });
  };




  return (
    <div className={styles.pageContainer}>
      <Toast ref={toast} position="top-right" />
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
              <input
                id="login-usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                required
              />
              <label htmlFor="login-usuario">Usuario</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>

            <div className={`${styles.inputBox} ${styles.withToggle} ${styles.animation}`} style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
              <input
                id="login-password"
                type={verPassLogin ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <label htmlFor="login-password">Contraseña</label>
              <button
                type="button"
                className={styles.toggleEye}
                onClick={() => setVerPassLogin((v) => !v)}
                aria-label="Mostrar u ocultar contraseña"
                aria-pressed={verPassLogin}
              >
                {verPassLogin ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
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
              <input
                id="registro-usuario"
                type="text"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setTouched(prev => ({ ...prev, usuario: true }));
                }}
                autoComplete="username"
                required
              />
              <label htmlFor="registro-usuario">Usuario</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              {fieldErrors.usuario && (
                <span className={styles.errorText} role="alert">{fieldErrors.usuario}</span>
              )}
            </div>

            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--li': 19, '--S': 2 } as React.CSSProperties}>
              <input
                id="registro-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTouched(prev => ({ ...prev, email: true }));
                }}
                autoComplete="email"
                required
              />
              <label htmlFor="registro-email">Email</label>
              <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              {fieldErrors.email && (
                <span className={styles.errorText} role="alert">{fieldErrors.email}</span>
              )}
            </div>

            <div className={`${styles.inputBox} ${styles.withToggle} ${styles.animation}`} style={{ '--li': 20, '--S': 3 } as React.CSSProperties}>
              <input
                id="registro-password"
                type={verPassRegistro ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setTouched(prev => ({ ...prev, password: true }));
                }}
                autoComplete="new-password"
                required
              />
              <label htmlFor="registro-password">Contraseña</label>
              <button
                type="button"
                className={styles.toggleEye}
                onClick={() => setVerPassRegistro((v) => !v)}
                aria-label="Mostrar u ocultar contraseña"
                aria-pressed={verPassRegistro}
              >
                {verPassRegistro ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
              {fieldErrors.password && (
                <span className={styles.errorText} role="alert">{fieldErrors.password}</span>
              )}
            </div>

            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--li': 21, '--S': 4 } as React.CSSProperties}>
              <button className={styles.btn} type="submit" disabled>Regístrate</button>
            </div>

            <div className={`${styles.regiLink} ${styles.animation}`} style={{ '--li': 22, '--S': 5 } as React.CSSProperties}>
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