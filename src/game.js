// API-kutsujen hallinta
const API_BASE = '/api';

export async function fetchBalance() {
  const res = await fetch(`${API_BASE}/balance`);
  return res.json();
}

export async function spin(bet) {
  const res = await fetch(`${API_BASE}/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bet })
  });
  return res.json();
}
