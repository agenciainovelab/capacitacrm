
# CRM CAPACITA - Sistema de Controle de Presença

Sistema completo para gerenciamento de lives no YouTube com controle de presença automatizado.

## 🚀 Funcionalidades

### 🎓 **Área do Aluno**
- Login com email + telefone (DDD+número sem caracteres)
- Visualização de lives disponíveis
- Player integrado do YouTube
- Marcação de presença automática
- Controle de tempo assistido
- Barra de progresso da aula

### 🏫 **Área da Escola (Admin)**
- Login com credenciais específicas
- Dashboard com estatísticas completas
- Gerenciamento de lives (criar, editar, excluir)
- Controle de alunos cadastrados
- Relatórios de presença por live
- Exportação de dados

## 🔐 **Credenciais de Acesso**

### **Admin (Escola)**
- **Usuário:** `reciclando`
- **Senha:** `capacita`

### **Aluno (Exemplo)**
- **Email:** `joao@exemplo.com`
- **Telefone:** `61999999999`

*Outros alunos de teste: maria@exemplo.com (61888888888), pedro@exemplo.com (61777777777)*

## 🛠️ **Tecnologias Utilizadas**

- **Framework:** Next.js 15 com App Router
- **Autenticação:** NextAuth.js v4
- **Banco de Dados:** PostgreSQL (externo)
- **ORM:** Prisma
- **UI:** Tailwind CSS + shadcn/ui
- **Validação:** Zod + React Hook Form
- **Player:** React YouTube
- **Animações:** Framer Motion

## 📦 **Instalação e Execução**

```bash
# Instalar dependências
yarn install

# Gerar cliente Prisma
yarn prisma generate

# Fazer push das tabelas para o banco
yarn prisma db push

# Criar dados de exemplo
yarn prisma db seed

# Executar em desenvolvimento
yarn dev

# Executar em produção
yarn build && yarn start
```

## 🗄️ **Banco de Dados**

O sistema está configurado para conectar ao banco PostgreSQL externo:
- **Host:** 31.97.172.127:5432
- **Database:** crmalunos
- **Schema:** Criado automaticamente no primeiro login admin

### **Modelos de Dados:**
- **User:** Usuários do sistema (admin)
- **Student:** Alunos cadastrados
- **LiveEvent:** Lives/aulas criadas
- **Attendance:** Registros de presença

## 🎯 **Fluxo de Uso**

### **Para Administradores:**
1. Acessar `/` e clicar em "Acessar como Escola"
2. Login com usuário `reciclando` e senha `capacita`
3. No primeiro login, as tabelas são criadas automaticamente
4. Criar lives no menu "Lives"
5. Visualizar presenças no dashboard
6. Gerenciar alunos na seção "Alunos"

### **Para Alunos:**
1. Acessar `/` e clicar em "Acessar como Aluno"
2. Login com email cadastrado + telefone como senha
3. Visualizar lives disponíveis no dashboard
4. Clicar na live desejada para assistir
5. Marcar presença antes de iniciar o vídeo
6. O sistema tracked automaticamente o tempo assistido

## 🔧 **Configurações Importantes**

### **Variáveis de Ambiente (.env)**
```env
DATABASE_URL="postgres://crmalunos:Leo07102008%40%23%40@31.97.172.127:5432/crmalunos?sslmode=disable"
NEXTAUTH_SECRET="[generated-secret]"
NEXTAUTH_URL="http://localhost:3000"
```

### **Setup Automático**
- No primeiro login admin, o sistema executa automaticamente o setup do banco
- Tabelas são criadas via Prisma
- Dados de exemplo são inseridos

## 🎨 **Design System**

- **Cores:** Azul (escola) e Verde (aluno) conforme logos
- **Layout:** Responsivo mobile-first
- **Componentes:** shadcn/ui para consistência
- **Logos:** CAPACITA + Reciclando o Futuro integrados

## 📱 **Responsividade**

O sistema é totalmente responsivo e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 **Deployment**

Para produção, configure:
1. Variável `NEXTAUTH_URL` com domínio correto
2. SSL/TLS habilitado
3. Backup automático do banco de dados
4. Monitoramento de logs

## 📊 **Métricas Disponíveis**

- Total de alunos cadastrados
- Total de lives criadas
- Número de presenças por live
- Taxa média de presença
- Porcentagem de aulas assistidas completamente

## 🔒 **Segurança**

- Autenticação baseada em NextAuth.js
- Proteção de rotas via middleware
- Validação de dados com Zod
- Conexão segura com banco PostgreSQL
- Sanitização de inputs

## 📞 **Suporte**

Sistema desenvolvido para o projeto CAPACITA - Reciclando o Futuro.
Para suporte técnico, consulte a documentação ou logs do sistema.
