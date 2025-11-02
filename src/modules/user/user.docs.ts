import { createUserInputSchema, listUsersSchema } from "./user.schema";

export const createUserDocs = {
  tags: ["Users"],
  description: "Cria um novo usuário",
  security: [{ bearerAuth: [] }],
  body: createUserInputSchema.body,
  response: {
    201: createUserInputSchema.response[201],
    400: createUserInputSchema.response[400],
    500: createUserInputSchema.response[500],
  },
};

export const listUsersDocs = {
  tags: ["Users"],
  description: "Lista todos os usuários (requer autenticação)",
  security: [{ bearerAuth: [] }],
  response: {
    200: listUsersSchema.response[200],
    401: listUsersSchema.response[401],
    500: listUsersSchema.response[500],
  },
};
