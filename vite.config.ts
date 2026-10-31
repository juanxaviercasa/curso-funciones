import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'apps/web',plugins:[react()],define:{'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY':JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_YmV0dGVyLWNvbmRvci0xNTAzLmNsZXJrLmFjY291bnRzLmRldiQ')},build:{outDir:'../../dist',emptyOutDir:true},server:{proxy:{'/api':'http://127.0.0.1:8787'}}});
