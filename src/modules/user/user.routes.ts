import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createUserDocs } from "./user.docs";
import { prisma } from "../../db/prisma";

export const userRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/", { schema: createUserDocs }, async (req, reply) => {
    try {
      console.log("Creating user with data:", req.body);
      const { name, email, password } = req.body;

      const user = await prisma.user.create({
        data: {
          name,
          email,
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
  });
};
