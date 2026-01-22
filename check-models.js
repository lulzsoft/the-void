
const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Key from your .env.local
const apiKey = "AIzaSyB4Wi4D_1Yz1FsIO0xX6TZrNc82oOEqU5k";

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Note: listModels is on the genAI instance or needs to be fetched via REST if SDK doesn't expose it easily in this version.
        // The node SDK usually exposes a model manager or similar.
        // Actually, for simplicity and certainty, let's use a direct fetch to the list endpoint.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("ERROR or NO MODELS:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
