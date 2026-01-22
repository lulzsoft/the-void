
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const TARGET_ID = "1768519570763";

async function verify() {
    console.log("--- 1. Checking DB/File Integrity ---");
    if (!fs.existsSync(DB_PATH)) {
        console.error("DB not found");
        return;
    }
    const dbRaw = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(dbRaw);
    const msg = db.messages.find(m => m.id === TARGET_ID);

    if (!msg) {
        console.error("Message not found in DB");
        return;
    }

    const parts = msg.fileData.split(',');
    const base64FromDb = parts[1];
    const bufferFromDb = Buffer.from(base64FromDb, 'base64');

    // Check first 10 bytes
    const dbHeaderHex = bufferFromDb.subarray(0, 10).toString('hex');
    const dbHeaderText = bufferFromDb.subarray(0, 10).toString('utf-8');

    console.log(`DB File Header (Hex): ${dbHeaderHex}`);
    console.log(`DB File Header (Text): ${dbHeaderText}`);

    if (dbHeaderText.startsWith('%PDF')) {
        console.log("✅ DB Data is a valid PDF.");
    } else {
        console.error("❌ DB Data is NOT a valid PDF. It starts with: " + dbHeaderText);
    }

    console.log("\n--- 2. Checking API Output ---");

    try {
        const res = await fetch(`http://127.0.0.1:3000/api/sanctum/download?id=${TARGET_ID}`);
        console.log("API Status:", res.status);
        console.log("API Content-Type:", res.headers.get('content-type'));
        console.log("API Content-Disposition:", res.headers.get('content-disposition'));

        const arrayBuffer = await res.arrayBuffer();
        const apiBuffer = Buffer.from(arrayBuffer);

        const apiHeaderHex = apiBuffer.subarray(0, 10).toString('hex');
        const apiHeaderText = apiBuffer.subarray(0, 10).toString('utf-8');

        console.log(`API File Size: ${apiBuffer.length}`);
        console.log(`API File Header (Hex): ${apiHeaderHex}`);
        console.log(`API File Header (Text): ${apiHeaderText}`);

        if (apiBuffer.equals(bufferFromDb)) {
            console.log("✅ API output MATCHES DB content exactly.");
        } else {
            console.log("❌ API output DOES NOT match DB content.");
            console.log(`Diff sizes -> DB: ${bufferFromDb.length}, API: ${apiBuffer.length}`);

            // Check if it looks like Base64 (JVBERi...)
            if (apiHeaderText.startsWith('JVBER')) {
                console.log("⚠️ API is returning Base64 TEXT, not binary PDF!");
            }
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

verify();
