import { RESET_CODE_TTL } from './constants';

/**
 * Email templates for BOŞLUK platform
 */

interface EmailTemplate {
    subject: string;
    html: string;
    text: string; // Plain text fallback
}

/**
 * Password reset email template
 */
export function getPasswordResetEmail(code: string, username: string): EmailTemplate {
    const expiryMinutes = RESET_CODE_TTL / 60;

    return {
        subject: 'BOŞLUK - Şifre Sıfırlama Kodu',
        html: `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Şifre Sıfırlama</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace; background-color: #000;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background: #0a0a0a; border: 1px solid #333;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; border-bottom: 2px solid #8B0000;">
                            <h1 style="margin: 0; color: #8B0000; font-size: 32px; font-weight: bold; letter-spacing: 4px;">
                                BOŞLUK
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px; color: #fff;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5;">
                                Merhaba <strong>${escapeHtml(username)}</strong>,
                            </p>
                            <p style="margin: 0 0 30px; font-size: 14px; line-height: 1.6; color: #ccc;">
                                Şifre sıfırlama talebiniz alındı. Aşağıdaki kodu kullanarak yeni şifrenizi belirleyebilirsiniz:
                            </p>
                            
                            <!-- Code Box -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="background: #1a1a1a; border: 2px solid #8B0000; border-radius: 8px; padding: 30px; text-align: center;">
                                        <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #8B0000; font-family: 'Courier New', monospace;">
                                            ${code}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 20px; font-size: 14px; color: #ccc;">
                                ⏱️ Bu kod <strong>${expiryMinutes} dakika</strong> geçerlidir.
                            </p>
                            
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; font-size: 12px; color: #666;">
                                <p style="margin: 0 0 10px;">
                                    🛡️ <strong>Güvenlik Uyarısı:</strong>
                                </p>
                                <ul style="margin: 0; padding-left: 20px;">
                                    <li>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin</li>
                                    <li>Bu kodu kimseyle paylaşmayın</li>
                                    <li>BOŞLUK asla şifrenizi sormaz</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background: #050505; border-top: 1px solid #333;">
                            <p style="margin: 0; font-size: 11px; color: #666; line-height: 1.5;">
                                Bu e-posta BOŞLUK şifre sıfırlama sistemi tarafından otomatik olarak gönderilmiştir.<br>
                                © 2026 BOŞLUK - Tüm hakları saklıdır.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
BOŞLUK - Şifre Sıfırlama Kodu

Merhaba ${username},

Şifre sıfırlama talebiniz alındı.

Doğrulama Kodu: ${code}

Bu kod ${expiryMinutes} dakika geçerlidir.

GÜVENLİK UYARISI:
- Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin
- Bu kodu kimseyle paylaşmayın
- BOŞLUK asla şifrenizi sormaz

© 2026 BOŞLUK
        `.trim()
    };
}

/**
 * HTML escape helper
 */
function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
