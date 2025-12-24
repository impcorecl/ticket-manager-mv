'use client';
import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { createClient } from '@/lib/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
    const [result, setResult] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'used'>('idle');
    const [message, setMessage] = useState('');
    const [attendeeData, setAttendeeData] = useState<any>(null);
    const [scannedId, setScannedId] = useState<string>('');
    const supabase = createClient();
    const router = useRouter();

    const handleScan = async (text: string) => {
        if (!text || status === 'loading' || status === 'success') return;

        // Prevent double scans
        if (text === scannedId) return;

        setScannedId(text);
        setResult(text);
        setStatus('loading');

        try {
            // 1. Fetch ALL sales (needed to find which row contains the attendee)
            // Ideally we would filter by JSONB containment but for MVP let's fetch and find
            // Optimization: supabase.from('sales').select('*').contains('attendees', JSON.stringify([{ id: text }]))
            // But 'contains' matches object structure. The array is [{id: "UUID", ...}]. 
            // Checking just for ID might require exact object or partial match support.

            // Let's try the direct JSONB query first
            const { data: sales, error } = await supabase
                .from('sales')
                .select('*')
            // .contains('attendees', JSON.stringify([{ id: text }])); // This is strict
            // Fallback: Fetch everything and filter in JS if the DB is small (<1000 sales)

            if (error) throw error;

            // Manual Find in JS (Safest for MVP structure)
            let foundSale: any = null;
            let foundAttendee: any = null;
            let foundIndex = -1;

            if (sales) {
                for (const sale of sales) {
                    const idx = sale.attendees.findIndex((a: any) => a.id === text);
                    if (idx !== -1) {
                        foundSale = sale;
                        foundAttendee = sale.attendees[idx];
                        foundIndex = idx;
                        break;
                    }
                }
            }

            if (!foundSale || !foundAttendee) {
                setStatus('error');
                setMessage('Ticket Inválido o No Encontrado');
                playErrorSound();
                return;
            }

            // 2. Check Status
            if (foundAttendee.checkedIn) {
                setStatus('used');
                setAttendeeData(foundAttendee);
                setMessage(`¡Ticket YA USADO! Ingresó a las: ${foundAttendee.checkedInAt ? new Date(foundAttendee.checkedInAt).toLocaleTimeString() : '?'}`);
                playErrorSound();
                return;
            }

            // 3. Mark as Checked In
            const updatedAttendees = [...foundSale.attendees];
            updatedAttendees[foundIndex] = {
                ...updatedAttendees[foundIndex],
                checkedIn: true,
                checkedInAt: new Date().toISOString()
            };

            const { error: updateError } = await supabase
                .from('sales')
                .update({ attendees: updatedAttendees })
                .eq('id', foundSale.id);

            if (updateError) throw updateError;

            // Success!
            setAttendeeData(foundAttendee);
            setStatus('success');
            setMessage('¡Acceso Permitido!');
            playSuccessSound();

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage('Error de conexión o validación');
        }
    };

    const resetScan = () => {
        setResult(null);
        setStatus('idle');
        setMessage('');
        setAttendeeData(null);
        setScannedId('');
    };

    const playSuccessSound = () => {
        const audio = new Audio('/sounds/success.mp3'); // We need to add these or use system beep logic if possible
        // Fallback simple beep if no file
    };

    const playErrorSound = () => {
        const audio = new Audio('/sounds/error.mp3');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
            <header className="w-full max-w-md flex items-center justify-between mb-6">
                <Link href="/" className="text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold tracking-widest text-[#feac00]">SCANNER</h1>
                <div className="w-6"></div>
            </header>

            <div className="w-full max-w-md relative bg-gray-900 rounded-xl overflow-hidden aspect-square ring-2 ring-gray-800 shadow-2xl mb-6">
                {status === 'idle' || status === 'loading' ? (
                    <Scanner
                        onResult={(result) => handleScan(result)}
                        onError={(error) => console.log(error?.message)}
                        options={{
                            delayBetweenScanAttempts: 2000,
                        }}
                    />
                ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center 
                        ${status === 'success' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>

                        {status === 'success' && <CheckCircle className="w-24 h-24 text-green-500 mb-4 animate-bounce" />}
                        {(status === 'error' || status === 'used') && <XCircle className="w-24 h-24 text-red-500 mb-4 animate-pulse" />}

                        <h2 className={`text-3xl font-bold mb-2 ${status === 'success' ? 'text-green-400' : 'text-red-500'}`}>
                            {status === 'success' ? 'APROBADO' : status === 'used' ? 'YA USADO' : 'ERROR'}
                        </h2>

                        <p className="text-lg text-white font-medium mb-1">{attendeeData?.fullName || 'Desconocido'}</p>
                        {attendeeData?.role && <span className="text-xs bg-gray-700 px-2 py-1 rounded mb-2">{attendeeData.role}</span>}
                        <p className="text-sm text-gray-400">{message}</p>

                        <button
                            onClick={resetScan}
                            className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold flex items-center shadow-lg active:scale-95 transition-transform"
                        >
                            <RefreshCcw size={20} className="mr-2" />
                            Escanear Siguiente
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
                        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <div className="w-full max-w-md bg-gray-900/50 p-4 rounded-lg text-xs text-gray-400 text-center">
                Apunta la cámara al código QR del ticket.
                Asegúrate de tener buena iluminación.
            </div>
        </div>
    );
}
