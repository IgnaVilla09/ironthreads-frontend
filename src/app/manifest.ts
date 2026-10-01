import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Iron Stock', short_name: 'Iron', start_url: '/dashboard', display: 'standalone',
    background_color: '#f7f8f8', theme_color: '#111111',
    icons: [{ src: '/icon.png', sizes: 'any', type: 'image/png' }],
  };
}
