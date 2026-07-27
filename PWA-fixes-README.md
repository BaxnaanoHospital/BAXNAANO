# Baxnaano Hospital — PWA + Scan-card fixes

Waxa la abuuray 3 file: **manifest.json**, **sw.js**, iyo **icon-192.png / icon-512.png**.
Ku dar 4-da faylkan folder-ka file-kaaga (`index.html`) — isla meel keliya.

## 1. Waxa aad ku darto `<head>` (kadib jsQR script-ka)

```html
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#0a2540">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="./icon-192.png">
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

`manifest.json` waa waxa iOS/Android u sheegaya "app iga dhig" (Add to Home Screen /
Install), `theme-color` iyo `apple-touch-icon` waa muuqaalka icon-ka marka la rakibo.

## 2. Waxa aad ku darto gadaal script-ka (kahor `</body>`)

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
</script>
```

Tan ayaa nidaamka u beddesha PWA dhab ah (offline shell + install prompt).
**Muhiim:** service worker-ku wuxuu u shaqeeyaa keliya haddii bogga lagu furo
`https://` (ama `localhost`). GitHub Pages already https, so this works as-is
once uploaded there.

## 3. Sababta scan-ku uusan si sax ah u shaqeynayn

Kaadhka aad la wareegtay (Family Care Card, sawirka 2 & 4) **QR code kuma yaal**
— waxa kaliya oo ku qoran waa magaca, degmada iyo telefoonka qoraal ahaan. QR-ga
kaliya ee ka jira waa kan kaarka ganacsiga guud (sawir 1 & 3), oo ku wac
bogga Facebook/Instagram-ka, ma aha lambarka kaadhka (`BH-CARD-0001`). Sidaas
darteed camera-ku wax buu sawiraa laakiin lambarkaas kuma jiro meel — `jsQR`
ma heli karo wax uusan jirin.

**Xalka:** waxaan ku daray qaybta hoose ee la yidhaahdo **"Cards" (Admin)**
oo:
1. Abuurta kaadh cusub oo leh `cardId` (tusaale `BH-CARD-0002`).
2. Si otomaatig ah u soo saarta QR sawir ka socda `cardId`-kaas (`qrcode.js`).
3. Ku daabaca (print) QR-gaas kaadhka dhabta ah — marka la daabaco oo la
   dhejiyo kaadhka, scan-ku wuu shaqeyn doonaa 100%, sababtoo ah hadda QR-gu
   wuxuu sitaa `cardId`-ka saxda ah.

Faylka `cards-admin-patch.html` (hoose) wuxuu ku jiraa koodhka HTML/JS ee la
geliyo si loo daro qaybtan admin-ka.

## 4. Waxyaabo kale oo la hubiyay

- Scanner-ku wuxuu u baahan yahay in bogga la furo `https://` (sida sare lagu
  sheegay) — camera permission-ka browser-ku si toos ah uma ogolaanayo `http://`
  ama fayl kaliya oo local ah.
- Haddii aad ku tijaabinayso desktop-ga (laptop) camera, hubi in
  `navigator.mediaDevices` la ogolaaday browser settings-ka.
