import { createUserInputSchema } from "./user.schema";

export const createUserDocs = {
  tags: ["Users"],
  description: "Cria um novo usuário",
  body: createUserInputSchema.body,
  response: {
    201: createUserInputSchema.response[201],
    400: createUserInputSchema.response[400],
    500: createUserInputSchema.response[500],
  },
};
