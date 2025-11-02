# Copilot Instructions for curso-1

## Architecture Overview

This is a **Fastify + Prisma + TypeScript** REST API project with a modular route structure. The stack emphasizes type-safe schemas using Zod and auto-generated OpenAPI documentation.

**Key Components:**

- `src/server.ts` - Fastify app initialization with Swagger/Scalar API docs at `/docs`
- `src/modules/` - Modular organization by resource (e.g., `user/`)
- `src/routes/` - Route registration (legacy, prefer `modules/`)
- `src/generated/prisma/` - Generated Prisma client (do NOT edit manually)
- `docker-compose.yml` - PostgreSQL database container
- `vitest.config.ts` - Test configuration with Vitest

## Critical Prisma Configuration

**Custom Output Path:** Prisma client generates to `src/generated/prisma/` (NOT the default `node_modules/.prisma/client`).

**Import Path Pattern:**

```typescript
// From module files (2 levels deep: src/modules/user/)
import { PrismaClient } from "../../generated/prisma/client";

// From other src/ files (1 level deep)
import { PrismaClient } from "../generated/prisma/client";
```

**After schema changes:**

1. Update `prisma/schema.prisma` with new models/fields
2. Run `npm run prisma:migrate` (creates migration + regenerates client)
3. The generated types in `src/generated/prisma/` are updated automatically

## Module Pattern (4-File Structure)

Each resource follows this convention (see `src/modules/user/`):

1. **`*.routes.ts`** - Fastify route handlers with Prisma logic
2. **`*.schema.ts`** - Zod schemas for request/response validation
3. **`*.docs.ts`** - OpenAPI metadata (tags, descriptions) referencing schemas
4. **`*.test.ts`** - Vitest automated tests for the routes

**Example pattern:**

```typescript
// user.schema.ts - Define validation with custom error messages
export const createUserInputSchema = {
  body: z.object({
    name: z
      .string({ message: "O campo 'name' é obrigatório" })
      .min(2, { message: "O nome deve ter no mínimo 2 caracteres" }),
    email: z
      .string({ message: "O campo 'email' é obrigatório" })
      .email({ message: "Email inválido" }),
    password: z
      .string({ message: "O campo 'password' é obrigatório" })
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  }),
  response: {
    201: z.object({
      user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
    }),
    400: z.object({
      error: z.string(),
      message: z.string().optional(),
      statusCode: z.number().optional(),
    }),
    500: z.object({ error: z.string() }),
  },
};

// user.docs.ts - Document the endpoint
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

// user.routes.ts - Implement the handler
export const userRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/", { schema: createUserDocs }, async (req, reply) => {
    const { name, email, password } = req.body;
    const user = await prisma.user.create({ data: { name, email } });
    return reply
      .status(201)
      .send({
        user: { id: user.id, name: user.name || "", email: user.email },
      });
  });
};

// user.test.ts - Test the endpoint
describe("POST /api/users", () => {
  it("deve criar um usuário com dados válidos", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: { name: "João", email: "joao@email.com", password: "123456" },
    });
    expect(response.statusCode).toBe(201);
  });
});
```

Register new routes in `src/routes/index.ts` with appropriate prefixes.

## Error Handling

**Custom Error Handler** configured in `src/server.ts`:

```typescript
app.setErrorHandler((err, req, reply) => {
  if (hasZodFastifySchemaValidationErrors(err)) {
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
  // ... other error handling
});
```

**Error Response Format:**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "password: A senha deve ter no mínimo 6 caracteres"
}
```

## Testing Strategy

**Framework:** Vitest with Fastify's `inject()` method (no real HTTP server needed)

**Test File Location:** Co-located with modules (e.g., `src/modules/user/user.test.ts`)

**Test Structure:**

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../server";

describe("POST /api/users", () => {
  beforeAll(async () => await app.ready());
  afterAll(async () => await app.close());

  it("test description", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        /* data */
      },
    });
    expect(response.statusCode).toBe(201);
  });
});
```

