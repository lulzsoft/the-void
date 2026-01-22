// Native fetch available in Node 18+

async function testGatekeeperStrict() {
    const url = 'https://bosluk.vercel.app/api/gatekeeper';

    // Test 1: Short answer ("evet")
    console.log('\n=== TEST 1: Kısa cevap ("evet") ===');
    let messages = [
        { role: 'user', content: 'Her şeyi değiştirebilmek için' },
        { role: 'assistant', content: 'Gelişmek için şu anki mutlu hayatını yakabilir misin?' }
    ];

    for (let i = 0; i < 3; i++) {
        messages.push({ role: 'user', content: 'evet' });

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        const data = await res.json();
        console.log(`\nMesaj ${i + 2}:`);
        console.log('Response:', data.message);

        if (data.evaluation) {
            console.log('Hüküm:', data.evaluation.verdict);
            console.log('Puan:', data.evaluation.score);
            break;
        }

        messages.push({ role: 'assistant', content: data.message });
    }
}

testGatekeeperStrict();
