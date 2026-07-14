import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { runScripts: "dangerously" });
const window = dom.window;
global.document = window.document;
global.window = window;

const scriptContent = fs.readFileSync('/Users/sudipbohara/Desktop/LEAD_MS/frontend/public/chat-widget.js', 'utf8');

try {
  const scriptEl = document.createElement('script');
  scriptEl.id = 'leadms-chatbot';
  scriptEl.textContent = scriptContent;
  document.body.appendChild(scriptEl);
  console.log("Widget injected.");
  console.log("HTML:", document.body.innerHTML.substring(0, 500));
  if (document.getElementById('leadms-chatbot-root')) {
     console.log("Root found!");
  } else {
     console.log("Root NOT found.");
  }
} catch (e) {
  console.error("Error executing script:", e);
}
