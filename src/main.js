// src/main.js
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Find root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Create React root
const root = createRoot(rootElement);

// Render App
root.render(<App />);

<script>
// Import Supabase (add this script tag in head)
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://fqibacfhvvufevpkwynd.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Generate a temporary anonymous session ID (lasts for browser session)
function getAnonymousId() {
  let anonId = localStorage.getItem('wellbe_anon_id');
  if (!anonId) {
    anonId = 'anon_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('wellbe_anon_id', anonId);
  }
  return anonId;
}

// Start Journey
async function startJourney() {
  alert("🌱 Welcome to your Well-Be journey! You’ve earned 50 CarePoints for beginning.");
  
  const action = 'journey_started';
  const points = 50;

  await saveToSupabase(action);
  triggerZapier('CarePoints', points);

  // Optional: Show achievement
  showToast("You earned 50 CarePoints! 🌟");
}

// Start Survey
function startSurvey() {
  // Log action
  saveToSupabase('pulse_survey_started');

  // Open survey in new tab
  window.open('https://forms.gle/94Tfv2fzBtwT336G7');

  // Reward points after opening
  triggerZapier('Survey Started', 30);
  showToast("Survey opened! You earned 30 CarePoints 💬");
}

// Save to Supabase
async function saveToSupabase(action) {
  const { error } = await supabaseClient
    .from('wellbe_actions')
    .insert([
      { 
        action: action, 
        timestamp: new Date().toISOString(),
        user_id: getAnonymousId(),
        ip_address: 'anonymous' // In future, use middleware to capture real IP
      }
    ]);

  if (error) {
    console.error("Supabase insert failed:", error);
    // Still trigger Zapier so you get the event
    triggerZapier(action + ' (failed to save)', 0);
  }
}

// Trigger Zapier Webhook
async function triggerZapier(action, points) {
  try {
    await fetch('https://hooks.zapier.com/hooks/catch/your-zap-id/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action, 
        points, 
        user_id: getAnonymousId(),
        timestamp: new Date().toISOString()
      }),
      mode: 'no-cors' // Prevents CORS issues, but means you can't read response
    });
  } catch (err) {
    console.log("Zapier triggered (no response due to no-cors)");
  }
}

// Helper: Show a simple toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #b425aa; color: white; padding: 12px
