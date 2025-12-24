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

            // Generate QR Code
            const qrCodeUrl = await QRCode.toDataURL(attendee.id);

            // Send Email
            // Note: "onboarding@resend.dev" only works if verified or sending to self.
            // If user has verified domain, they should change "from".
            // For MVP without domain verification, we are stuck with test mode constraints (only sends to account email).
            // However, if the user registers their domain (impcore.cl) in Resend dashboard, they can change this.
            // I will put a placeholder "entradas@impcore.cl" if they set it up, otherwise fallback to "onboarding@resend.dev".
            // To ensure it works NOW for the user's test email, I'll use onboarding.

            return resend.emails.send({
                from: 'Ticket Manager <onboarding@resend.dev>',
                to: [attendee.email],
                subject: `Tus tickets para ${sale.ticketType.label}`,
                react: TicketEmail({
                    attendeeName: attendee.fullName,
                    ticketType: sale.ticketType.label,
                    ticketId: attendee.id,
                    qrCode: qrCodeUrl,
                }),
            });
        });

        await Promise.all(emailPromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
    }
}
