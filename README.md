# API REST - Fastify + Prisma + TypeScript

Uma API REST moderna e type-safe construída com Fastify, Prisma ORM, TypeScript e validação Zod, incluindo documentação OpenAPI automática e testes automatizados.

## 🚀 Tecnologias

- **[Fastify](https://fastify.dev/)** - Framework web rápido e eficiente
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Zod](https://zod.dev/)** - Validação de schemas e type inference
- **[Vitest](https://vitest.dev/)** - Framework de testes moderno e rápido
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Docker](https://www.docker.com/)** - Containerização do banco de dados
- **[Scalar](https://scalar.com/)** - Interface moderna para documentação OpenAPI

## ✨ Funcionalidades

- ✅ Validação automática de request/response com Zod
- ✅ Documentação OpenAPI/Swagger gerada automaticamente
- ✅ Interface visual Scalar para testar APIs em `/docs`
- ✅ Mensagens de erro customizadas em português
- ✅ Testes automatizados com Vitest
- ✅ Hot reload em desenvolvimento
- ✅ Type-safety completo (TypeScript + Prisma + Zod)
- ✅ Migrations automáticas do banco de dados
- ✅ CORS configurado
- ✅ Error handling customizado

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd fastify-api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
```

4. Inicie o banco de dados com Docker:

```bash
docker compose up -d
```

5. Execute as migrations do Prisma:

```bash
npm run prisma:migrate
```

6. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`
A documentação interativa estará em `http://localhost:3000/docs`

## 📁 Estrutura do Projeto

```
fastify-api/
├── .github/
│   └── copilot-instructions.md    # Instruções para o GitHub Copilot
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados
│   └── migrations/                # Histórico de migrations
├── src/
│   ├── modules/                   # Módulos da aplicação
│   │   └── user/
│   │       ├── user.routes.ts     # Rotas do usuário
│   │       ├── user.schema.ts     # Schemas Zod
│   │       ├── user.docs.ts       # Documentação OpenAPI
│   │       └── user.test.ts       # Testes automatizados
│   ├── routes/
│   │   └── index.ts               # Registro de rotas
│   ├── db/
│   │   └── prisma.ts              # Cliente Prisma
│   ├── generated/
│   │   └── prisma/                # Cliente Prisma gerado (não editar)
│   └── server.ts                  # Inicialização do servidor
├── docker-compose.yml             # Configuração Docker
├── vitest.config.ts               # Configuração de testes
├── tsconfig.json                  # Configuração TypeScript
└── package.json                   # Dependências e scripts

```

## 🎯 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev              # Inicia servidor com hot reload
npm run build            # Compila e inicia servidor
```

### Banco de Dados

```bash
npm run prisma:migrate   # Cria migration e regenera client
npm run prisma:studio    # Abre interface visual do BD
docker compose up -d     # Inicia PostgreSQL
docker compose down      # Para PostgreSQL
```

### Testes

```bash
npm test                 # Executa todos os testes
npm run test:watch       # Modo watch (re-executa ao salvar)
npm run test:ui          # Interface visual dos testes
npm run test:coverage    # Relatório de cobertura
```

## 📚 Documentação da API

Acesse `http://localhost:3000/docs` após iniciar o servidor para ver a documentação interativa completa com:

- Todos os endpoints disponíveis
- Schemas de request/response
- Testes interativos
- Exemplos de uso

## 🧪 Testes

O projeto utiliza Vitest para testes automatizados. Os testes cobrem:

- ✅ Cenários de sucesso (201, 200)
- ✅ Validações de campos obrigatórios
- ✅ Validações de tamanho (min/max)
- ✅ Mensagens de erro customizadas
- ✅ Múltiplas operações

Exemplo de teste:

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
  expect(response.json()).toHaveProperty("user");
});
```

## 🔐 Variáveis de Ambiente

| Variável       | Descrição                    | Exemplo                                    |
| -------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL` | URL de conexão do PostgreSQL | `postgresql://user:pass@localhost:5432/db` |

## 📝 Adicionando Novos Recursos

1. **Crie o modelo no Prisma** (`prisma/schema.prisma`)
2. **Execute a migration**: `npm run prisma:migrate`
3. **Crie a estrutura do módulo** em `src/modules/`:
   - `*.routes.ts` - Implementação das rotas
   - `*.schema.ts` - Validação Zod
   - `*.docs.ts` - Documentação OpenAPI
   - `*.test.ts` - Testes automatizados
4. **Registre as rotas** em `src/routes/index.ts`
5. **Execute os testes**: `npm test`
6. **Teste manualmente** em `/docs`

## 🐛 Tratamento de Erros

A API retorna erros estruturados em português:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "password: A senha deve ter no mínimo 6 caracteres"
}
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👨‍💻 Autor

**Leo**

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!
