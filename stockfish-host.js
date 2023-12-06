// this is needed for StockFish to work (both the headers and the mime types)...
const PORT = 3000;

const express = require('express');

const mimeData = {
    ".js":   "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".wasm": "application/wasm",

    ".html": "text/html; charset=utf-8",
    ".css":  "text/css; charset=utf-8",
    
    ".png":  "image/png",
    ".jpeg": "image/jpeg",
    ".jpg":  "image/jpeg",
    ".svg":  "image/svg+xml; charset=utf-8",

    ".mp3": "audio/mpeg",

    ".ttf":  "application/x-font-ttf",
    ".woff": "application/x-font-woff",
    
    ".xml":  "application/xml",
    ".pdf":  "application/pdf",
    ".txt":  "text/plain",
};

const app = express();

app.use((req, res, next) => {
    const ext = req.url.substring(req.url.indexOf('.'));
    const mime = mimeData[ext];
    if (mime) {
        //console.log('url', req.url, 'mime:', mime);
        res.set(`Content-Type`, mime);
    }
    res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    res.set('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

app.use(express.static('.'));

app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));
