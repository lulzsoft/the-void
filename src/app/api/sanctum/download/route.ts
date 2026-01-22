
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
    }

    if (id === 'test') {
        // Serve a minimal valid PDF for testing delivery
        const pdfContent = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 24 Tf 100 700 Td (Test PDF Works!) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000203 00000 n 
0000000298 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
377
%%EOF`;
        const buffer = Buffer.from(pdfContent);
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="test.pdf"',
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'no-store, must-revalidate',
            },
        });
    }

    try {
        const data = db.read();
        const message = data.messages.find(m => m.id === id);

        if (!message || !message.fileData) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json({
            filename: message.text || 'download.pdf',
            fileData: message.fileData,
            type: message.type
        });

    } catch (error) {
        console.error("Download Error:", error);
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
