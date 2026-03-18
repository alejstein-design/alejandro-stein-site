import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Alejandro Stein',
    short_name: 'AleStein',
    description: 'Artist portfolio — Buenos Aires · Tel Aviv · Berlin',
    start_url: '/en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a1a1a',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
