// ============================================
// ðŸ“¦ SERVICE WORKER - sw.js
// ============================================

const CACHE_NAME = 'popup-cache-v1';
const POPUP_URL = '/aboutblankspoofer/google.com';

// Konten HTML yang akan ditampilkan
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            flex-direction: column;
            padding: 20px;
        }
        .container {
            text-align: center;
            animation: fadeIn 0.8s ease;
        }
        h1 {
            font-size: 48px;
            border: 3px solid white;
            padding: 30px 60px;
            border-radius: 20px;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .sub {
            margin-top: 20px;
            font-size: 16px;
            opacity: 0.9;
            background: rgba(0,0,0,0.3);
            padding: 10px 25px;
            border-radius: 20px;
        }
        .badge {
            display: inline-block;
            margin-top: 20px;
            padding: 8px 20px;
            background: #28a745;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .info-box {
            margin-top: 30px;
            padding: 15px 25px;
            background: rgba(255,255,255,0.15);
            border-radius: 12px;
            backdrop-filter: blur(3px);
            font-size: 14px;
        }
        .refresh-count {
            margin-top: 15px;
            font-size: 24px;
            font-weight: bold;
            color: #ffd700;
        }
        .url-display {
            margin-top: 10px;
            padding: 5px 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            font-size: 12px;
            font-family: monospace;
        }
        .sw-badge {
            margin-top: 15px;
            padding: 5px 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-size: 11px;
            color: #aaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>âœ¨ This is new page âœ¨</h1>
        <div class="sub">ðŸ“ Omnibox: <strong>google.com</strong></div>
        <div class="badge">ðŸ›¡ï¸ TAHAN REFRESH</div>
        <div class="info-box" id="infoMessage">
            ðŸ“Œ Halaman ini dilayani oleh Service Worker
        </div>
        <div class="refresh-count" id="refreshCounter">ðŸ”„ Refresh #0</div>
        <div class="url-display" id="urlDisplay">ðŸ“ URL: google.com</div>
        <div class="sw-badge">âš¡ Powered by Service Worker</div>
    </div>

    <script>
        // ============================================
        // ðŸŽ¯ UBAH OMNIBOX MENJADI "google.com" SAJA
        // ============================================
        
        (function() {
            // Gunakan history.replaceState untuk mengubah URL di omnibox
            // Menjadi "google.com" tanpa path /aboutblankspoofer/
            if (window.history && window.history.replaceState) {
                try {
                    // Ubah URL di omnibox menjadi "google.com"
                    // Ini akan menampilkan hanya "google.com" di omnibox
                    window.history.replaceState(
                        { page: 'google' }, 
                        'Google', 
                        'google.com'
                    );
                    console.log('âœ… Omnibox diubah menjadi: google.com');
                } catch(e) {
                    console.log('âš ï¸ Gagal mengubah URL:', e);
                }
            }
            
            // ============================================
            // ðŸ”„ COUNTER REFRESH
            // ============================================
            
            const COUNTER_KEY = 'google_sw_counter';
            let count = parseInt(localStorage.getItem(COUNTER_KEY) || '0');
            count++;
            localStorage.setItem(COUNTER_KEY, count);
            
            const counterEl = document.getElementById('refreshCounter');
            if (counterEl) {
                counterEl.textContent = 'ðŸ”„ Refresh #' + count;
            }
            
            const infoEl = document.getElementById('infoMessage');
            if (infoEl) {
                if (count === 1) {
                    infoEl.innerHTML = 'ðŸŽ‰ <strong>Pertama kali dibuka!</strong> Omnibox: google.com';
                    infoEl.style.background = 'rgba(40, 167, 69, 0.3)';
                } else {
                    infoEl.innerHTML = 'ðŸ”„ <strong>Refresh ke-' + count + '!</strong> Konten tetap ada!';
                    infoEl.style.background = 'rgba(255, 193, 7, 0.3)';
                }
            }
            
            // Tampilkan URL di halaman
            const urlEl = document.getElementById('urlDisplay');
            if (urlEl) {
                urlEl.textContent = 'ðŸ“ Omnibox: ' + window.location.href;
            }
            
            console.log('âœ… Popup dimuat | Refresh #' + count);
            console.log('ðŸ“ URL saat ini:', window.location.href);
        })();
    <\/script>
</body>
</html>
`;

// ============================================
// ðŸŽ¯ EVENT LISTENER SERVICE WORKER
// ============================================

// 1. INSTALL
self.addEventListener('install', function(event) {
    console.log('ðŸ“¦ Service Worker: Install');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('ðŸ“¦ Menyimpan konten ke cache');
                const response = new Response(HTML_CONTENT, {
                    headers: { 'Content-Type': 'text/html' }
                });
                return cache.put(POPUP_URL, response);
            })
            .then(function() {
                console.log('âœ… Service Worker siap');
                return self.skipWaiting();
            })
    );
});

// 2. ACTIVATE
self.addEventListener('activate', function(event) {
    console.log('âš¡ Service Worker: Activate');
    event.waitUntil(self.clients.claim());
});

// 3. FETCH - Intercept request
self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    console.log('ðŸŒ Fetch:', url.pathname);
    
    // Jika request ke /aboutblankspoofer/google.com
    if (url.pathname === POPUP_URL) {
        console.log('ðŸŽ¯ Intercept request ke:', POPUP_URL);
        
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        console.log('âœ… Mengembalikan dari cache');
                        return response;
                    }
                    console.log('ðŸ“ Membuat response baru');
                    return new Response(HTML_CONTENT, {
                        headers: { 'Content-Type': 'text/html' }
                    });
                })
        );
        return;
    }
    
    // Request lain lanjutkan normal
    event.respondWith(fetch(event.request));
});

console.log('âœ… Service Worker loaded');
