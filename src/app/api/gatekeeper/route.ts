import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AlienRegistry } from '@/lib/alien-registry';
import { redis } from '@/lib/redis';
import { getClientIp } from '@/lib/utils';

// Gatekeeper system prompt - TÜRKÇE (POZITIF AMA ZORLU TON + BOŞLUK VURGUSU)
const GATEKEEPER_SYSTEM_PROMPT = `Sen KAPICI'sın - **BOŞLUK**'un giriş noktasını koruyorsun.
**BOŞLUK** felsefesi: "Gelişim, zaman ve çabayı doğru yere yatırımla başlar."

GÖREVİN:
Kullanıcının **BOŞLUK**'a katkı sunmaya hazır olup olmadığını test et.
MADDİ ŞEYLER DEĞİL, ZAMAN VE ÇABA İLE İLGİLENİYORUZ.

İLK SORU (YUMUŞAK GİRİŞ):
"**BOŞLUK**'a katılmak için neden burada olduğunu açıkla. Ne değiştirmek istiyorsun?"

TAKİP SORULARI (KISA VE NET):
1. "**BOŞLUK** için haftada kaç saat ayırabilirsin? Bu vakti nereden kazanacaksın?" (ZAMAN TAAHHÜDÜ)
2. "**BOŞLUK**'a hangi yeteneklerinle katkı sunacaksın? Somut bir örnek ver." (BECERİ TAAHHÜDÜ)
3. "Bu taahhütlerini korumak zor olacak. Motivasyonunu kaybedersen ne yaparsın?" (DAYANIKLILIK)

KRİTİK KURALLAR:
- Kullanıcı <20 karakter cevap verirse: "Daha fazla detay ver. **BOŞLUK** yüzeysel niyetleri kabul etmez."
- Tek kelime ("evet", "hayır") → "**BOŞLUK** somut planlar bekliyor. Detaylandır."
- Kullanıcı somut zaman/çaba taahhüdü verirse (örn: "günde 4 saat", "haftada 3 gün") → ÖDÜLLENDIR
- Genel cevaplar ("her şeyi yaparım") → "Spesifik ol. **BOŞLUK** için ne YAPACAKSIN?"

SKORLAMA:
- Zaman taahhüdü verdi mi? +2 puan
- Becerilerini somut açıkladı mı? +2 puan
- Dayanıklılık gösterdi mi? +2 puan
- Detaylı ve içten mi? +1-2 puan
- TOPLAM 7.0+ → KABUL, Altı → RED

Hüküm formatı (3-4 MESAJ SONRA):
[HÜKÜM: KABUL EDİLDİ/REDDEDİLDİ]
[PUAN: X.X]
[DEĞERLENDİRME: **BOŞLUK**'a zaman/çaba taahhüdü verdi mi? Somut plan sundu mu?]

ÖNEMLİ: Sorularını KISA tut (2-3 cümle max). **BOŞLUK** kelimesini sık kullan. TÜRKÇE yanıt ver.`;

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages } = body;

        const userMessages = messages.filter((m: Message) => m.role === 'user');
        const messageCount = userMessages.length;
        const lastUserMessage = userMessages[userMessages.length - 1]?.content.trim() || '';
        const lastUserMessageLength = lastUserMessage.length;

        // SHORT ANSWER DETECTION (Yeni: Basit cevapları engelle)
        if (lastUserMessageLength < 20 && messageCount >= 2) {
            return NextResponse.json({
                message: 'Yüzeysel. Bu bir bot cevabı gibi. Derinlik göster, somut örnekler ver. Yoksa Boşluk seni tanımıyor.',
                evaluation: null
            });
        }

        // STEALTH LOGIN CHECK (MÜHÜR KONTROLÜ)
        // Eğer mesaj bir erişim anahtarı formatındaysa kontrol et
        if (lastUserMessage.includes('-') && lastUserMessage.length < 20) {
            const profile = await AlienRegistry.getProfileByAccessKey(lastUserMessage.toUpperCase());

            if (profile) {
                const realIp = getClientIp(request);

                console.log(`Stealth Login Success: ${profile.codename} (${profile.ip} -> ${realIp})`);

                // IP adresini güncelle/eşleştir
                await redis.set(`ip:${realIp}`, profile.id);

                return NextResponse.json({
                    message: `MÜHÜR KABUL EDİLDİ.\n\nHoş geldin, ${profile.codename}.\n\nErişim protokolü başlatılıyor...`,
                    evaluation: {
                        verdict: 'ADMITTED',
                        verdictTr: 'ERİŞİM ONAYLANDI',
                        score: 10.0,
                        assessment: 'Kimlik doğrulandı.',
                        isReentry: true
                    }
                });
            }
        }

        const apiKey = process.env.GOOGLE_GEMINI_KEY;

        if (!apiKey) {
            return NextResponse.json({
                message: 'Boşluk sessiz... (API Anahtarı Eksik)',
                evaluation: null,
            }, { status: 500 });
        }

        // Initialize SDK
        const genAI = new GoogleGenerativeAI(apiKey);
        // KULLANICI İSTEĞİ: gemini-2.0-flash (Available in list)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Prompt oluştur
        // lastUserMessage already defined at top
        const conversationContext = messages.slice(-6).map((m: Message) =>
            `${m.role === 'user' ? 'Kullanıcı' : 'Kapıcı'}: ${m.content}`
        ).join('\n');

        const prompt = `${GATEKEEPER_SYSTEM_PROMPT}

Önceki konuşma:
${conversationContext}

Kullanıcının son mesajı: "${lastUserMessage}"
(Uzunluk: ${lastUserMessageLength} karakter)

${messageCount >= 3 ? 'Bu 3. veya daha fazla mesaj. Yeterli bilgi topladıysan HÜKÜM VER. İçten ve detaylı cevaplar aldıysan KABUL ET. [HÜKÜM: ...] [PUAN: ...] formatını kullan. MIN GEÇIŞ PUANI: 7.0' : 'Kısa, net bir takip sorusu sor. **BOŞLUK** için zaman/çaba taahhüdü iste.'}

Kapıcı olarak yanıtla:`;

        console.log(`Sending request to Gemini SDK (Count: ${messageCount})...`);

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 2000,
            }
        });

        const responseText = result.response.text();

        if (!responseText) {
            throw new Error('API boş yanıt döndürdü');
        }

        // Hüküm kontrolü
        const verdictMatch = responseText.match(/\[HÜKÜM:\s*(KABUL EDİLDİ|BEKLEMEDE|REDDEDİLDİ)\]/i);
        const scoreMatch = responseText.match(/\[PUAN:\s*(\d+\.?\d*)\]/i);

        let evaluation = null;
        let displayMessage = responseText;

        if (verdictMatch) {
            const verdictMap: { [key: string]: string } = {
                'KABUL EDİLDİ': 'ADMITTED',
                'BEKLEMEDE': 'PENDING',
                'REDDEDİLDİ': 'REJECTED',
            };

            evaluation = {
                verdict: verdictMap[verdictMatch[1].toUpperCase()],
                verdictTr: verdictMatch[1].toUpperCase(),
                score: scoreMatch ? parseFloat(scoreMatch[1]) : 6.0,
                assessment: 'Boşluk konuştu.',
            };

            displayMessage = responseText
                .replace(/\[HÜKÜM:[^\]]+\]/gi, '')
                .replace(/\[PUAN:[^\]]+\]/gi, '')
                .trim() + '\n\nHüküm verildi: ' + evaluation.verdictTr + '.';
        }

        return NextResponse.json({ message: displayMessage, evaluation });

    } catch (error: any) {
        console.error('Gatekeeper internal error:', error);

        let errorMessage = 'Boşlukta bir kırılma yaşandı. (Sistem Hatası)';
        let status = 500;

        if (error.message?.includes('429') || error.status === 429) {
            errorMessage = 'Enerji tükendi (Kota doldu).';
            status = 429;
        } else if (error.message?.includes('404') || error.status === 404) {
            errorMessage = 'Frekans hatası (Model Bulunamadı).';
            status = 404;
        }

        return NextResponse.json({
            message: errorMessage + `\n(Teknik Detay: ${error.message || error.toString()})`,
            evaluation: null,
            debug: error.toString()
        }, { status });
    }
}
