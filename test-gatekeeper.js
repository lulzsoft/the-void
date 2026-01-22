// Native fetch is available in Node 18+

async function testGatekeeper() {
    const url = 'https://bosluk.vercel.app/api/gatekeeper';
    const payload = {
        messages: [
            { role: 'user', content: 'Kapıyı aç.' }
        ]
    };

    try {
        console.log(`Sending request to ${url}...`);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log('Response Body:', text);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testGatekeeper();
