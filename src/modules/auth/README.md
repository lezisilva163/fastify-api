# Sistema de Autenticação JWT

Este módulo implementa autenticação completa com JWT (JSON Web Tokens) na API Fastify.

## 🔐 Funcionalidades

- **Registro de usuários** (`POST /api/auth/register`)
- **Login** (`POST /api/auth/login`)
- **Verificação de token** (`GET /api/auth/me`)
- **Rotas protegidas** com middleware de autenticação

## 📋 Endpoints

### 1. Registro de Usuário

**POST** `/api/auth/register`

Registra um novo usuário e retorna um token JWT.

**Body:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response 201:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Possíveis erros:**

- `409 Conflict`: Email já cadastrado
- `400 Bad Request`: Dados inválidos (senha curta, email inválido, etc.)

### 2. Login

**POST** `/api/auth/login`

Autentica um usuário existente e retorna um token JWT.

**Body:**

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response 200:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Possíveis erros:**

- `401 Unauthorized`: Email ou senha inválidos

### 3. Verificar Usuário Autenticado

**GET** `/api/auth/me`

Retorna os dados do usuário autenticado. **Requer token JWT.**

**Headers:**

```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Response 200:**

```json
{
  "user": {
    "id": "clxxx",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Possíveis erros:**

- `401 Unauthorized`: Token inválido, expirado ou ausente

### 4. Listar Usuários (Rota Protegida)

**GET** `/api/users`

Lista todos os usuários cadastrados. **Requer token JWT.**

**Headers:**

```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Response 200:**

```json
{
  "users": [
    {
      "id": "clxxx",
      "name": "João Silva",
      "email": "joao@email.com",
      "createdAt": "2025-11-02T23:10:08.484Z"
    }
  ]
}
```

## 🛠️ Como Usar

### 1. Configurar JWT Secret

Adicione a variável `JWT_SECRET` no seu arquivo `.env`:

```bash
JWT_SECRET=sua_chave_secreta_aqui_mude_em_producao_use_string_longa_e_aleatoria
```

⚠️ **IMPORTANTE**: Use uma string longa e aleatória em produção!

### 2. Fazer Login/Registro

```bash
# Registrar novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'

# Ou fazer login com usuário existente
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

Ambos retornam um **token JWT** que você deve usar nas próximas requisições.

### 3. Usar o Token em Rotas Protegidas

Copie o token recebido e adicione no header `Authorization`:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Testar na Documentação Scalar

1. Acesse `http://localhost:3000/docs`
2. Clique no botão **"Authorize"** (cadeado) no topo
3. Cole o token JWT no campo
4. Agora você pode testar rotas protegidas diretamente na UI

## 🔒 Protegendo Novas Rotas

Para adicionar autenticação a qualquer rota:

```typescript
// No arquivo *.routes.ts
app.get(
  "/rota-protegida",
  {
    schema: minhaRotaDocs,
    onRequest: [app.authenticate], // Adiciona middleware de autenticação
  },
  async (req, reply) => {
    // Acesse o usuário autenticado via req.user
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Sua lógica aqui...
  }
);
```

No arquivo `*.docs.ts`, adicione o schema de segurança:

```typescript
export const minhaRotaDocs = {
  tags: ["MinhaTag"],
  description: "Descrição da rota",
  security: [{ bearerAuth: [] }], // Define que precisa de autenticação
  response: {
    // ... suas respostas
  },
};
```

## 📝 Estrutura do Token JWT

O token contém as seguintes informações:

```typescript
{
  id: string; // ID do usuário
  email: string; // Email do usuário
  iat: number; // Data de emissão
  exp: number; // Data de expiração (7 dias)
}
```

## ⚠️ Avisos de Segurança

### EM DESENVOLVIMENTO

O código atual **NÃO** faz hash das senhas! As senhas são salvas em texto plano no banco de dados.

### PARA PRODUÇÃO

**OBRIGATÓRIO** implementar:

1. **Hash de senhas** com bcrypt:

   ```bash
   npm install bcrypt @types/bcrypt
   ```

   ```typescript
   import bcrypt from "bcrypt";

   // No registro
   const hashedPassword = await bcrypt.hash(password, 10);
   await prisma.user.create({
     data: { name, email, password: hashedPassword },
   });

   // No login
   const isValid = await bcrypt.compare(password, user.password);
   if (!isValid) {
     return reply.status(401).send({ error: "Email ou senha inválidos" });
   }
   ```

2. **JWT_SECRET forte** (mínimo 32 caracteres aleatórios)

3. **HTTPS** em produção

4. **Rate limiting** para prevenir ataques de força bruta

5. **Refresh tokens** para renovar tokens expirados

## 🧪 Testes

Execute os testes de autenticação:

```bash
npm test                 # Rodar todos os testes
npm run test:watch       # Watch mode
```

Os testes cobrem:

- ✅ Registro com sucesso
- ✅ Registro com email duplicado
- ✅ Validação de campos (senha curta, email inválido)
- ✅ Login com sucesso
- ✅ Login com credenciais inválidas
- ✅ Acesso a rotas protegidas com token
- ✅ Acesso negado sem token
- ✅ Token inválido

## 📚 Arquivos do Módulo

```
src/modules/auth/
├── auth.routes.ts    # Handlers das rotas
├── auth.schema.ts    # Validação Zod
├── auth.docs.ts      # Documentação OpenAPI
├── auth.test.ts      # Testes automatizados
└── README.md         # Esta documentação
```

## 🎯 Próximos Passos

- [ ] Implementar hash de senhas com bcrypt
- [ ] Adicionar refresh tokens
- [ ] Implementar rate limiting
- [ ] Adicionar roles/permissões de usuário
- [ ] Implementar logout (blacklist de tokens)
- [ ] Adicionar recuperação de senha
- [ ] Implementar 2FA (autenticação de dois fatores)
