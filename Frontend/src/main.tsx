// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'


async function initApp() {
    console.log('🚀 Initializing app...');

    // Изчакай CSRF токена да се зареди
    //await initializeCsrf();

    console.log('✅ CSRF initialized, rendering app...');

    createRoot(document.getElementById('root')!).render(
            <App />
    );
}

// Извикай async функцията
initApp();