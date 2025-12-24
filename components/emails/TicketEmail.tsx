import * as React from 'react';
import {
    Html,
    Body,
    Container,
    Text,
    Img,
    Heading,
    Section,
    Row,
    Column,
    Hr,
    Tailwind,
    Link,
} from '@react-email/components';

interface TicketEmailProps {
    attendeeName: string;
    ticketType: string;
    ticketId: string;
    qrCode: string; // Base64 data url
    eventDetails?: {
        name: string;
        date: string;
        location: string;
    };
}

export default function TicketEmail({
    attendeeName,
    ticketType,
    ticketId,
    qrCode,
    eventDetails = {
        name: 'IMMERSIVE CINEMA: WHITE SHADOWS',
        date: 'Viernes, 28 de Noviembre 2025 - 21:00hrs',
        location: 'Club Berlín Av. Vicuña Mackenna 1695'
    }
}: TicketEmailProps) {
    return (
        <Html>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: '#feac00',
                                dark: '#0a0a0a',
                                card: '#171717',
                            },
                        },
                    },
                }}
            >
                <Body className="bg-white font-sans">
                    <Container className="mx-auto my-[40px] max-w-[480px]">

                        {/* Header / Logo */}
                        <Section className="bg-black p-5 rounded-t-lg text-center">
                            <Img
                                src="https://raw.githubusercontent.com/impcorecl/ticket-manager-mv/main/public/logo.jpg"
                                alt="IMP CORE RECORDS"
                                width="150"
                                className="mx-auto filter invert"
                                style={{ filter: 'invert(1)' }}
                            />
                            {/* Note: Startups often use public URLs for logo in emails. Localhost won't work in email clients. 
                  I'm using a placeholder public URL assuming they push to the repo I just saw. 
                  Ideally, we'd use the deployed Vercel URL, but I don't have it yet. 
                  Use text fallback if image breaks? Or maybe base64? Base64 support is spotty in emails. 
                  For now I'll use a placeholder or try to point to the repo raw content if it exists. 
                  Wait, the user just pushed to https://github.com/impcorecl/ticket-manager-mv.git 
                  So I can link to the raw image there if I commit it. I haven't committed the logo yet.
                  I will use a generic placeholder or no image for safety if I can't guarantee URL. 
                  Actually, user uploaded logo. I will use a placeholder text if I can't serve it. 
                  Let's try to host it on vercel? Vercel public url.
                  Let's use a solid styling fallback. 
              */}
                        </Section>

                        {/* Greeting */}
                        <Section className="px-5 py-6 bg-gray-50 text-center border-x border-gray-200">
                            <Text className="text-base leading-6 text-gray-700">
                                <span className="font-bold text-black">{attendeeName}</span>, ¡Te han enviado los siguientes Ticket(s)!
                            </Text>
                        </Section>

                        {/* Ticket Card */}
                        <Section className="bg-gray-100 p-0 border-x border-gray-200">
                            <Container className="bg-white mx-auto max-w-[400px] border border-gray-300 rounded-lg overflow-hidden shadow-sm my-4">

                                {/* Event Image (Optional/Placeholder) */}
                                <Section className="bg-black h-32 flex items-center justify-center">
                                    <Heading className="text-white text-xl font-bold tracking-widest text-center m-0">IMMERSE</Heading>
                                </Section>

                                <Section className="p-6 text-center">
                                    <Img src={qrCode} width="180" height="180" alt="QR Code" className="mx-auto mb-4" />

                                    <Heading as="h2" className="text-lg font-bold text-gray-900 m-0 mb-1">
                                        {eventDetails.name}
                                    </Heading>
                                    <Text className="text-lg text-gray-600 m-0 mb-4 font-medium uppercase">
                                        {ticketType}
                                    </Text>

                                    <Text className="text-sm text-red-600 font-bold m-0 mb-2">
                                        Válido para: 1 Persona
                                    </Text>

                                    <Section className="bg-gray-50 rounded p-3 text-xs text-gray-500 mt-4 border border-gray-100">
                                        <Text className="m-0 mb-1">ID Ticket: <span className="font-mono text-gray-800">{ticketId.slice(0, 8).toUpperCase()}</span></Text>
                                        <Text className="m-0">{eventDetails.date}</Text>
                                        <Text className="m-0">{eventDetails.location}</Text>
                                    </Section>
                                </Section>

                            </Container>
                        </Section>

                        {/* Footer */}
                        <Section className="bg-white border-x border-b border-gray-200 rounded-b-lg p-6 text-center">
                            <Text className="text-xs text-gray-400 m-0">
                                Producido por IMP CORE RECORDS
                            </Text>
                        </Section>

                        <Text className="text-center text-xs text-gray-400 mt-4">
                            Si tienes dudas contacta a soporte@impcore.cl
                        </Text>

                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
