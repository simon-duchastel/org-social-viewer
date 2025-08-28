/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // Ignore markdown files during webpack processing
    config.module.rules.push({
      test: /\.md$/,
      use: 'ignore-loader'
    })
    return config
  },
}

export default nextConfig