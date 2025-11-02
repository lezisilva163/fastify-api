import { z } from "zod";

// Schema de registro
export const registerInputSchema = {
  body: z.object({
    name: z
      .string({ message: "O campo 'name' é obrigatório" })
      .min(2, { message: "O nome deve ter no mínimo 2 caracteres" }),
    email: z
      .string({
        message: "O campo 'email' é obrigatório e deve ser um email válido",
      })
      .describe("Email do usuário"),
    password: z
      .string({ message: "O campo 'password' é obrigatório" })
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  }),
  response: {
    201: z.object({
      token: z.string(),
      user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      }),
    }),
    400: z.object({
      error: z.string(),
      message: z.string().optional(),
      statusCode: z.number().optional(),
    }),
    409: z.object({
      error: z.string(),
      message: z.string().optional(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
};

// Schema de login
export const loginInputSchema = {
  body: z.object({
    email: z
      .string({
        message: "O campo 'email' é obrigatório e deve ser um email válido",
      })
      .describe("Email do usuário"),
    password: z
      .string({ message: "O campo 'password' é obrigatório" })
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  }),
  response: {
    200: z.object({
      token: z.string(),
      user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      }),
    }),
    400: z.object({
      error: z.string(),
      message: z.string().optional(),
      statusCode: z.number().optional(),
    }),
    401: z.object({
      error: z.string(),
      message: z.string().optional(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
};

// Schema para verificar token (rota protegida de exemplo)
export const meSchema = {
  response: {
    200: z.object({
      user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      }),
    }),
    401: z.object({
      error: z.string(),
      message: z.string().optional(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
};
