# 🚀 Deploy EasyPanel - Sistema CRM Capacita

## Sistema Corrigido e Pronto para Deploy

Este sistema foi completamente analisado e corrigido. Todos os problemas de instalação e conexão com banco de dados foram resolvidos.

## 📋 Pré-requisitos no EasyPanel

### 1. Banco de Dados PostgreSQL
- Crie um serviço PostgreSQL no EasyPanel
- Anote as credenciais: host, porta, usuário, senha, database

### 2. Variáveis de Ambiente
Configure as seguintes variáveis no EasyPanel:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database?schema=public
NEXTAUTH_SECRET=capacita-crm-secret-key-2024-production-muito-seguro-e-longo
NEXTAUTH_URL=https://seu-dominio.com
SYNC_SECRET=capacita-sync-secret-2024-production-seguro
```

## 🔧 Configuração no EasyPanel

### Passo 1: Criar Aplicação
1. No EasyPanel, clique em "Create Service"
2. Escolha "App" 
3. Selecione "GitHub" como source
4. Conecte este repositório: `agenciainovelab/capacitacrm`

### Passo 2: Configurar Build
- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Start Command:** `npm start`
- **Port:** `3000`

### Passo 3: Variáveis de Ambiente
Adicione as variáveis listadas acima na seção Environment do EasyPanel.

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. O sistema executará automaticamente as migrações do Prisma

## 🔑 Credenciais de Login

- **Usuário Admin:** reciclando
- **Senha Admin:** capacita

## 📊 Funcionalidades Corrigidas

✅ Instalação de dependências automática  
✅ Prisma Client gerado corretamente  
✅ Conexão com banco PostgreSQL  
✅ Migrações automáticas  
✅ Sistema de autenticação funcionando  
✅ Interface administrativa acessível  

## 🛠️ Comandos Úteis

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrações
npx prisma db push

# Visualizar banco
npx prisma studio

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## 📞 Suporte

O sistema foi completamente corrigido e testado. Em caso de dúvidas sobre o deploy no EasyPanel, verifique:

1. Se as variáveis de ambiente estão corretas
2. Se o banco PostgreSQL está acessível
3. Se o build foi executado com sucesso

## 🎯 Status do Sistema

**✅ SISTEMA 100% FUNCIONAL**
- Todos os erros anteriores foram corrigidos
- Pronto para deploy em produção
- Banco de dados configurado automaticamente
- Interface administrativa operacional

