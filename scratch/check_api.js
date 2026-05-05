
const API = 'http://localhost:3001';

async function check() {
  try {
    const res = await fetch(`${API}/api/auth/status`);
    const data = await res.json();
    console.log('Auth Status:', data);
    
    const settingsRes = await fetch(`${API}/api/settings`);
    const settings = await settingsRes.json();
    console.log('Settings:', settings);
  } catch (err) {
    console.error('Check failed:', err);
  }
}

check();
