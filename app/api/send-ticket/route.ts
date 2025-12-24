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
                        content_id: 'qrcode-attachment', // Removing brackets
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
