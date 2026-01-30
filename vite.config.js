import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/iiif': {
                target: 'https://www.artic.edu',
                changeOrigin: true,
                secure: true
            }
        }
    }
});
