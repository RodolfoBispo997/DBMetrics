# DBMetrics API

Backend do **DBMetrics**, uma plataforma SaaS para monitoramento de bancos de dados MySQL e PostgreSQL.

A aplicação permite cadastrar conexões, validar conectividade, coletar métricas em tempo real, armazenar snapshots históricos, consolidar informações para dashboards e disparar alertas pelo WhatsApp por meio da Evolution API.

O projeto foi desenvolvido com **Node.js, TypeScript, NestJS, Prisma e PostgreSQL**, utilizando uma organização modular inspirada em **Domain-Driven Design** e **Clean Architecture**.

---

## Visão geral

O DBMetrics centraliza informações operacionais de diferentes bancos de dados em uma única plataforma.

A API é responsável por:

- autenticar e autorizar usuários;
- cadastrar bancos monitorados;
- proteger as credenciais das conexões;
- conectar-se a bancos MySQL e PostgreSQL;
- coletar métricas técnicas;
- armazenar o histórico das coletas;
- fornecer dados consolidados para dashboards;
- avaliar regras de alerta;
- enviar notificações pelo WhatsApp.

---

## Principais funcionalidades

### Autenticação e autorização

- Autenticação por e-mail e senha.
- Emissão de access token JWT.
- Proteção de rotas com `JwtAuthGuard`.
- Autorização baseada em roles.
- Perfis disponíveis:
  - `ADMIN`
  - `MEMBER`
  - `VIEWER`

- Consulta do usuário autenticado em `/auth/me`.

### Gerenciamento de conexões

- Cadastro de conexões MySQL e PostgreSQL.
- Listagem das conexões do usuário autenticado.
- Consulta individual.
- Atualização de configurações.
- Exclusão de conexões.
- Teste de conectividade antes do monitoramento.
- Isolamento das conexões por usuário.

### Segurança das credenciais

As senhas dos bancos monitorados não são armazenadas em texto puro.

O projeto utiliza **AES-256-GCM** para criptografar as credenciais antes da persistência, oferecendo:

- confidencialidade;
- autenticação do conteúdo criptografado;
- detecção de alterações;
- IV individual por operação.

As senhas dos usuários são protegidas com `bcrypt`.

### Coleta de métricas

O DBMetrics possui collectors específicos para:

- PostgreSQL;
- MySQL.

Métricas atualmente coletadas:

- versão do banco de dados;
- quantidade de tabelas;
- quantidade de views;
- quantidade de schemas;
- quantidade de índices;
- quantidade de funções;
- tamanho do banco de dados;
- quantidade de conexões ativas.

A seleção do collector é realizada por uma factory com base no provider configurado para a conexão.

### Métricas em tempo real

A API pode consultar o banco monitorado diretamente e retornar seu estado atual sem persistir um novo snapshot.

Quando a conexão não pode ser estabelecida, a resposta identifica o banco como offline, permitindo que o frontend represente a indisponibilidade sem depender exclusivamente de um erro HTTP.

### Histórico de métricas

As coletas podem ser persistidas como snapshots históricos.

A API disponibiliza:

- histórico completo por conexão;
- histórico paginado;
- filtros por período;
- séries temporais para gráficos;
- último snapshot registrado;
- comparação com o período anterior;
- resumo de variação em 24 horas.

### Dashboard

O módulo de dashboard consolida informações das conexões monitoradas para fornecer:

- quantidade total de conexões;
- último estado conhecido;
- última métrica registrada;
- histórico por período;
- dados para gráficos;
- resumo de evolução das métricas.

### Alertas

O DBMetrics permite criar regras baseadas em limites para as métricas coletadas.

Uma regra de alerta contém:

- conexão monitorada;
- métrica observada;
- operador de comparação;
- threshold;
- canal de notificação;
- destino;
- estado habilitado ou desabilitado.

Após a persistência de uma métrica, as regras habilitadas para a conexão são avaliadas.

Quando uma condição é atendida:

1. uma execução de alerta é criada;
2. a mensagem é construída;
3. o canal configurado é acionado;
4. o resultado é persistido como `SENT` ou `FAILED`;
5. eventuais falhas são registradas sem interromper as demais regras.

### Alertas pelo WhatsApp

O canal atualmente implementado é o WhatsApp, integrado por meio da **Evolution API**.

O backend envia uma requisição HTTP contendo:

- número de destino;
- conexão monitorada;
- métrica;
- valor coletado;
- threshold configurado.

