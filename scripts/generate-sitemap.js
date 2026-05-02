import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://tvtrack.app'; // Replace with your actual domain

async function generateSitemap() {
  const staticRoutes = [
    '',
    '/schedule',
    '/privacy',
    '/tos',
  ];

  // Fetch top trending shows to include in sitemap
  let showRoutes = [];
  try {
    const res = await fetch('https://api.tvmaze.com/schedule?country=US');
    const data = await res.json();
    const uniqueShows = Array.from(new Map(data.map((item) => [item.show.id, item.show])).values())
      .slice(0, 50); // Include top 50 shows for now
    
    showRoutes = uniqueShows.map(show => `/show/${show.id}`);
  } catch (e) {
    console.error('Failed to fetch shows for sitemap:', e);
  }

  const allRoutes = [...staticRoutes, ...showRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map((route) => {
      return `
    <url>
      <loc>${BASE_URL}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${route.startsWith('/show') ? 'daily' : 'weekly'}</changefreq>
      <priority>${route === '' ? '1.0' : route.startsWith('/show') ? '0.8' : '0.5'}</priority>
    </url>`;
    })
    .join('')}
</urlset>`;

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated successfully in /public/sitemap.xml');
}

generateSitemap();
