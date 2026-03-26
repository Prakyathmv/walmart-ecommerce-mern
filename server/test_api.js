async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test_${Date.now()}@example.com`, password: 'password123', name: 'Verification Bob' })
    });
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
