
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const TARGET_ID = "1768519570763"; // The ID from previous logs

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
    const base64 = parts[1];
    const buffer = Buffer.from(base64, 'base64');
    const header = buffer.subarray(0, 10).toString('utf-8');

    console.log(`DB File Header (Hex): ${buffer.subarray(0, 10).toString('hex')}`);
    console.log(`DB File Header (Text): ${header}`);

    if (header.startsWith('%PDF')) {
        console.log("✅ DB Data is a valid PDF.");
    } else {
        console.error("❌ DB Data is NOT a valid PDF. It starts with: " + header);
    }

    fs.writeFileSync('db_extracted.pdf', buffer);
    console.log("Saved db_extracted.pdf");

    console.log("\n--- 2. Checking API Output ---");
    // We can't use fetch in this node env easily without globals or polyfills sometimes, 
    // so let's use curl via exec which mirrors the 'download' action closer.

    const curlCmd = `curl -s "http://localhost:3000/api/sanctum/download?id=${TARGET_ID}" -o api_downloaded.pdf`;

    exec(curlCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Curl error: ${error.message}`);
            return;
        }

        if (!fs.existsSync('api_downloaded.pdf')) {
            console.error("API download failed to create file");
            return;
        }

        const apiBuf = fs.readFileSync('api_downloaded.pdf');
        const apiHeader = apiBuf.subarray(0, 10).toString('utf-8');

        console.log(`API File Size: ${apiBuf.length}`);
        console.log(`API File Header: ${apiHeader}`);

        if (apiBuf.equals(buffer)) {
            console.log("✅ API output MATCHES DB content exactly.");
        } else {
            console.log("❌ API output DOES NOT match DB content.");
            console.log(`Diff sizes -> DB: ${buffer.length}, API: ${apiBuf.length}`);
            // Check if API returned JSON error
            if (apiHeader.trim().startsWith('{')) {
                console.log("API returned JSON error instead of PDF:", apiBuf.toString());
            }
        }
    });
}

verify();
