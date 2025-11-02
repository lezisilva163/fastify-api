import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../server";

describe("Auth Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/auth/register", () => {
    it("deve registrar um novo usuário com dados válidos", async () => {
      const timestamp = Date.now();
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "Test User",
          email: `test.${timestamp}@email.com`,
          password: "123456",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
      expect(body.user).toHaveProperty("id");
      expect(body.user).toHaveProperty("email");
      expect(body.user.name).toBe("Test User");
    });

    it("deve retornar erro 409 ao tentar registrar email duplicado", async () => {
      const timestamp = Date.now();
      const email = `duplicate.${timestamp}@email.com`;

      // Primeiro registro
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "User 1",
          email,
          password: "123456",
        },
      });

      // Segundo registro com mesmo email
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "User 2",
          email,
          password: "654321",
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Conflict");
      expect(body.message).toBe("Email já cadastrado");
    });

    it("deve retornar erro 400 com senha muito curta", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "Test User",
          email: "test@email.com",
          password: "123",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Bad Request");
      expect(body.message).toContain("senha deve ter no mínimo 6 caracteres");
    });

    it("deve retornar erro 400 com email inválido", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "Test User",
          email: "invalid-email",
          password: "123456",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Bad Request");
      expect(body.message).toContain("Email inválido");
    });

    it("deve retornar erro 400 sem campo obrigatório", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "test@email.com",
          password: "123456",
          // faltando 'name'
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Bad Request");
    });
  });

  describe("POST /api/auth/login", () => {
    it("deve fazer login com credenciais válidas", async () => {
      const timestamp = Date.now();
      const email = `login.${timestamp}@email.com`;
      const password = "123456";

      // Registra o usuário primeiro
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "Login User",
          email,
          password,
        },
      });

      // Tenta fazer login
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email,
          password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
      expect(body.user.email).toBe(email);
    });

    it("deve retornar erro 401 com email não cadastrado", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "naoexiste@email.com",
          password: "123456",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toBe("Email ou senha inválidos");
    });

    it("deve retornar erro 401 com senha incorreta", async () => {
      const timestamp = Date.now();
      const email = `wrongpass.${timestamp}@email.com`;

      // Registra o usuário
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "Test User",
          email,
          password: "123456",
        },
      });

      // Tenta login com senha errada
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email,
          password: "senhaerrada",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toBe("Email ou senha inválidos");
    });
  });

  describe("GET /api/auth/me", () => {
    it("deve retornar dados do usuário autenticado", async () => {
      const timestamp = Date.now();
      const email = `me.${timestamp}@email.com`;

      // Registra e pega o token
      const registerResponse = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          name: "Me User",
          email,
          password: "123456",
        },
      });

      const { token } = JSON.parse(registerResponse.body);

      // Chama a rota protegida
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("user");
      expect(body.user.email).toBe(email);
      expect(body.user.name).toBe("Me User");
    });

    it("deve retornar erro 401 sem token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Unauthorized");
    });

    it("deve retornar erro 401 com token inválido", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          authorization: "Bearer token_invalido_123",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Unauthorized");
    });
  });
});
