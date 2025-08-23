
# Sistema de Sincronização Google Sheets → PostgreSQL

## 📋 Pré-requisitos

### 1. Configurar Variáveis de Ambiente (.env)
Adicione essas variáveis ao seu arquivo `.env`:

```bash
# Existentes
DATABASE_URL="sua_connection_string_postgresql"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu_nextauth_secret"

# Novas para sincronização
GOOGLE_SERVICE_ACCOUNT_EMAIL="seu-service-account@projeto.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"seu-projeto",...}'
GOOGLE_SHEETS_SPREADSHEET_ID="1ABC...XYZ"
GOOGLE_SHEETS_RANGE="'Respostas ao formulário 1'!A1:J"
SYNC_SECRET="sua-chave-secreta-muito-longa-e-segura"
```

### 2. Executar Migração da Tabela
```bash
cd app
node scripts/run-migration.js
```

### 3. Compartilhar a Planilha
1. Abra sua planilha do Google Sheets
2. Clique em "Compartilhar"
3. Adicione o email da service account com permissão de "Visualizador"
4. A planilha deve ter a aba: **"Respostas ao formulário 1"**

### 4. Instalar Dependências
```bash
cd app
yarn add pg googleapis
yarn add -D @types/pg
```

## 📊 Mapeamento de Colunas

A planilha deve ter essas colunas (primeira linha = cabeçalho):

| Coluna na Planilha | Campo no Banco | Formato |
|-------------------|----------------|---------|
| Carimbo de data/hora | timestamp | dd/mm/yyyy hh:mm:ss |
| Nome completo | name | Texto |
| Sexo | gender | Masculino/Feminino |
| Telefone (WhatsApp) | phone | Só números |
| Data de nascimento | birth_date | dd/mm/yyyy |
| Melhor email | email | email@domain.com |
| Cidade | city | Texto |
| Endereço completo | address | Texto |
| Como soube dessa oportunidade? | discovery_source | Texto |
| Como você prefere estudar? | study_preference | Texto |

## 🔄 Como Usar

### 1. Acessar o Painel
- Faça login como admin
- Vá para **Admin → Alunos**

### 2. Sincronizar
- Clique no botão **"Sincronizar"**
- Aguarde o processo (protegido por advisory lock)
- Veja o resultado: "X novos alunos, Y já existiam"

### 3. Buscar Alunos
- Use o campo de busca por nome ou email
- A listagem é atualizada automaticamente

## 🛠️ Como Funciona

1. **Advisory Lock**: Evita sincronizações simultâneas
2. **Deduplicação**: Usa `ON CONFLICT (email) DO NOTHING`
3. **Mapeamento Dinâmico**: Encontra colunas por nome (case-insensitive)
4. **Validação**: Pula linhas sem nome ou email
5. **Server Action**: Não expõe `SYNC_SECRET` no client

## 🚨 Troubleshooting

### Erro: "Missing Google Sheets configuration"
- Verifique se todas as variáveis `GOOGLE_*` estão no `.env`
- Confirme que `GOOGLE_SERVICE_ACCOUNT_KEY` é um JSON válido

### Erro: "Sync already in progress"
- Aguarde a sincronização atual terminar
- Ou conecte no PostgreSQL e execute: `SELECT pg_advisory_unlock_all()`

### Erro: "The caller does not have permission"
- Certifique-se que a planilha foi compartilhada com a service account
- Verifique se o `GOOGLE_SHEETS_SPREADSHEET_ID` está correto

### Nenhum aluno importado
- Verifique se a aba se chama exatamente "Respostas ao formulário 1"
- Confirme que a primeira linha tem os cabeçalhos corretos
- Veja os logs no console para erros específicos
