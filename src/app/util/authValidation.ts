// lib/validations/authValidation.ts
import { z } from "zod";

// Esquema para registro de usuario
export const registerSchema = z.object({
  usuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(20, "El nombre de usuario no puede superar los 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos"),

  email: z
    .string()
    .email("El correo electrónico no es válido"),

  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
