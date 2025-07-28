# Changelog

Todas as mudanças importantes deste projeto serão documentadas aqui.

O formato segue a [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).

## [0.5.0] - 2025-07-27

### Adicionado
- Testes unitários completos para os serviços de autenticação: `AuthService`, `PasswordService` e `TokenService`

### Alterado
- Refatoração do módulo de autenticação:
  - Separação de responsabilidades em arquivos distintos (`auth.service.ts`, `password.service.ts`, `token.service.ts`)
  - Organização dos testes em pasta isolada (`auth/test`)

## [0.4.0] - 2025-07-27

### Adicionado
- Contabilização de cliques em URLs encurtadas no redirecionamento

## [0.3.0] - 2025-07-26

### Adicionado
- Listagem das URLs do usuário autenticado
- Edição e exclusão lógica (soft delete) de URLs encurtadas

## [0.2.0] - 2025-07-26

### Adicionado
- Registro de novos usuários
- Login com validação de senha e geração de token JWT

## [0.1.0] - 2025-07-26

### Adicionado
- Encurtamento de URLs com geração de hash único de até 6 caracteres
- Estrutura inicial do projeto com NestJS, Prisma e redirecionamento de URLs
