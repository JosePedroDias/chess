// this is needed for stockfish to work (both the headers and the mime types)...

const express = require('express');

const mimeData = {
    ".html": "text/html; charset=utf-8",
    "css":  "text/css; charset=utf-8",
    "js":   "application/javascript; charset=utf-8",
    ".png":  "image/png",
    ".jpeg": "image/jpeg",
    ".jpg":  "image/jpeg",
    ".pdf":  "application/pdf",
    ".txt":  "text/plain",
    ".svg":  "image/svg+xml; charset=utf-8",
    ".xml":  "application/xml",
    ".ttf":  "application/x-font-ttf",
    ".woff": "application/x-font-woff",
    ".json": "application/json; charset=utf-8",
    ".wasm": "application/wasm",
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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
