import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { LangProvider } from './i18n.jsx';

class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="crash">
        <h2>Something went wrong</h2>

        <p>
          {String(
            this.state.error.message || this.state.error
          )}
        </p>

        <button
          className="btn primary"
          onClick={() => window.location.reload()}
        >
          Reload app
        </button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <LangProvider>
      <App />
    </LangProvider>
  </ErrorBoundary>
);

// Register the service worker only for production builds.
// This avoids stale cached assets interfering with Vite development.
if (
  import.meta.env.PROD &&
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'KannadaSaathi service worker registered:',
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          'Service worker registration failed:',
          error
        );
      });
  });
}