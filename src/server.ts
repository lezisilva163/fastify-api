import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { writeFile } from "fs";
import { resolve } from "path";
import { routes } from "./routes";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Error handler customizado para exibir erros de validação do Zod
app.setErrorHandler((err, req, reply) => {
  if (hasZodFastifySchemaValidationErrors(err)) {
    // Formata os erros de validação
    const formattedErrors = err.validation.map((error: any) => {
      const field = error.instancePath?.replace("/", "") || "unknown";
      return `${field}: ${error.message}`;
    });

    return reply.code(400).send({
      error: "Bad Request",
      message: formattedErrors.join(", "),
      statusCode: 400,
    });
  }

  if (isResponseSerializationError(err)) {
    console.error("Response serialization error:", err.cause.issues);
    return reply.code(500).send({
      error: "Internal Server Error",
    });
  }

  // Para outros erros
  return reply.code(err.statusCode || 500).send({
    error: err.message || "Internal Server Error",
  });
});

app.register(fastifyCors, { origin: "*" });

// Configuração do JWT
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui_mude_em_producao",
});

// Decorator para autenticação
app.decorate(
  "authenticate",
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        error: "Unauthorized",
        message: "Token inválido ou expirado",
      });
    }
  }
);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "API Fastify",
      description: "API exemplo utilizando Fastify com TypeScript",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(import("@scalar/fastify-api-reference"), {
  routePrefix: "/docs",
  configuration: {
    theme: "kepler",
  },
});

app.register(routes, { prefix: "/api" });

app.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

app.ready().then(() => {
  const spec = app.swagger();

  writeFile(
    resolve(__dirname, "../docs.json"),
    JSON.stringify(spec, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing Swagger spec to file:", err);
      } else {
        console.log("Swagger spec written to docs.json");
      }
    }
  );
});
