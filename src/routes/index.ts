import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";

export const routes: FastifyPluginAsyncZod = async (app) => {
  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/users" });
};
