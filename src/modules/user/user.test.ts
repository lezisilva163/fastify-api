import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../server";

describe("POST /api/users - Criar usuário", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("deve criar um usuário com dados válidos", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "João Silva",
        email: `joao.${Date.now()}@email.com`, // Email único
        password: "senha123",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("user");
    expect(body.user).toHaveProperty("id");
    expect(body.user).toHaveProperty("name", "João Silva");
    expect(body.user).toHaveProperty("email");
    expect(body.user.email).toContain("joao.");
  });

  it("deve retornar erro 400 quando o nome for muito curto", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "J", // Apenas 1 caractere
        email: "joao@email.com",
        password: "senha123",
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("error", "Bad Request");
    expect(body.message).toContain("nome deve ter no mínimo 2 caracteres");
  });

  it("deve retornar erro 400 quando o nome for muito longo", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "a".repeat(101), // 101 caracteres
        email: "joao@email.com",
        password: "senha123",
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("error", "Bad Request");
    expect(body.message).toContain("nome deve ter no máximo 100 caracteres");
  });

  it("deve retornar erro 400 quando a senha for muito curta", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "João Silva",
        email: "joao@email.com",
        password: "123", // Apenas 3 caracteres
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("error", "Bad Request");
    expect(body.message).toContain("senha deve ter no mínimo 6 caracteres");
  });

  it("deve retornar erro 400 quando o campo name estiver ausente", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        email: "joao@email.com",
        password: "senha123",
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("error", "Bad Request");
    expect(body.message).toContain("name");
  });

  it("deve retornar erro 400 quando o campo email estiver ausente", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "João Silva",
        password: "senha123",
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("error", "Bad Request");
    expect(body.message).toContain("email");
  });

  it("deve retornar erro 400 quando o campo password estiver ausente", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "João Silva",
        email: "joao@email.com",
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("error", "Bad Request");
    expect(body.message).toContain("password");
  });

  it("deve criar múltiplos usuários com emails diferentes", async () => {
    const timestamp = Date.now();

    const response1 = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "Usuário 1",
        email: `user1.${timestamp}@email.com`,
        password: "senha123",
      },
    });

    const response2 = await app.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        name: "Usuário 2",
        email: `user2.${timestamp}@email.com`,
        password: "senha456",
      },
    });

    expect(response1.statusCode).toBe(201);
    expect(response2.statusCode).toBe(201);

    const body1 = JSON.parse(response1.body);
    const body2 = JSON.parse(response2.body);

    expect(body1.user.id).not.toBe(body2.user.id);
  });
});
