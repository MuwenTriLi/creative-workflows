import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export default defineConfig({
  base: "./",
  plugins: [react(), {
    name: 'local-export-review',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req,res,next) => {
        if (!req.url?.startsWith('/__local-export/')) return next();
        // Local development only. Never expose a file-write route in the build.
        if (!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '') || req.method !== 'POST' || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(req.headers.origin ?? '')) {
          res.statusCode=403;res.end();return;
        }
        const name=req.url.slice('/__local-export/'.length);
        if (!/^[a-zA-Z0-9_-]+\.mp4$/.test(name)) {res.statusCode=400;res.end();return;}
        try {
          let size=0;const chunks:Buffer[]=[];
          for await(const chunk of req) {
            size+=chunk.length;
            if(size>256*1024*1024) {res.statusCode=413;res.end();return;}
            chunks.push(Buffer.from(chunk));
          }
          const folder=resolve(server.config.root,'.local-exports');
          await mkdir(folder,{recursive:true});await writeFile(resolve(folder,name),Buffer.concat(chunks));
          res.setHeader('Content-Type','application/json');res.end(JSON.stringify({saved:true}));
        } catch {res.statusCode=500;res.end();}
      });
    },
  }],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
});
