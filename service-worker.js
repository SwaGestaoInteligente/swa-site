/* SWA PWA - Service Worker (offline básico) */
const CACHE_NAME = "swa-cache-v1";

const ASSETS = [
  "/swa-site/",
  "/swa-site/index.html",
  "/swa-site/manifest.json",
  "/swa-site/service-worker.js",
  "/swa-site/swa1.jpeg"
];

// Instala e salva arquivos essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: tenta rede, se falhar usa cache (network-first)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Só GET
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match("/swa-site/"))
      )
  );
});
