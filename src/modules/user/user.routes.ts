import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createUserDocs, listUsersDocs } from "./user.docs";
import { prisma } from "../../db/prisma";

export const userRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/",
    { schema: createUserDocs, onRequest: [app.authenticate] },
    async (req, reply) => {
      try {
        console.log("Creating user with data:", req.body);
        const { name, email, password } = req.body;

        const user = await prisma.user.create({
          data: {
            name,
            email,
            password, // IMPORTANTE: Em produção, fazer hash da senha!
          },
        });

        console.log("User created successfully:", user);

        return reply.status(201).send({
          user: {
            id: user.id,
            name: user.name || "",
            email: user.email,
          },
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // Rota protegida - Lista todos os usuários
  app.get(
    "/",
    {
      schema: listUsersDocs,
      onRequest: [app.authenticate],
    },
    async (req, reply) => {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        });

        return reply.status(200).send({
          users: users.map((user) => ({
            id: user.id,
            name: user.name || "",
            email: user.email,
            createdAt: user.createdAt.toISOString(),
          })),
        });
      } catch (error) {
        console.error("Error listing users:", error);
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
};
