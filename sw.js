// KEEPro Service Worker
// 提供离线缓存和PWA支持

const CACHE_NAME = 'keepro-v3.1-' + new Date().getTime();
const CACHE_URLS = [
    './',
    './keep.html',
    './manifest.json',
    './favicon.ico',
    './drawingActions.json',
    './css/base.css',
    './css/styles.css',
    './js/init.js',
    './js/render.js',
    './js/onload.js',
    './js/draw_personalization.js',
    './js/drawMine.js',
    './js/download_img.js',
    './js/indexedDB.js',
    './js/select_manner.js',
    './js/img_both_inpt_set.js',
    './js/dataURLtoBlob.js',
    './js/batch_generate.js',
    './js/invoke/html2canvas.min.js',
    './js/invoke/amapHelper.js',
    './images/start.png',
    './images/end.png',
    './images/weather1.png',
    './images/weather2.png',
    './images/weather3.png',
    './images/default_portrait.png',
    './images/bg1_empty.png',
    './images/bg1_empty2.png',
    './images/bg2_empty.png',
    './images/bg3_empty.png',
    './images/bg1_1.png',
    './images/bg1_2.png',
    './images/bg1_3.png',
    './images/bg1_4.png',
    './images/bg1_5.png'
];

// 安装事件：预缓存关键资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 正在缓存关键资源...');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('[SW] 关键资源缓存完成');
                return self.skipWaiting();
            })
    );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => {
            console.log('[SW] 旧缓存已清理');
            return self.clients.claim();
        })
    );
});

// 请求拦截：缓存优先策略（静态资源），网络优先策略（API）
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 对高德地图API和一言API使用网络优先
    if (url.hostname.includes('amap.com') ||
        url.hostname.includes('v1.hitokoto.cn') ||
        url.hostname.includes('googletagmanager.com') ||
        url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('tool.joytion.cn')) {
        // 网络优先：不做缓存，直接请求
        return;
    }

    // 对本地资源使用缓存优先
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(response => {
                    // 不缓存非成功响应
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // 克隆响应并存入缓存
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                }).catch(() => {
                    // 离线时返回默认占位（不影响功能）
                    return new Response('离线时不可用', { status: 503 });
                });
            })
    );
});