<script>
// ✅ SAFE: Use real Supabase project URL
const supabaseUrl = 'https://isresrnchbbmydquqakq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaWJhY2ZodnZ1ZmV2cGt3eW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTQyMDcsImV4cCI6MjA3MTYzMDIwN30.m_lbwxM3c0CW0-Q0ltsHYQyQLoqy9dsL0rJciJ6uBqA';

// Import Supabase (add this script tag in head)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
  window.open('https://your-survey-url.com', '_blank');

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
