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

            // Generate QR Code Buffer with High Quality
            const qrCodeDataUrl = await QRCode.toDataURL(attendee.id, { width: 600, margin: 2 });
            const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
            const qrBuffer = Buffer.from(base64Data, 'base64');

            // Send Email with Attachment
            return resend.emails.send({
                from: 'IMP CORE RECORDS <entradas@impcore.cl>',
                to: [attendee.email],
                subject: `Ticket: ${sale.ticketType.label} - ${attendee.fullName}`,
                react: TicketEmail({
                    attendeeName: attendee.fullName,
                    ticketType: sale.ticketType.label,
                    ticketId: attendee.id,
                }),
                attachments: [
                    {
                        filename: `ticket_${attendee.id.slice(0, 8)}.png`,
                        content: qrBuffer,
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
