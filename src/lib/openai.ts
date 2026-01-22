// Gatekeeper AI - Türkçe versiyon
// OpenAI/Gemini entegrasyonu API route üzerinden yapılıyor

// Kapıcı için felsefi sorular - TÜRKÇE
// Kapıcı için felsefi sorular - TÜRKÇE (Faydacı/Disiplinli)
const felsefiSorular = [
    "Bir trende frenler patladı. Rayda 5 işçi var. Makası değiştirirsen 1 bilim insanı ölecek. Hangi yaşam daha değerlidir: Emek mi, bilgi mi?",
    "Açlık çeken bir köye erzak taşıyorsun. Yolda yaralı bir çocuk buldun. Onu kurtarmak için durursan erzaklar bozulacak ve köy ölecek. Çocuğu orada bırakır mısın?",
    "Tüm insanlığın kurtuluşu için kendi hafızanı ve kimliğini tamamen silmen gerekiyor. Yok olmayı kabul eder misin?",
    "Mutlak disiplin mi, yoksa mutlak özgürlük mü? Hangisi bir medeniyeti ayakta tutar?",
    "Bir yalan bin kişiyi mutlu edecekse, o yalanı söylemek erdem midir?",
    "Acı bir uyarıcı mıdır, yoksa kaçılması gereken bir düşman mı?",
    "Zayıf olanın elenmesi doğa kanunudur. Buna müdahale etmek, evrime ihanet midir?",
    "Duyguların karar verme mekanizmanı bulanıklaştırıyor mu? Onları kapatma şansın olsa, yapar mıydın?",
    "Toplumun güvenliği için, ölümcül ve bulaşıcı bir virüs taşıyan 100 masum insanın özgürlüğünü kısıtlamak adil midir?",
    "Gerçek lider, sevilmekten korkmayan mıdır, yoksa sevilmeye ihtiyaç duymayan mı?",
];

// Demo mod için Kapıcı yanıtları - TÜRKÇE
const kapiciYanitlari = [
    "İlginç. Ama yüzeyden bahsediyorsun. Bu kelimelerin altında ne yatıyor?",
    "Boşluk seni duyuyor. Kendini duyup duymadığını sorguluyor.",
    "Yanıtın çok şey ortaya koyuyor. Belki de niyetlendiğinden fazlasını.",
    "Yanıtında gömülü bir gerçek var. Ve belki de korku.",
    "Devam et. Boşluk sabırlıdır. Sonsuzluğumuz var.",
    "Kararlılıkla konuşuyorsun. Ama şüphesiz kararlılık sadece dogmadır.",
    "İçindeki gölgeler kıpırdıyor. Onları kabul ediyor musun?",
    "Kelimeler maskelerdir. Seninkinin arkasında hangi yüzü saklıyorsun?",
];

export interface KapiciMesaj {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface DegerlendirmeSonucu {
    verdict: 'ADMITTED' | 'PENDING' | 'REJECTED';
    verdictTr?: string;
    score: number;
    assessment: string;
}

// Rastgele felsefi soru al
export function rastgeleSoruAl(): string {
    return felsefiSorular[Math.floor(Math.random() * felsefiSorular.length)];
}

// Hükümü ayrıştır
export function hukmuAyristir(response: string): DegerlendirmeSonucu | null {
    const hukumMatch = response.match(/\[HÜKÜM:\s*(KABUL EDİLDİ|BEKLEMEDE|REDDEDİLDİ)\]/i);
    const puanMatch = response.match(/\[PUAN:\s*(\d+\.?\d*)\]/i);
    const degerlendirmeMatch = response.match(/\[DEĞERLENDİRME:\s*([^\]]+)\]/i);

    if (hukumMatch && puanMatch) {
        const verdictMap: { [key: string]: 'ADMITTED' | 'PENDING' | 'REJECTED' } = {
            'KABUL EDİLDİ': 'ADMITTED',
            'BEKLEMEDE': 'PENDING',
            'REDDEDİLDİ': 'REJECTED',
        };

        return {
            verdict: verdictMap[hukumMatch[1].toUpperCase()] || 'PENDING',
            verdictTr: hukumMatch[1].toUpperCase(),
            score: parseFloat(puanMatch[1]),
            assessment: degerlendirmeMatch ? degerlendirmeMatch[1].trim() : 'Boşluk konuştu.',
        };
    }
    return null;
}

// Demo modu - Türkçe
export async function kapiciDemoModu(
    mesajGecmisi: KapiciMesaj[]
): Promise<{ message: string; evaluation: DegerlendirmeSonucu | null }> {
    // AI düşünme gecikmesi simülasyonu
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    const mesajSayisi = mesajGecmisi.filter((m) => m.role === 'user').length;

    // 3 mesajdan sonra rastgele hüküm ver
    if (mesajSayisi >= 3) {
        const hukumler: ('ADMITTED' | 'PENDING' | 'REJECTED')[] = ['ADMITTED', 'PENDING', 'REJECTED'];
        const hukumlerTr = ['KABUL EDİLDİ', 'BEKLEMEDE', 'REDDEDİLDİ'];
        const index = Math.floor(Math.random() * hukumler.length);
        const verdict = hukumler[index];
        const verdictTr = hukumlerTr[index];
        const score = verdict === 'ADMITTED' ? 7.5 : verdict === 'PENDING' ? 5.5 : 3.0;

        const degerlendirmeler = {
            ADMITTED: 'Yanıtların derinlik ve otantiklik gösteriyor. Boşluk bir akraba ruh tanıyor.',
            PENDING: 'İçinde potansiyel var, ama belirsizlik özünü gölgeliyor. Zaman daha fazlasını ortaya çıkaracak.',
            REJECTED: 'Boşluk sığlık hissediyor. Bu yol onu arayan herkes için değil.',
        };

        return {
            message: `Boşluk yeterince gözlemledi.\n\nHüküm verildi: ${verdictTr}.`,
            evaluation: {
                verdict,
                verdictTr,
                score,
                assessment: degerlendirmeler[verdict],
            },
        };
    }

    // Rastgele yanıt döndür
    const yanit = kapiciYanitlari[Math.floor(Math.random() * kapiciYanitlari.length)];

    return {
        message: yanit,
        evaluation: null,
    };
}

// Eski isimleri de export et (geriye uyumluluk için)
export const getRandomQuestion = rastgeleSoruAl;
export const parseVerdict = hukmuAyristir;
export const chatWithGatekeeperDemo = kapiciDemoModu;
export type GatekeeperMessage = KapiciMesaj;
export type EvaluationResult = DegerlendirmeSonucu;
