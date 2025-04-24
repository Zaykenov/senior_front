// src/services/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window { Pusher: any; Echo: Echo; }
}

export let echo: Echo | null = null;

export const initializeEcho = (token: string) => {
  console.log('Initializing WebSocket connection...');
  console.log('WebSocket config:', {
    key: import.meta.env.VITE_REVERB_APP_KEY,
    host: import.meta.env.VITE_REVERB_HOST,
    port: import.meta.env.VITE_REVERB_PORT,
    scheme: import.meta.env.VITE_REVERB_SCHEME
  });
  
  try {
    window.Pusher = Pusher;
    
    // Enable Pusher logging for debugging
    Pusher.logToConsole = true;
    
    echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      cluster: import.meta.env.VITE_REVERB_APP_CLUSTER,
      // Use full API URL for authentication endpoint
      authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT),
      forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
      // Replace deprecated option with the new one
      enableStats: false,
      encrypted: true,
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });
    
    // Assign to window for global access
    window.Echo = echo;
    
    // Add connection event listeners
    echo.connector.pusher.connection.bind('connected', () => {
      console.log('✅ WebSocket connected successfully!', {
        socketId: echo?.socketId(),
        state: echo?.connector.pusher.connection.state
      });
    });
    
    echo.connector.pusher.connection.bind('error', (error: any) => {
      console.error('⛔ WebSocket connection error:', error);
    });
    
    echo.connector.pusher.connection.bind('disconnected', () => {
      console.warn('🔌 WebSocket disconnected');
    });
    
    echo.connector.pusher.connection.bind('connecting', () => {
      console.log('🔄 WebSocket connecting...');
    });
    
    return echo;
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket connection:', error);
    return null;
  }
};

export const terminateEcho = () => {
  if (echo) {
    console.log('Terminating WebSocket connection');
    echo.disconnect();
    echo = null;
  }
  window.Echo?.disconnect();
};

export default echo;
