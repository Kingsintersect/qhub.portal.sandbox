/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      remotePatterns: [{
            protocol: 'https',
            hostname: 'bond001.com'
         },
         {
            protocol: 'https',
            hostname: 'qhub.portal.sandbox.qverselearning.org'
         },
         {
            protocol: 'https',
            hostname: 'qhub.api.sandbox.qverselearning.org'
         },
         {
            protocol: 'https',
            hostname: 'images.unsplash.com'
         },
         {
            protocol: 'https',
            hostname: 'github.com'
         },
      ],
   },
}

export default nextConfig
