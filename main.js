// Initialize Supabase
const supabaseUrl = 'https://supabase.com/dashboard/project/isresrnchbbmydquqakq';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaWJhY2ZodnZ1ZmV2cGt3eW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTQyMDcsImV4cCI6MjA3MTYzMDIwN30.m_lbwxM3c0CW0-Q0ltsHYQyQLoqy9dsL0rJciJ6uBqA';
const { createClient } = supabase;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Start Journey
function startJourney() {
  alert("Welcome to your Well-Be journey. You’ve earned 50 CarePoints for beginning.");
  saveToSupabase('journey_started');
  triggerZapier('CarePoints', 50);
}

// Start Survey
function startSurvey() {
  alert("Opening the Quick Well-Being Pulse Survey...");
  // Redirect to survey
  window.open('https://your-survey-url.com', '_blank');
  saveToSupabase('pulse_survey');
  triggerZapier('Survey', 30);
}

// Save to Supabase
async function saveToSupabase(action) {
  const { error } = await supabase
    .from('wellbe_actions')
    .insert([
      { action: action, timestamp: new Date() }
    ]);
  if (error) console.error("Save failed:", error);
}

// Trigger Zapier
function triggerZapier(action, points) {
  fetch('https://hooks.zapier.com/hooks/catch/...', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, points, user_id: 'anonymous' })
  });
}
