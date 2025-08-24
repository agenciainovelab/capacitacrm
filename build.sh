#!/bin/bash

# Script de Build para EasyPanel - Sistema CRM Capacita
set -e

echo "🚀 Iniciando build do Sistema CRM Capacita..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# 2. Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# 3. Build da aplicação
echo "🏗️ Fazendo build da aplicação..."
npm run build

echo "✅ Build concluído com sucesso!"

