import { loginInputSchema, meSchema, registerInputSchema } from "./auth.schema";

export const registerDocs = {
  tags: ["Auth"],
  description: "Registra um novo usuário e retorna um token JWT",
  body: registerInputSchema.body,
  response: {
    201: registerInputSchema.response[201],
    400: registerInputSchema.response[400],
    409: registerInputSchema.response[409],
    500: registerInputSchema.response[500],
  },
};

export const loginDocs = {
  tags: ["Auth"],
  description: "Realiza login e retorna um token JWT",
  body: loginInputSchema.body,
  response: {
    200: loginInputSchema.response[200],
    400: loginInputSchema.response[400],
    401: loginInputSchema.response[401],
    500: loginInputSchema.response[500],
  },
};

export const meDocs = {
  tags: ["Auth"],
  description: "Retorna os dados do usuário autenticado (requer token JWT)",
  security: [{ bearerAuth: [] }],
  response: {
    200: meSchema.response[200],
    401: meSchema.response[401],
    500: meSchema.response[500],
  },
};
