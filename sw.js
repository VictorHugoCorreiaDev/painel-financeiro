/* TROQUE ESTA DATA a cada deploy que mude index.html, manifest ou ícones.
   É a única coisa deste arquivo que precisa de manutenção manual.

   Por que versionar, já que a estratégia é network-first e ninguém fica preso
   numa versão velha: o ciclo install/activate só roda de novo quando o navegador
   percebe que o PRÓPRIO sw.js mudou, byte a byte. Com o nome fixo, sw.js nunca
   mudava — então o precache dos ASSETS acontecia uma única vez, na primeira
   visita da vida, e a limpeza do activate nunca tinha o que limpar. Quem
   instalou o app em março continuava com a cópia offline de março até abrir o
   app online de novo.

   Mudando a data aqui, o arquivo muda, o navegador reinstala, os ASSETS são
   rebaixados da rede e o cache anterior é apagado no activate.

   Data e não v1/v2/v3 porque diz sozinha de quando é a cópia offline de alguém
   — na hora de investigar "o app do celular está diferente", esse é o dado que
   se quer. */
const CACHE_VERSION = '2026-08-07b';
const CACHE_NAME = 'painel-financeiro-' + CACHE_VERSION;
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
