/**
 * Chatbot Embed Entry Point
 * 
 * This script is designed to be loaded on any external website via a <script> tag.
 * It creates a shadow DOM container and renders the EmbeddableChatWidget inside it.
 * 
 * Usage:
 *   <script src="https://your-lead-ms-domain.com/embed/chatbot.js"
 *     data-api-url="https://your-lead-ms-domain.com/api"
 *     data-brand="Verve Innovation"
 *     data-color="#F59E0B"
 *     data-position="right"
 *     data-greeting="Hello! How can we help you today?">
 *   </script>
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import EmbeddableChatWidget from '../components/chat/EmbeddableChatWidget.jsx';

(function () {
  // Prevent double-initialization
  if (window.__LEADMS_CHATBOT_LOADED__) return;
  window.__LEADMS_CHATBOT_LOADED__ = true;

  // Read config from the <script> tag's data attributes
  const currentScript = document.currentScript || document.querySelector('script[data-api-url]');
  const config = {
    apiUrl: currentScript?.dataset?.apiUrl || 'http://localhost:4000/api',
    brandName: currentScript?.dataset?.brand || 'AI Assistant',
    primaryColor: currentScript?.dataset?.color || '#2563eb',
    position: currentScript?.dataset?.position || 'right',
    greeting: currentScript?.dataset?.greeting || null,
  };

  // Create a container element
  const container = document.createElement('div');
  container.id = 'leadms-chatbot-root';
  container.style.cssText = 'position: fixed; z-index: 99999; pointer-events: none;';
  document.body.appendChild(container);

  // We use a regular div (not shadow DOM) for maximum compatibility
  // The widget uses all inline styles, so no CSS conflicts
  const widgetRoot = document.createElement('div');
  widgetRoot.style.cssText = 'pointer-events: auto;';
  container.appendChild(widgetRoot);

  // Render the React widget
  const root = ReactDOM.createRoot(widgetRoot);
  root.render(
    React.createElement(EmbeddableChatWidget, {
      apiUrl: config.apiUrl,
      brandName: config.brandName,
      primaryColor: config.primaryColor,
      position: config.position,
      greeting: config.greeting,
    })
  );
})();