**Testing Commands:**

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode (re-run on save)
npm run test:ui       # Visual interface
npm run test:coverage # Coverage report
```

**Test Coverage Includes:**

- ✅ Success scenarios (201 responses)
- ✅ Validation errors (400 responses)
- ✅ Missing required fields
- ✅ Field constraints (min/max length)
- ✅ Multiple operations

**Important:** Tests use real database. Consider using `.env.test` with separate DATABASE_URL for production.

## Development Workflow

```bash
# Start development server (hot reload enabled, loads .env automatically)
npm run dev

# Database operations
docker compose up -d              # Start PostgreSQL container (port 5432)
docker compose down               # Stop container
docker compose logs postgres      # View container logs

# Prisma commands
npm run prisma:migrate            # Create migration + regenerate client
npm run prisma:studio             # Open visual database editor (GUI)
npx prisma generate              # Regenerate client only (no DB changes)
npx prisma migrate reset         # Reset DB + reapply all migrations

# Testing
npm test                          # Run all tests
npm run test:watch                # Watch mode
npm run test:ui                   # Visual test UI
npm run test:coverage             # Coverage report

# Build (for production)
npm run build                     # Compile TypeScript + start server once
```

**API Documentation:** After `npm run dev`, access Scalar UI at `http://localhost:3000/docs`

## Key Conventions

- **Type Provider:** Use `FastifyPluginAsyncZod` for route plugins to enable Zod integration
- **Validation:** Always define schemas in `*.schema.ts` before implementing routes
- **Custom Messages:** Add Portuguese error messages using `{ message: "..." }` in Zod schemas
- **Documentation:** OpenAPI spec auto-generates to `docs.json` on server start
- **CORS:** Configured for all origins (`origin: "*"`) in production - adjust in `server.ts`
- **Database URL:** Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres` in `.env`
- **Endpoint Naming:** Use **plural English nouns** for resource paths (e.g., `/users`, `/products`, `/orders`)
  - Folder names use singular: `src/modules/user/` → registers as `/users`
  - See `src/routes/index.ts` for prefix registration pattern
- **Testing:** Write tests for every new route using Vitest and Fastify's `inject()`

## When Adding Features

1. Create Prisma model in `schema.prisma`
2. Run `npm run prisma:migrate` (generates types + applies migration)
3. Create module folder with `*.routes.ts`, `*.schema.ts`, `*.docs.ts`, `*.test.ts`
4. Add custom error messages in Portuguese to Zod schemas
5. Register in `src/routes/index.ts`
6. Write tests covering success and error scenarios
7. Run `npm test` to verify all tests pass
8. Test manually via Scalar UI at `/docs` endpoint

## Response Schema Best Practices

- Always include `response` schemas for proper OpenAPI documentation
- Success response (201/200): Include all returned fields
- Error responses (400/500): Include `error`, `message` (optional), `statusCode` (optional)
- Use `z.string()` for IDs (not `z.uuid()`) to avoid strict validation on response
- Make fields optional with `.optional()` only when they can truly be missing

## Zod Validation Tips

- Use `{ message: "..." }` for custom Portuguese error messages
- Chain validators: `.string().min(2).max(100)`
- Email validation: `.email({ message: "Email inválido" })`
- Required fields: `.string({ message: "Campo obrigatório" })`
- Error handler automatically formats: `"field: error message"`

## Common Pitfalls

- ❌ Don't use `z.uuid()` for response IDs (use `z.string()`)
- ❌ Don't forget to include response schemas in `*.docs.ts`
- ❌ Don't make required fields optional in response schemas
- ❌ Don't use `app.listen()` in test files (use `app.inject()`)
- ✅ Always use unique emails in tests (e.g., `user.${Date.now()}@email.com`)
- ✅ Always await `app.ready()` before running tests
- ✅ Always close app with `app.close()` after tests
