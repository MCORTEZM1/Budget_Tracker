const APP_PREFIX = 'BudgetTracker-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION
const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
];

// Cache resources 
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});


// Delete outdated caches 
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            // `keyList` contains all cache names under your username.github.io. Filter out ones that has this app prefix to create keeplist
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            })
            // add current cache name to keeplist
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// respond with cached resources 
self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            // if cache is available, respond with cache
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request;
            }
            // if there is no cache available, try fetch request 
            else {
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request);
            }
        })
    )
});

