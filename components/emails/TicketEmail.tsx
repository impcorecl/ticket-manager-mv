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
    // qrCode prop removed as it is now attachment only
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
    // qrCode, 
    eventDetails = {
        name: 'IMPCORE RECORDS: 2 AÑOS DE MÚSICA',
        date: 'Viernes, 2 de Enero - 23:00hrs',
        location: 'Espacio Underclub, Errázuriz 1024, Valparaíso'
    }
}: TicketEmailProps) {

    // Logic to determine valid access time based on ticket type
    const accessTime = ticketType.includes('AGUAS') ? '01:00 AM' : '00:00 AM';
    const extras = ticketType.includes('AGUAS') ? 'Incluye: 4 Aguas + Guardarropía' : 'Acceso General';

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
                            <Heading className="text-white text-2xl font-bold tracking-widest text-center m-0">IMP CORE</Heading>
                            <Text className="text-gray-400 text-xs tracking-widest m-0">RECORDS</Text>
                        </Section>

                        {/* Greeting */}
                        <Section className="px-5 py-6 bg-gray-50 text-center border-x border-gray-200">
                            <Text className="text-base leading-6 text-gray-700">
                                <span className="font-bold text-black">{attendeeName}</span>, ¡Aquí tienes tu acceso!
                            </Text>
                        </Section>

                        {/* Ticket Card */}
                        <Section className="bg-gray-100 p-0 border-x border-gray-200">
                            <Container className="bg-white mx-auto max-w-[400px] border border-gray-300 rounded-lg overflow-hidden shadow-sm my-4">

                                {/* Event Flyer Image */}
                                <Img
                                    src="https://ticket-manager-mv.vercel.app/flyer.png"
                                    width="400"
                                    alt="IMPCORE RECORDS ANIVERSARIO"
                                    className="w-full object-cover border-b border-gray-200"
                                />

                                <Section className="p-6 text-center">
                                    <Text className="text-sm text-gray-500 mb-4">
                                        (Tu código QR está adjunto a este correo 📎)
                                    </Text>

                                    <Heading as="h2" className="text-xl font-bold text-gray-900 m-0 mb-1">
                                        {eventDetails.name}
                                    </Heading>

                                    <Text className="text-lg text-brand font-bold m-0 mb-2 uppercase">
                                        {ticketType}
                                    </Text>

                                    <Section className="bg-red-50 border border-red-100 rounded p-2 mb-4 inline-block">
                                        <Text className="text-sm text-red-600 font-bold m-0 uppercase">
                                            🔴 Ingreso válido hasta: {accessTime}
                                        </Text>
                                        <Text className="text-xs text-red-500 m-0 mt-1">
                                            {extras}
                                        </Text>
                                    </Section>

                                    <Section className="bg-gray-50 rounded p-4 text-xs text-gray-500 border border-gray-100 text-left space-y-2">
                                        <Row>
                                            <Column className="w-1/4 font-bold text-gray-700">FECHA</Column>
                                            <Column>VIERNES 02 ENERO</Column>
                                        </Row>
                                        <Row>
                                            <Column className="w-1/4 font-bold text-gray-700">LUGAR</Column>
                                            <Column>Espacio Underclub (Errázuriz 1024)</Column>
                                        </Row>
                                        <Row>
                                            <Column className="w-1/4 font-bold text-gray-700">LINE UP</Column>
                                            <Column>Bounce2Bounce, Nvsvc, Spc.musik & más</Column>
                                        </Row>
                                        <Row>
                                            <Column className="w-1/4 font-bold text-gray-700">TICKET ID</Column>
                                            <Column className="font-mono text-gray-800">{ticketId.slice(0, 8).toUpperCase()}</Column>
                                        </Row>
                                    </Section>
                                </Section>

                            </Container>
                        </Section>

                        {/* Footer */}
                        <Section className="bg-white border-x border-b border-gray-200 rounded-b-lg p-6 text-center">
                            <Text className="text-xs text-gray-400 m-0 mb-2">
                                Producido por IMP CORE RECORDS
                            </Text>
                            <Link href="https://instagram.com/impcore.cl" className="text-xs text-blue-500 underline">
                                @impcore
                            </Link>
                        </Section>

                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
