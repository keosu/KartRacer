import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
            },
        },
    },
    build: {
        outDir: 'dist/public',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
