# URL Shortener API

API para encurtamento de URLs com autenticação JWT, estatísticas de acesso e gerenciamento de URLs por usuários autenticados.

Deploy disponível em produção: https://url-shortener-api-go11.onrender.com

*Este projeto foi hospedado gratuitamente no Render, que pode hibernar o serviço após um tempo de inatividade. Por isso, o link de produção pode ficar temporariamente indisponível.*

---

## Funcionalidades

- Encurtamento de URLs com hash curto e único
- Redirecionamento automático via hash
- Registro e login de usuários
- Autenticação com JWT
- Listagem de URLs encurtadas por usuário autenticado
- Atualização da URL original
- Exclusão lógica (soft delete)
- Contador de cliques por URL
- Documentação automática com Swagger
- Deploy contínuo via Render

---

## Tecnologias utilizadas

- Node.js 20.x
- NestJS 11.0.1
- Prisma ORM 6.12.0
- PostgreSQL 15.x
- JWT (via @nestjs/jwt)
- Swagger (via @nestjs/swagger)
- Docker + Docker Compose
- Jest para testes unitários
- ESLint + Prettier para padronização de código

---

## Ambiente e versões utilizadas

| Ferramenta         | Versão         |
|--------------------|----------------|
| Node.js            | 20.x           |
| NPM                | 10.x           |
| NestJS             | 11.0.1         |
| Prisma             | 6.12.0         |
| PostgreSQL         | 15.x           |
| Jest               | 29.7.0         |
| Swagger UI         | 6.x            |
| TypeScript         | 5.7.3          |
| Docker Compose     | 3.8            |
| ESLint + Prettier  | Ativos         |

---

## Autenticação

A autenticação é baseada em JWT (JSON Web Token).

Para acessar as rotas protegidas, envie o token no cabeçalho:

```http
Authorization: Bearer <seu-token-jwt>
```

### Obtendo o token
1. Registre um usuário em `POST /auth/register`
2. Faça login em `POST /auth/login`
3. Use o token retornado nas requisições autenticadas

---

## Instalação local

### Pré-requisitos
- Node.js 20.x
- PostgreSQL 15.x
- Git

### Passo a passo

```bash
# Clone o repositório
git clone https://github.com/annacoutinho/url-shortener-api
cd url-shortener

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto:



### Executando o projeto

```bash
# Execute as migrações do banco
npx prisma migrate dev

# Inicie o servidor em modo desenvolvimento
npm run start:dev

# Ou com Docker Compose
docker-compose up -d
```

O servidor estará disponível em: http://localhost:3000

---

## Endpoints da API

### Rotas públicas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Registrar novo usuário |
| `POST` | `/auth/login` | Login do usuário |
| `GET`  | `/:hash` | Redirecionar para URL original |
| `GET`  | `/docs` | Documentação Swagger |

### Rotas autenticadas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/urls` | Encurtar nova URL |
| `GET`  | `/urls` | Listar URLs do usuário |
| `GET`  | `/urls/:id` | Obter URL específica |
| `PUT`  | `/urls/:id` | Atualizar URL |
| `DELETE` | `/urls/:id` | Excluir URL (soft delete) |

---

## Exemplos de uso

### Registrar usuário
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'
```

### Encurtar URL
```bash
curl -X POST http://localhost:3000/urls \
  -H "Authorization: Bearer <seu-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.exemplo.com/pagina-muito-longa"
  }'
```

### Listar URLs do usuário
```bash
curl -X GET http://localhost:3000/urls \
  -H "Authorization: Bearer <seu-token>"
```

---

## Testes

```bash
# Executar todos os testes
npm run test


## Docker

### Executar com Docker Compose

```bash
# Subir todos os serviços (API + PostgreSQL)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os serviços
docker-compose down
```

### Build manual

```bash
# Build da imagem
docker build -t url-shortener-api .

# Executar container
docker run -p 3000:3000 --env-file .env url-shortener-api
```

---

## Documentação Swagger

A documentação interativa da API está disponível em:

**Local:** http://localhost:3000/docs  
**Produção:** https://url-shortener-api-go11.onrender.com/docs

---

## Estrutura do projeto

```
src/
├── auth/              # Módulo de autenticação
├── urls/              # Módulo de URLs
├── users/             # Módulo de usuários
├── common/            # Utilitários e decorators
├── database/          # Configuração do Prisma
└── main.ts           # Arquivo principal

prisma/
├── schema.prisma     # Schema do banco
└── migrations/       # Migrações

---

## Histórico de versões

| Versão | Data       | Alterações principais |
|--------|------------|----------------------|
| 0.4.0  | 2025-07-27 | Adicionado contador de cliques por URL |
| 0.3.0  | 2025-07-26 | CRUD de URLs autenticadas, edição e soft delete |
| 0.2.0  | 2025-07-25 | Autenticação JWT: login e registro |
| 0.1.0  | 2025-07-24 | Estrutura inicial: encurtamento e redirecionamento |



**Feito com Node.js e NestJS**
