
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando otimização para deploy...');

// Limpar builds antigos
const dirsToClean = ['.next', '.build'];

dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`🧹 Limpando ${dir}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
});

// Verificar e otimizar package.json
const packagePath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Remover dependências desnecessárias para produção
const devOnlyDeps = [
  'plotly.js',
  'react-plotly.js',
  'mapbox-gl',
  'react-youtube'
];

devOnlyDeps.forEach(dep => {
  if (pkg.dependencies[dep]) {
    console.log(`📦 Movendo ${dep} para devDependencies...`);
    pkg.devDependencies[dep] = pkg.dependencies[dep];
    delete pkg.dependencies[dep];
  }
});

// Adicionar scripts de otimização
pkg.scripts['build:optimized'] = 'NODE_ENV=production next build';
pkg.scripts['analyze'] = 'ANALYZE=true next build';
pkg.scripts['clean'] = 'rm -rf .next .build node_modules/.cache';

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

console.log('✅ Otimização concluída!');
console.log('📝 Execute: yarn build:optimized');