A integração utiliza:

- autenticação pelo header `apikey`;
- instância configurável;
- timeout de requisição;
- tratamento de falhas;
- persistência do erro da notificação.

---

## Arquitetura

O projeto utiliza uma arquitetura modular inspirada em DDD e Clean Architecture.

```text
src/
├── app/
├── auth/
├── user/
├── database-connection/
├── database-metric/
├── dashboard/
├── alerts/
└── shared/
```

Os principais módulos de negócio são divididos em camadas:

```text
module/
├── domain/
├── application/
├── infra/
└── presentation/
```

### Domain

Contém os elementos centrais do negócio:

- entidades;
- regras e validações;
- enums;
- erros de domínio;
- contratos independentes de frameworks.

### Application

Coordena os fluxos da aplicação:

- casos de uso;
- interfaces de repositório;
- portas de serviços;
- contratos de entrada e saída;
- orquestração das regras do domínio.

### Infrastructure

Implementa integrações e detalhes técnicos:

- Prisma;
- PostgreSQL;
- MySQL;
- criptografia;
- Evolution API;
- collectors;
- implementações de repositórios;
- scheduler.

### Presentation

Expõe as funcionalidades por HTTP:

- controllers NestJS;
- DTOs;
- validação de entrada;
- presenters;
- documentação Swagger.

### Repository Pattern

Os casos de uso dependem de interfaces de repositório definidas na camada de aplicação.

As implementações concretas utilizam Prisma e são fornecidas aos módulos por meio de injeção de dependência.

Isso mantém as regras de aplicação desacopladas do mecanismo de persistência.

---

## Fluxo de coleta

```mermaid
flowchart LR
    A[Requisição de coleta] --> B[Buscar conexão]
    B --> C[Selecionar collector]
    C --> D{Provider}

    D -->|PostgreSQL| E[PostgreSQL Collector]
    D -->|MySQL| F[MySQL Collector]

    E --> G[Coletar métricas]
    F --> G

    G --> H[Criar DatabaseMetric]
    H --> I[Persistir snapshot]
    I --> J[Processar regras de alerta]
    J --> K[Persistir execuções]
    K --> L[Enviar notificação WhatsApp]
```

---

## Fluxo de alertas

```mermaid
sequenceDiagram
    participant Collector
    participant Metric as RecordDatabaseMetric
    participant Repository
    participant Alerts as AlertProcessor
    participant Evolution
    participant WhatsApp

    Collector->>Metric: Métricas coletadas
    Metric->>Repository: Persistir snapshot
    Repository-->>Metric: Snapshot criado
    Metric->>Alerts: Processar regras

    Alerts->>Alerts: Avaliar operadores e thresholds

    alt Regra atendida
        Alerts->>Repository: Criar execução
        Alerts->>Evolution: Enviar mensagem
        Evolution->>WhatsApp: Entregar alerta
        Evolution-->>Alerts: Resultado
        Alerts->>Repository: Atualizar status
    end
```

---

## Modelo de dados

### User

Representa um usuário da plataforma.

Principais atributos:

- `id`
- `name`
- `email`
- `password`
- `role`
- `createdAt`
- `updatedAt`

### DatabaseConnection

Representa um banco externo monitorado.

Principais atributos:

- `id`
- `name`
- `provider`
- `host`
- `port`
- `database`
- `username`
- `password`
- `userId`
- `createdAt`
- `updatedAt`

Providers suportados:

```text
MYSQL
POSTGRESQL
```

### DatabaseMetric

Representa um snapshot das métricas de uma conexão.

Principais atributos:

- `databaseConnectionId`
- `databaseVersion`
- `tablesCount`
- `viewsCount`
- `schemasCount`
- `indexesCount`
- `functionsCount`
- `databaseSize`
- `activeConnections`
- `createdAt`

### AlertRule

Representa uma condição configurada para monitoramento.

Principais atributos:

- conexão;
- métrica;
- operador;
- threshold;
- canal;
- destino;
- status de ativação.

### AlertExecution

Registra cada tentativa de execução de uma regra.

Status disponíveis:

```text
PENDING
SENT
FAILED
```

---

## Infraestrutura

O DBMetrics utiliza dois contextos de persistência diferentes.

