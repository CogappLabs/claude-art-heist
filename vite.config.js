import { defineConfig } from 'vite';

export default defineConfig({
    base: '/claude-art-heist/',
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
