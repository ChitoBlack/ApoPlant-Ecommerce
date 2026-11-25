/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    '172.27.16.1',
    'python-succulent-anteater.ngrok-free.dev',
  ],
};

export default nextConfig;
