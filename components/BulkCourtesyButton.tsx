'use client';
import { useState, useEffect } from 'react';
import { COURTESY_LIST } from '@/lib/courtesyList';
import { TICKET_OPTIONS } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Loader2, CheckCircle, XCircle, Users } from 'lucide-react';

const BATCH_SIZE = 100;

export default function BulkCourtesyButton() {
    const [showModal, setShowModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [success, setSuccess] = useState(0);
    const [failed, setFailed] = useState(0);
    const [complete, setComplete] = useState(false);
    const [sentBatches, setSentBatches] = useState<number[]>([]);

    const cortesiaTicket = TICKET_OPTIONS.find(t => t.id === 'CORTESIA');

    // Split into batches
    const batches = [];
    for (let i = 0; i < COURTESY_LIST.length; i += BATCH_SIZE) {
        batches.push(COURTESY_LIST.slice(i, i + BATCH_SIZE));
    }

    // Load sent batches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sentBatches');
        if (saved) {
            setSentBatches(JSON.parse(saved));
        }
    }, []);

    const sendBatch = async (batchIndex: number) => {
        if (!cortesiaTicket) {
            alert('Error: Ticket de Cortesía no configurado');
            return;
        }

        const batch = batches[batchIndex];
        const confirmed = confirm(
            `¿Enviar Tanda ${batchIndex + 1}?\n\n` +
            `${batch.length} correos (Límite Resend: 100/día)\n\n` +
            `Esto puede tomar ~${Math.ceil(batch.length / 2)} minutos.`
        );

        if (!confirmed) return;

        setSending(true);
        setTotal(batch.length);
        setProgress(0);
        setSuccess(0);
        setFailed(0);
        setComplete(false);

        for (let i = 0; i < batch.length; i++) {
            const recipient = batch[i];

            try {
                const attendeeId = crypto.randomUUID();

                const saleData = {
                    ticket_type: cortesiaTicket,
                    attendees: [{
                        id: attendeeId,
                        fullName: recipient.name,
                        rut: '11111111-1',
                        email: recipient.email,
                    }],
                };

                const { data, error } = await supabase
                    .from('sales')
                    .insert([saleData])
                    .select();

                if (error) throw error;

                const emailRes = await fetch('/api/send-ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sale: {
                            id: data[0].id,
                            ticketType: cortesiaTicket,
                            attendees: saleData.attendees,
                        },
                    }),
                });

                if (!emailRes.ok) throw new Error('Email failed');

                setSuccess(prev => prev + 1);
            } catch (err) {
                console.error(`Failed for ${recipient.email}:`, err);
                setFailed(prev => prev + 1);
            }

            setProgress(i + 1);

            if (i < batch.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Mark batch as sent
        const newSentBatches = [...sentBatches, batchIndex];
        setSentBatches(newSentBatches);
        localStorage.setItem('sentBatches', JSON.stringify(newSentBatches));

        setComplete(true);
        setSending(false);
    };

    // Modal with batch selector
    if (showModal && !sending && !complete) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="text-purple-500" />
                        Selecciona Tanda a Enviar
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                        Total: {COURTESY_LIST.length} correos - Límite Resend: <span className="text-yellow-500 font-bold">100 emails/día</span>
                    </p>

                    <div className="space-y-3">
                        {batches.map((batch, index) => {
                            const isSent = sentBatches.includes(index);
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedBatch(index);
                                        setShowModal(false);
                                        sendBatch(index);
                                    }}
                                    disabled={isSent}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSent
                                            ? 'bg-green-900/20 border-green-700 cursor-not-allowed'
                                            : 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                {isSent && <CheckCircle className="w-5 h-5 text-green-500" />}
                                                Tanda {index + 1}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {batch.length} correos ({index * BATCH_SIZE} - {index * BATCH_SIZE + batch.length - 1})
                                            </p>
                                        </div>
                                        {isSent ? (
                                            <span className="text-xs bg-green-600 px-3 py-1 rounded-full text-white font-semibold">
                                                Enviada ✓
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-purple-600 px-3 py-1 rounded-full text-white font-semibold">
                                                Enviar →
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setShowModal(false)}
                        className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    if (complete) {
        return (
            <div className="glass p-6 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">¡Tanda {selectedBatch! + 1} Completada!</h3>
                <p className="text-emerald-400 text-sm">✅ {success} enviados</p>
                {failed > 0 && <p className="text-red-400 text-sm">❌ {failed} fallidos</p>}
                <button
                    onClick={() => {
                        setComplete(false);
                        setShowModal(true);
                    }}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm text-white"
                >
                    Enviar Otra Tanda
                </button>
            </div>
        );
    }

    if (sending) {
        return (
            <div className="glass p-6 rounded-xl text-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Enviando Tanda {selectedBatch! + 1}...</h3>
                <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(progress / total) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-400">
                        {progress} / {total}
                    </p>
                </div>
                <p className="text-xs text-gray-500">
                    ✅ {success} enviados | ❌ {failed} fallidos
                </p>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
            <Mail size={20} />
            Mailing Masivo ({COURTESY_LIST.length} cortesías / {batches.length} tandas)
        </button>
    );
}
