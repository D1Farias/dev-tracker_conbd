/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['kaydence-uncompelled-izola.ngrok-free.dev'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
