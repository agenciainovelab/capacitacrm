
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================
  // 🚀 CONFIGURAÇÕES PARA PRODUÇÃO/DOCKER
  // ========================================
  
  // Output standalone para Docker
  output: 'standalone',
  
  // Configurações de imagem otimizadas
  images: {
    domains: [
      'localhost', 
      'capacita-crm.com',
      // Adicione outros domínios conforme necessário
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Configurações experimentais
  experimental: {
    // Otimizações para Prisma em serverless
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  
  // Configurações de webpack
  webpack: (config, { isServer }) => {
    // Configurações específicas para servidor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Otimizações para build
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
