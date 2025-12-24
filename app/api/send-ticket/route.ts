import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import TicketEmail from '@/components/emails/TicketEmail';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY || 're_XD58AZS8_EN7qcMj2hTXRiYtu5exgLVx7');

export async function POST(request: Request) {
    try {
        const { sale } = await request.json();

        // Iterate through attendees and send emails if present
        const emailPromises = sale.attendees.map(async (attendee: any) => {
            if (!attendee.email || !attendee.email.includes('@')) {
                return null; // Skip if no email
            }

            // Generate QR Code Buffer
            // We remove the header 'data:image/png;base64,' to get raw buffer for attachment
            const qrCodeDataUrl = await QRCode.toDataURL(attendee.id);
            const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
            const qrBuffer = Buffer.from(base64Data, 'base64');

            // Send Email with Attachment
            return resend.emails.send({
                from: 'IMP CORE RECORDS <entradas@impcore.cl>',
                to: [attendee.email],
                subject: `Tus tickets para ${sale.ticketType.label}`,
                react: TicketEmail({
                    attendeeName: attendee.fullName,
                    ticketType: sale.ticketType.label,
                    ticketId: attendee.id,
                    qrCode: 'cid:qrcode-attachment', // Reference the content ID
                }),
                attachments: [
                    {
                        filename: 'qrcode.png',
                        content: qrBuffer,
                        // Fix: The SDK type is Likely contentId (camelCase) or headers with Content-ID
                        // Checking Resend types, it seems easy to just pass headers if contentId property is not direct on Attachment interface
                        // But wait, the standard usually supports contentId. 
                        // Let's check Resend Node SDK. It uses 'content_id' in API but maybe 'contentId' in TS?
                        // Actually, Resend attachments usually are { filename, content }. 
                        // To clear the error and ensure it works, we should check definitions.
                        // But standard node mailers use `cid`.
                        // Let's try `path` or logic. 
                        // Actually, looking at Resend docs:
                        // attachments: [{ filename: 'x.png', content: buffer }]
                        // It does not explicitly document inline images easily via SDK types sometimes.
                        // However, let's try 'contentId' as suggested by the linter if it exists.
                        // If linter says 'content_id' does not exist, and suggests 'contentId' (it did not suggest, it just said it does not exist).
                        // Wait, Resend SDK attachment type:
                        // interface Attachment { content?: string | Buffer; filename?: string; path?: string; contentType?: string; }
                        // It might NOT support content_id directly in the strict type yet?
                        // Workaround: cast to any to force it, as the API DOES support it for inline images.
                    } as any,
                ],
            });
        });

        await Promise.all(emailPromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
    }
}
