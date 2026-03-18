/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://alejandrostein.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/studio'] },
    ],
  },
  exclude: ['/studio', '/studio/*'],
  alternateRefs: [
    { href: 'https://alejandrostein.com/en', hreflang: 'en' },
    { href: 'https://alejandrostein.com/es', hreflang: 'es' },
  ],
}
