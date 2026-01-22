
const fs = require('fs');
const path = require('path');

// Mocking the DB logic to avoid import issues with aliases in standalone script
const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

function readDb() {
    if (!fs.existsSync(DB_PATH)) {
        console.log("DB file not found at:", DB_PATH);
        return { messages: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function testDownload() {
    console.log("Reading DB...");
    const data = readDb();

    // Find the 'anaa.pdf' message or the specific ID
    const targetId = "1768519570763";
    const message = data.messages.find(m => m.id === targetId);

    if (!message) {
        console.error("Message not found:", targetId);
        return;
    }

    console.log("Found message:", message.id);
    console.log("Text:", message.text);
    console.log("Type:", message.type);

    if (!message.fileData) {
        console.error("No fileData present");
        return;
    }

    console.log("FileData length:", message.fileData.length);
    console.log("FileData prefix:", message.fileData.substring(0, 50));

    try {
        const parts = message.fileData.split(',');
        console.log("Split parts:", parts.length);

        if (parts.length !== 2) {
            console.error("Invalid Data URI format. Parts:", parts.length);
            // If it's just base64, maybe manipulate it?
            return;
        }

        const metadata = parts[0];
        const base64 = parts[1];

        console.log("Metadata:", metadata);
        // console.log("Base64 start:", base64.substring(0, 20));

        const match = metadata.match(/:(.*?);/);
        const mime = match ? match[1] : 'application/octet-stream';
        console.log("Mime:", mime);

        const buffer = Buffer.from(base64, 'base64');
        console.log("Buffer created. Size:", buffer.length);

        const safeName = (message.text || 'download.bin').replace(/[^\w\s.-]/gi, '_');
        const encodedName = encodeURIComponent(message.text || 'download.bin');

        console.log("Safe Name:", safeName);
        console.log("Encoded Name:", encodedName);
        console.log("Success! File logic seems valid.");

    } catch (e) {
        console.error("Error during processing:", e);
    }
}

testDownload();
