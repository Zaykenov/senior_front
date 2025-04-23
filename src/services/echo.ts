import axios from "axios";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Define channel type for authorizer
interface Channel {
  name: string;
}

// Define options type for authorizer
interface AuthorizerOptions {
  [key: string]: any;
}

// Debug flag - set to true to enable verbose WebSocket debugging
const DEBUG = true;

// Ensure TypeScript recognizes Pusher globally
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

// Enable Pusher logger for debugging if needed
if (DEBUG) {
  Pusher.logToConsole = true;
}

// Configure and initialize Echo
window.Pusher = Pusher;

// Add debug message
console.log('Initializing Echo with settings:', {
  host: import.meta.env.VITE_REVERB_HOST,
  port: import.meta.env.VITE_REVERB_PORT,
  key: import.meta.env.VITE_REVERB_APP_KEY,
  scheme: import.meta.env.VITE_REVERB_SCHEME
});

window.Echo = new Echo<any>({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY as string, // Explicitly cast environment variable
  authorizer: (channel: Channel, options: AuthorizerOptions) => {
    return {
      authorize: (socketId: string, callback: (error: boolean, data: any) => void) => {
        if (DEBUG) {
          console.log(`Authorizing channel: ${channel.name}`, { socketId });
        }

        // Fixed URL format - removed the angle brackets
        axios
          .post("http://127.0.0.1:8000/api/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          },{
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          })
          .then((response) => {
            if (DEBUG) {
              console.log('Authorization successful:', response.data);
            }
            callback(false, response.data);
          })
          .catch((error) => {
            if (DEBUG) {
              console.error('Authorization failed:', error);
            }
            callback(true, error);
          });
      },
    };
  },
  wsHost: import.meta.env.VITE_REVERB_HOST as string,
  wsPort: (import.meta.env.VITE_REVERB_PORT as unknown as number) ?? 80,
  wssPort: (import.meta.env.VITE_REVERB_PORT as unknown as number) ?? 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
  enabledTransports: ["ws", "wss"],
  // Add connection hooks for debugging
  ...(DEBUG ? {
    authEndpoint: "http://127.0.0.1:8000/api/broadcasting/auth",
    disableStats: true,
    enabledTransports: ["ws", "wss", "xhr_streaming", "xhr_polling"],
    connectionTimeout: 10000,
  } : {})
});

// Add global connection event listeners if debugging is enabled
if (DEBUG) {
  window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Pusher connection established successfully!');
    console.log('Socket ID:', window.Echo.socketId());
  });
  
  window.Echo.connector.pusher.connection.bind('connecting', () => {
    console.log('⏳ Connecting to Pusher...');
  });
  
  window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('❌ Disconnected from Pusher');
  });
  
  window.Echo.connector.pusher.connection.bind('error', (error: any) => {
    console.error('⚠️ Pusher connection error:', error);
  });
}

// Export Echo instance for use in other files
export default window.Echo;