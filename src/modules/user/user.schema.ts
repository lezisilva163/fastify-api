import { z } from "zod";

export const createUserInputSchema = {
  body: z.object({
    name: z
      .string({
        message: "O campo 'name' é obrigatório e deve ser uma string",
      })
      .min(2, { message: "O nome deve ter no mínimo 2 caracteres" })
      .max(100, { message: "O nome deve ter no máximo 100 caracteres" })
      .describe("Nome completo do usuário"),
    email: z
      .string({
        message: "O campo 'email' é obrigatório e deve ser um email válido",
      })
      .describe("Email do usuário"),
    password: z
      .string({
        message: "O campo 'password' é obrigatório e deve ser uma string",
      })
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres" })
      .describe("Senha do usuário"),
  }),
  response: {
    201: z.object({
      user: z.object({
        id: z.string().describe("ID único do usuário"),
        name: z.string().describe("Nome completo do usuário"),
        email: z.string().describe("Email do usuário"),
      }),
    }),
    400: z.object({
      error: z.string().describe("Mensagem de erro"),
      message: z.string().optional().describe("Detalhes do erro"),
      statusCode: z.number().optional().describe("Código de status HTTP"),
    }),
    500: z.object({
      error: z.string().describe("Mensagem de erro"),
    }),
  },
};

export type createUserInputType = z.infer<typeof createUserInputSchema.body>;
