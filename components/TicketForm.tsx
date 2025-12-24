'use client';

import { useState, useEffect } from 'react';
import { TICKET_OPTIONS, TicketOption, Attendee, Sale } from '@/types';
import { PlusCircle, Trash2, User, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TicketFormProps {
    onAddSale: (sale: Sale) => void;
}

export default function TicketForm({ onAddSale }: TicketFormProps) {
    const [selectedTicket, setSelectedTicket] = useState<TicketOption>(TICKET_OPTIONS[0]);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Reset attendees when ticket type changes
    useEffect(() => {
        const newAttendees = Array.from({ length: selectedTicket.capacity }).map(() => ({
            id: crypto.randomUUID(),
            fullName: '',
            rut: '',
            phone: '',
            email: '',
        }));
        setAttendees(newAttendees);
        setErrors({});
    }, [selectedTicket]);

    const handleAttendeeChange = (index: number, field: keyof Attendee, value: string) => {
        const newAttendees = [...attendees];
        newAttendees[index] = { ...newAttendees[index], [field]: value };
        setAttendees(newAttendees);

        // Clear error for this field if it exists
        if (errors[`${index}-${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${field}`];
            setErrors(newErrors);
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        let isValid = true;

        attendees.forEach((attendee, index) => {
            if (!attendee.fullName.trim()) {
                newErrors[`${index}-fullName`] = 'El nombre es obligatorio';
                isValid = false;
            }
            if (!attendee.rut.trim()) {
                newErrors[`${index}-rut`] = 'El RUT es obligatorio';
                isValid = false;
            }
            // Basic RUT format check could go here
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const newSale: Sale = {
            id: crypto.randomUUID(),
            ticketType: selectedTicket,
            attendees: attendees,
            timestamp: Date.now(),
        };

        onAddSale(newSale);

        // Reset form logic could act differently (maybe keep ticket type but clear fields)
        // For now, let's re-initialize fields
        const resetAttendees = Array.from({ length: selectedTicket.capacity }).map(() => ({
            id: crypto.randomUUID(),
            fullName: '',
            rut: '',
            phone: '',
            email: '',
        }));
        setAttendees(resetAttendees);
        alert('Venta registrada con éxito');
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-400" />
                Nueva Venta
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Ticket Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Tipo de Ticket</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TICKET_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedTicket(option)}
                                className={twMerge(
                                    "p-4 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1",
                                    selectedTicket.id === option.id
                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <span className="font-semibold block">{option.label}</span>
                                <span className="text-xs opacity-70">Capacidad: {option.capacity} persona{option.capacity > 1 ? 's' : ''}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Forms */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Datos de los Asistentes</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Total a Pagar: ${(selectedTicket.price).toLocaleString('es-CL')}
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {attendees.map((attendee, index) => (
                            <div key={attendee.id} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-4 animation-enter-up">
                                <div className="flex items-center gap-2 text-indigo-300 mb-2">
                                    <User size={16} />
                                    <span className="text-sm font-medium">Asistente #{index + 1}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            placeholder="Nombre Completo *"
                                            value={attendee.fullName}
                                            onChange={(e) => handleAttendeeChange(index, 'fullName', e.target.value)}
                                            className={clsx(
                                                "w-full px-4 py-2 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all",
                                                errors[`${index}-fullName`]
                                                    ? "border-red-500 focus:ring-red-500/50"
                                                    : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                                            )}
                                        />
                                        {errors[`${index}-fullName`] && <p className="text-xs text-red-400 ml-1">{errors[`${index}-fullName`]}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            placeholder="RUT *"
                                            value={attendee.rut}
                                            onChange={(e) => handleAttendeeChange(index, 'rut', e.target.value)}
                                            className={clsx(
                                                "w-full px-4 py-2 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all",
                                                errors[`${index}-rut`]
                                                    ? "border-red-500 focus:ring-red-500/50"
                                                    : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                                            )}
                                        />
                                        {errors[`${index}-rut`] && <p className="text-xs text-red-400 ml-1">{errors[`${index}-rut`]}</p>}
                                    </div>

                                    <input
                                        type="tel"
                                        placeholder="Teléfono (Opcional)"
                                        value={attendee.phone}
                                        onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />

                                    <input
                                        type="email"
                                        placeholder="Correo (Opcional)"
                                        value={attendee.email}
                                        onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} />
                    Registrar Venta
                </button>
            </form>
        </div>
    );
}
