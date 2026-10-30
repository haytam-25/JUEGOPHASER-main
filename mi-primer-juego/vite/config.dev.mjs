import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                // Vite 8 (Rolldown) solo acepta una funcion: Phaser va en su propio archivo
                manualChunks: (id) => id.includes('node_modules/phaser') ? 'phaser' : undefined
            }
        },
    },
    server: {
        port: 8080
    }
});
