# Testes Automatizados

## 🧪 Tecnologia

Este projeto utiliza **Vitest** para testes automatizados, aproveitando o Fastify's `inject()` para simular requisições HTTP sem iniciar um servidor real.

## 📋 Testes Implementados

### POST /api/users (Criar Usuário)

✅ **Cenários de sucesso:**

- Criar usuário com dados válidos (201)
- Criar múltiplos usuários com emails diferentes (201)

❌ **Cenários de erro:**

- Nome muito curto (< 2 caracteres) → 400
- Nome muito longo (> 100 caracteres) → 400
- Senha muito curta (< 6 caracteres) → 400
- Campo `name` ausente → 400
- Campo `email` ausente → 400
- Campo `password` ausente → 400
- Campos extras não permitidos → 400

## 🚀 Comandos

```bash
# Executar todos os testes uma vez
npm test

# Executar testes em modo watch (re-executa ao salvar)
npm run test:watch

# Abrir interface visual dos testes
npm run test:ui

# Executar testes com relatório de cobertura
npm run test:coverage
```

## 📝 Estrutura dos Testes

```
src/
└── modules/
    └── user/
        ├── user.routes.ts
        ├── user.schema.ts
        ├── user.docs.ts
        └── user.test.ts  ← Arquivo de testes
```

## 🔍 Como Funcionam

Os testes utilizam o método `app.inject()` do Fastify que:

- **Não inicia um servidor real** (mais rápido)
- **Simula requisições HTTP** completas
- **Valida schemas Zod** automaticamente
- **Acessa o banco de dados real** (use banco de teste!)

### Exemplo de teste:

```typescript
it("deve criar um usuário com dados válidos", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/users",
    payload: {
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body.user).toHaveProperty("id");
});
```

## ⚠️ Importante

### Banco de Dados de Teste

Os testes atualmente usam o **banco de dados principal**. Para ambientes de produção, configure um banco separado:

1. Crie um arquivo `.env.test`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres_test"
```

2. Configure o Vitest para usar esse arquivo:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    env: {
      DATABASE_URL: process.env.DATABASE_URL_TEST,
    },
  },
});
```

3. Execute migrações no banco de teste:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

## 📊 Cobertura de Código

Após executar `npm run test:coverage`, um relatório será gerado em `coverage/index.html` mostrando:

- Linhas de código testadas
- Funções testadas
- Branches testados
- Porcentagem de cobertura

## 🎯 Boas Práticas

- ✅ Use emails únicos em cada teste (ex: `user.${Date.now()}@email.com`)
- ✅ Teste cenários de sucesso E falha
- ✅ Verifique todos os campos da resposta
- ✅ Teste validações do Zod
- ✅ Isole testes (não dependem uns dos outros)
- ✅ Nomes descritivos (`deve retornar erro 400 quando...`)

## 📚 Próximos Passos

- [ ] Adicionar testes de integração completos
- [ ] Configurar banco de dados de teste separado
- [ ] Adicionar testes E2E (end-to-end)
- [ ] Implementar mocks do Prisma para testes unitários
- [ ] Adicionar CI/CD para executar testes automaticamente