```mermaid
flowchart TD
    API[DBMetrics API]

    API --> APP_DB[(PostgreSQL do DBMetrics)]
    API --> MYSQL[(MySQL monitorado)]
    API --> PG[(PostgreSQL monitorado)]
    API --> EVO[Evolution API]

    EVO --> EVO_DB[(PostgreSQL da Evolution)]
    EVO --> REDIS[(Redis)]
    EVO --> WA[WhatsApp]
```

### PostgreSQL do DBMetrics

Armazena:

- usuários;
- conexões monitoradas;
- métricas históricas;
- regras de alerta;
- execuções de alerta.

### Bancos monitorados

O backend conecta-se aos bancos externos somente para:

- validar conectividade;
- consultar metadados;
- coletar métricas.

### Evolution API

Responsável pela comunicação com o WhatsApp.

A infraestrutura local da Evolution utiliza:

- Evolution API;
- PostgreSQL próprio;
- Redis;
- volumes persistentes;
- rede Docker dedicada.

O PostgreSQL e o Redis da Evolution não são acessados diretamente pelo DBMetrics. Eles são dependências internas da própria Evolution API.

---

## Tecnologias

### Backend

- Node.js
- TypeScript
- NestJS 11
- Prisma ORM 6
- PostgreSQL
- MySQL
- JWT
- Passport
- Axios
- Swagger
- bcrypt
- AES-256-GCM

### Infraestrutura

- Docker
- Docker Compose
- Evolution API
- Redis
- PostgreSQL

### Qualidade e desenvolvimento

- DTOs com validação
- Validation Pipe global
- filtro global para erros de domínio
- injeção de dependências
- Repository Pattern
- testes com Node Test Runner
- type-check com TypeScript

## Documentação da API

Com a aplicação em execução, o Swagger fica disponível em:

```text
http://localhost:3333/docs
```

A documentação permite:

- consultar os endpoints;
- visualizar os DTOs;
- testar requisições;
- informar o Bearer Token;
- analisar os contratos HTTP.

---

## Requisitos

- Node.js 20
- pnpm
- PostgreSQL
- Docker e Docker Compose para alertas por WhatsApp
- banco MySQL ou PostgreSQL para monitoramento

---

## Instalação

Clone o repositório:

```bash
git clone <https://github.com/RodolfoBispo997/DBMetrics>
cd DBMetrics
```

Instale as dependências:

```bash
pnpm install
```

Gere o Prisma Client:

```bash
pnpm exec prisma generate
```

---

## Variáveis de ambiente

O backend utiliza as seguintes variáveis:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbmetrics

JWT_SECRET=replace-with-a-secure-secret

DATABASE_CREDENTIALS_KEY=replace-with-a-valid-32-byte-base64-key

EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=replace-with-your-evolution-api-key
EVOLUTION_INSTANCE_NAME=dbmetrics
```

### Variáveis obrigatórias

| Variável                   | Descrição                                   |
| -------------------------- | ------------------------------------------- |
| `DATABASE_URL`             | Conexão com o PostgreSQL principal          |
| `JWT_SECRET`               | Chave utilizada para assinar tokens JWT     |
| `DATABASE_CREDENTIALS_KEY` | Chave usada na criptografia das credenciais |

### Variáveis da Evolution API

| Variável                  | Descrição                          |
| ------------------------- | ---------------------------------- |
| `EVOLUTION_API_URL`       | URL base da Evolution API          |
| `EVOLUTION_API_KEY`       | Chave de autenticação da Evolution |
| `EVOLUTION_INSTANCE_NAME` | Nome da instância WhatsApp         |

O backend também mantém compatibilidade com `EVOLUTION_INSTANCE` como nome legado da variável de instância.

A aplicação lê as configurações diretamente do ambiente do processo. As variáveis devem estar disponíveis no terminal, IDE, container ou processo responsável por iniciar a aplicação.

---

## Execução

### Desenvolvimento

```bash
pnpm exec nest start --watch
```

### Build

```bash
pnpm exec nest build
```

### Produção

```bash
node dist/main
```

### Prisma Studio

```bash
pnpm exec prisma studio
```

### Migrations em desenvolvimento

```bash
pnpm exec prisma migrate dev
```

Migrations devem ser executadas somente contra o banco correto e com as variáveis de ambiente devidamente configuradas.

---

## Testes

Os testes atualmente disponíveis validam principalmente:

- criptografia e descriptografia das credenciais;
- integridade do payload AES-256-GCM;
- comportamento do repositório relacionado às credenciais protegidas.

Execução:

```bash
pnpm run test:security
```

---

## Evolution API

A infraestrutura para alertas WhatsApp está localizada em:

```text
infra/evolution/
```

Para iniciar os serviços:

```bash
cd infra/evolution
docker compose up -d
```

Serviços utilizados:

- Evolution API;
- PostgreSQL;
- Redis.

Após iniciar a infraestrutura:

1. acesse a Evolution API;
2. configure ou conecte a instância;
3. autentique a sessão do WhatsApp;
4. informe no backend a URL, API key e nome da instância;
5. crie uma regra com o canal `WHATSAPP`;
6. realize uma coleta que atenda ao threshold configurado.

---

## Exemplo de fluxo

### 1. Autenticação

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### 2. Cadastro de conexão

```http
POST /database-connections
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "name": "Production PostgreSQL",
  "provider": "POSTGRESQL",
  "host": "localhost",
  "port": 5432,
  "database": "application",
  "username": "monitor",
  "password": "your-password"
}
```

### 3. Teste de conectividade

```http
POST /database-connections/:id/test
Authorization: Bearer <access-token>
```

### 4. Coleta manual

```http
POST /database-metrics/:id/collect
Authorization: Bearer <access-token>
```

### 5. Consulta do histórico

```http
GET /database-metrics/:id/history
Authorization: Bearer <access-token>
```

---

## Status do projeto

Funcionalidades disponíveis:

- [x] Autenticação JWT
- [x] Autorização por roles
- [x] Gerenciamento de usuários
- [x] CRUD de conexões
- [x] Teste de conectividade
- [x] Monitoramento PostgreSQL
- [x] Monitoramento MySQL
- [x] Métricas em tempo real
- [x] Persistência de snapshots
- [x] Histórico de métricas
- [x] Dashboard
- [x] Regras de alerta
- [x] Histórico de execuções
- [x] Alertas por WhatsApp
- [x] Criptografia de credenciais
- [x] Swagger
- [ ] Coleta agendada habilitada
- [ ] Refresh token
- [ ] Notificações por e-mail
- [ ] Notificações por Discord
- [ ] Notificações por webhook
- [ ] Testes E2E
- [ ] Pipeline de CI/CD

---

## Decisões técnicas

### Collectors separados por provider

MySQL e PostgreSQL possuem diferenças relevantes em consultas de metadados.

Collectors separados evitam condicionais extensas e permitem que novos providers sejam adicionados por meio de novas implementações.

### Persistência por snapshots

Cada coleta gera um registro histórico independente.

Esse modelo permite:

- análise temporal;
- construção de gráficos;
- comparação entre períodos;
- identificação de tendências;
- auditoria do estado passado.

### Avaliação de alertas após a coleta

As regras são avaliadas após a persistência do snapshot.

Isso garante que a métrica responsável pelo alerta permaneça disponível no histórico, mesmo quando o envio da notificação falha.

### Falhas isoladas entre alertas

Uma falha no envio de uma notificação não interrompe o processamento das demais regras.

Cada execução mantém seu próprio status e mensagem de erro.

### Credenciais criptografadas

As credenciais dos bancos monitorados precisam ser recuperadas para estabelecer conexões futuras.

Por isso, hash não seria suficiente. O projeto utiliza criptografia autenticada reversível com AES-256-GCM.

---

## Limitações atuais

- O scheduler está implementado estruturalmente, mas a coleta periódica não está habilitada.
- O canal funcional de notificação é o WhatsApp.
- Os tokens JWT não possuem refresh token ou revogação.
- A cobertura automatizada ainda está concentrada na segurança das credenciais.
- Não há pipeline de integração contínua configurado.
- A infraestrutura da Evolution API precisa estar ativa para o envio de alertas.
- A execução depende de variáveis disponibilizadas ao ambiente do processo.

---

## Roadmap

- Habilitar coleta agendada configurável.
- Implementar refresh token e rotação de sessão.
- Expandir canais de notificação.
- Adicionar testes unitários dos casos de uso.
- Adicionar testes de integração e E2E.
- Criar health check da aplicação.
- Implementar pipeline de CI/CD.
- Ampliar estratégias de agregação para históricos extensos.

---

## Autor

Desenvolvido por **Rodolfo Bispo** como projeto de portfólio voltado à aplicação prática de engenharia backend em uma plataforma SaaS de monitoramento de bancos de dados.
