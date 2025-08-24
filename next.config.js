/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração mínima para EasyPanel
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  
  // Configurações de imagem básicas
  images: {
    unoptimized: true,
  },
  
  // Webpack básico
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

