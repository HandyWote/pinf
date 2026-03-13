const fs = require('fs');
const path = require('path');

const DEFAULT_DIST_DIR = path.join(__dirname, '..', 'dist');
const DEFAULT_SOURCE_ICON = path.join(__dirname, '..', 'assets', 'images', 'withbackground.png');
const PWA_ICON_DIR = 'pwa-icons';
const PWA_ICON_192 = 'icon-192.png';
const PWA_ICON_512 = 'icon-512.png';

function ensurePwaIcons(distDir, sourceIconPath = DEFAULT_SOURCE_ICON) {
  if (!fs.existsSync(sourceIconPath)) {
    throw new Error(`PWA icon source not found: ${sourceIconPath}`);
  }

  const iconOutputDir = path.join(distDir, PWA_ICON_DIR);
  fs.mkdirSync(iconOutputDir, { recursive: true });
  fs.copyFileSync(sourceIconPath, path.join(iconOutputDir, PWA_ICON_192));
  fs.copyFileSync(sourceIconPath, path.join(iconOutputDir, PWA_ICON_512));
}

function buildManifest() {
  return {
    name: '早护通',
    short_name: '早护通',
    description: '新生儿/早产儿健康管理应用',
    start_url: '/',
    display: 'standalone',
    background_color: '#E6F4FE',
    theme_color: '#E6F4FE',
    orientation: 'portrait',
    icons: [
      {
        src: `/${PWA_ICON_DIR}/${PWA_ICON_192}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: `/${PWA_ICON_DIR}/${PWA_ICON_512}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
}

function writeManifest(distDir) {
  const manifest = buildManifest();
  fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

function writeServiceWorker(distDir) {
  const swContent = `const CACHE_NAME = 'pinf-v1';
const STATIC_CACHE = 'pinf-static-v1';
const DYNAMIC_CACHE = 'pinf-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return response || caches.match('/index.html');
        });
      })
  );
});
`;

  fs.writeFileSync(path.join(distDir, 'service-worker.js'), swContent);
}

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(fullPath));
      return;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  });

  return files;
}

function injectManifestLink(content) {
  if (content.includes('rel="manifest"') || content.includes("rel='manifest'")) {
    return content;
  }

  const manifestLink = '\n    <link rel="manifest" href="/manifest.json" />';
  if (content.includes('<link rel="icon" href="/favicon.ico" />')) {
    return content.replace(
      '<link rel="icon" href="/favicon.ico" />',
      `<link rel="icon" href="/favicon.ico" />${manifestLink}`
    );
  }

  if (content.includes('</head>')) {
    return content.replace('</head>', `    <link rel="manifest" href="/manifest.json" />\n  </head>`);
  }

  return content;
}

function injectServiceWorker(content) {
  if (content.includes('serviceWorker')) {
    return content;
  }

  if (!content.includes('</body>')) {
    return content;
  }

  return content.replace(
    '</body>',
    '<script>\n      if ("serviceWorker" in navigator) {\n        window.addEventListener("load", () => {\n          navigator.serviceWorker.register("/service-worker.js")\n            .then((reg) => console.log("[SW] Registered:", reg.scope))\n            .catch((err) => console.log("[SW] Failed:", err));\n        });\n      }\n    </script>\n  </body>'
  );
}

function injectPwaIntoHtmlFiles(distDir) {
  const htmlFiles = collectHtmlFiles(distDir);

  htmlFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    content = injectManifestLink(content);
    content = injectServiceWorker(content);
    fs.writeFileSync(filePath, content);
  });
}

function main(options = {}) {
  const distDir = options.distDir || DEFAULT_DIST_DIR;
  const sourceIconPath = options.sourceIconPath || DEFAULT_SOURCE_ICON;

  ensurePwaIcons(distDir, sourceIconPath);
  writeManifest(distDir);
  writeServiceWorker(distDir);
  injectPwaIntoHtmlFiles(distDir);

  console.log('PWA files generated successfully!');
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  buildManifest,
  ensurePwaIcons,
  writeManifest,
  writeServiceWorker,
  collectHtmlFiles,
  injectManifestLink,
  injectServiceWorker,
  injectPwaIntoHtmlFiles,
};
