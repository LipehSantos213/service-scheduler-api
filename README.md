# Service Scheduler API

API REST escalável para uma plataforma de agendamento de serviços onde os provedores podem gerenciar serviços e disponibilidade, e os clientes podem agendar consultas..

---

## 🚀 Tecnologias

- Node.js
- Fastify
- Prisma ORM
- PostgreSQL
- Docker

---

## 🏗️ Arquitetura

O projeto segue o padrão:

Controller → Service → Repository

---

## 📦 Instalação

Clone o repositório:

```bash
git clone https://github.com/LipehSantos213/service-scheduler-api.git
```

Entre na pasta:

```bash
cd service-scheduler-api
```

Instale as dependências:

```bash
npm install
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET="your_secret"
```

---

## ▶️ Como rodar

Rodar com Docker:

```bash
docker-compose up -d
```

Rodar a aplicação:

```bash
npm run dev
```

---

## 📌 Funcionalidades

- Autenticação com JWT
- Cadastro de usuários
- Perfil de prestadores
- Criação de serviços
- Sistema de agendamento
- Gerenciamento de horários

---

## 🗄️ Banco de Dados

- Users
- Providers
- Services
- Appointments

---

## 🛣️ Rotas da API

### Auth

- POST /auth/register
- POST /auth/login

### Providers

- GET /providers
- GET /providers/:id

### Services

- POST /services
- GET /services/provider/:id

### Appointments

- POST /appointments
- GET /appointments/my

---

## 🗂️ Estrutura do projeto

```bash
src/
 ├── services
 ├── repositories
 ├── routers/
    ├── auth/
 ├── schemas
 ├── plugins
 └── server.ts
```

---

## 📚 Documentação da API (Swagger)

http://localhost:3333/docs

---

## 📄 Licença

Este projeto está sob a licença MIT.
