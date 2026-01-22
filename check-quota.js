
const apiKey = 'AIzaSyDm_Yr9fFbKGXuVwXEoYjI6osvNwUTZXGw'; // Yeni Key
const modelName = 'gemini-2.0-flash'; // Kullandığımız Model

async function checkQuota() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const body = {
        contents: [{ role: 'user', parts: [{ text: "Quota check status." }] }]
    };

    console.log(`Checking quota for model: ${modelName} with new key...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);

        // Headerları kontrol et
        console.log("--- HEADERS ---");
        response.headers.forEach((value, key) => {
            // Özellikle rate limit headerlarını arıyoruz
            if (key.includes('limit') || key.includes('quota') || key.includes('google')) {
                console.log(`${key}: ${value}`);
            }
        });

        if (response.status !== 200) {
            const errorBody = await response.text();
            console.log("ERROR BODY:", errorBody);
        } else {
            console.log("SUCCESS: Request completed normally.");
        }

    } catch (error) {
        console.error("Error making request:", error);
    }
}

checkQuota();
