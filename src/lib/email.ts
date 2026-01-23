
import { Resend } from 'resend';
import { env } from './env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export const EmailService = {
    send: async ({ to, subject, html, text }: EmailOptions) => {
        if (!resend) {
            console.log('⚠️ [Email Service] Resend API Key missing. Skipping email.');
            console.log(`To: ${to}\nSubject: ${subject}\nContent: ${text || 'HTML Content'}`);
            return { success: false, error: 'Misconfigured' };
        }

        try {
            const data = await resend.emails.send({
                from: 'The Void <system@thevoid.network>', // Update this with a verified domain if available
                to,
                subject,
                html,
                text
            });
            return { success: true, data };
        } catch (error) {
            console.error('[Email Service] Error:', error);
            return { success: false, error };
        }
    }
};

// Templates
export const EmailTemplates = {
    welcome: (username: string) => `
        <div style="font-family: monospace; background: #0a0a0a; color: #e5e5e5; padding: 20px;">
            <h1 style="color: #dc143c;">THE VOID // ACCESS GRANTED</h1>
            <p>Operative ${username},</p>
            <p>Katılım talebiniz Engizisyon tarafından onaylandı.</p>
            <p>Artık gölgelerin arasına karışabilirsin.</p>
            <br/>
            <a href="${env.NEXT_PUBLIC_APP_URL}/login" style="color: #00ff41; text-decoration: none;">>> SİSTEME GİRİŞ YAP</a>
        </div>
    `,
    missionAssigned: (missionTitle: string, squadName: string) => `
        <div style="font-family: monospace; background: #0a0a0a; color: #e5e5e5; padding: 20px;">
            <h1 style="color: #dc143c;">GÖREV ATANDI</h1>
            <p>DİKKAT: ${squadName}</p>
            <p>"${missionTitle}" operasyonu ekibine atandı.</p>
            <p>Derhal hazırlıklara başlayın.</p>
            <br/>
            <p><i>The Void System</i></p>
        </div>
    `
};
