# Frontend Authentication UI

This project is a React frontend for authentication pages (login, register, and forgot password) built with Vite and TypeScript.

## Features

- Login page
- Registration page
- Forgot password page
- Responsive design
- Form validation
- API integration ready

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the development server at `http://localhost:5173`.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the production build.

## API Integration

The project is set up to connect to a backend API. You'll need to update the API URL in `src/services/api.ts` to point to your actual backend server.

```typescript
const API_URL = 'http://your-api-url.com/api';
```

## License

MIT
