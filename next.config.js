/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar erros ESLint no build/deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros TS no build/deploy
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig