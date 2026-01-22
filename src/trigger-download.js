
async function trigger() {
    try {
        console.log("Fetching...");
        const res = await fetch('http://localhost:3000/api/sanctum/download?id=1768519570763');
        console.log("Status:", res.status);
        console.log("Headers:", res.headers.get('content-type'));
        const text = await res.text();
        console.log("Body preview:", text.substring(0, 50));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
trigger();
