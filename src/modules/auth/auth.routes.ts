import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { PrismaClient } from "../../generated/prisma/client";
import { loginDocs, meDocs, registerDocs } from "./auth.docs";

const prisma = new PrismaClient();

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  // Rota de registro
  app.post("/register", { schema: registerDocs }, async (req, reply) => {
    try {
      const { name, email, password } = req.body;

      // Verifica se o email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(409).send({
          error: "Conflict",
          message: "Email já cadastrado",
        });
      }

      // Cria o usuário (em produção, use bcrypt para hash da senha)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password, // IMPORTANTE: Em produção, fazer hash da senha!
        },
      });

      // Gera o token JWT
      const token = app.jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        {
          expiresIn: "7d",
        }
      );

      return reply.status(201).send({
        token,
        user: {
          id: user.id,
          name: user.name || "",
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
      });
    }
  });

  // Rota de login
  app.post("/login", { schema: loginDocs }, async (req, reply) => {
    try {
      const { email, password } = req.body;

      // Busca o usuário
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Email ou senha inválidos",
        });
      }

      // Verifica a senha (em produção, use bcrypt.compare)
      if (user.password !== password) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Email ou senha inválidos",
        });
      }

      // Gera o token JWT
      const token = app.jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        {
          expiresIn: "7d",
        }
      );

      return reply.status(200).send({
        token,
        user: {
          id: user.id,
          name: user.name || "",
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
      });
    }
  });

  // Rota protegida de exemplo - retorna dados do usuário autenticado
  app.get(
    "/me",
    {
      schema: meDocs,
      onRequest: [app.authenticate],
    },
    async (req, reply) => {
      try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Usuário não encontrado",
          });
        }

        return reply.status(200).send({
          user: {
            id: user.id,
            name: user.name || "",
            email: user.email,
          },
        });
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return reply.status(500).send({
          error: "Internal Server Error",
        });
      }
    }
  );
};
