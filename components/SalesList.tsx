'use client';

import { Sale } from '@/types';
import { Users, Clock, Ticket } from 'lucide-react';

interface SalesListProps {
    sales: Sale[];
}

export default function SalesList({ sales }: SalesListProps) {
    if (sales.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay ventas registradas aún.</p>
            </div>
        );
    }

    // Reverse sales to show newest first
    const displaySales = [...sales].reverse();

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-violet-400" />
                Registro de Ventas
                <span className="text-sm font-normal text-gray-400 ml-auto bg-white/5 px-2 py-1 rounded-full border border-white/10">
                    Total: {sales.length}
                </span>
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {displaySales.map((sale) => (
                    <div key={sale.id} className="group glass-card p-4 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                                    {sale.ticketType.label}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Clock size={12} />
                                    {new Date(sale.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-white">${(sale.ticketType.price).toLocaleString('es-CL')}</p>
                                <p className="text-xs text-gray-500">{sale.attendees.length} asistente{sale.attendees.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {sale.attendees.map((attendee, idx) => (
                                <div key={idx} className="text-sm text-gray-300 flex justify-between items-center py-1 border-t border-white/5 first:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50"></div>
                                        <span className="truncate max-w-[150px]">{attendee.fullName}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono tracking-wide">{attendee.rut}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
