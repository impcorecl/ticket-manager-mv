'use client';

import { Sale } from '@/types';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExportButtonsProps {
    sales: Sale[];
}

export default function ExportButtons({ sales }: ExportButtonsProps) {

    const downloadDoorList = () => {
        if (sales.length === 0) return alert('No hay datos para exportar');

        // Flatten all attendees from all sales
        const rows = sales.flatMap(sale =>
            sale.attendees.map(attendee => ({
                'Nombre Completo': attendee.fullName,
                'RUT': attendee.rut,
                'Teléfono': attendee.phone || '-',
                'Correo': attendee.email || '-',
                'Tipo de Ticket': sale.ticketType.label,
                'ID Venta': sale.id.substring(0, 8)
            }))
        );

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Puerta");

        // Auto-width columns
        const max_width = rows.reduce((w, r) => Math.max(w, r['Nombre Completo'].length), 10);
        worksheet['!cols'] = [{ wch: max_width }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 10 }];

        XLSX.writeFile(workbook, `Lista_Puerta_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const downloadFinancialReport = () => {
        if (sales.length === 0) return alert('No hay datos para exportar');

        // Group by Sale (Transaction)
        let totalRevenue = 0;
        const rows = sales.map(sale => {
            totalRevenue += sale.ticketType.price;
            return {
                'ID Venta': sale.id,
                'Fecha': new Date(sale.timestamp).toLocaleString(),
                'Tipo de Ticket': sale.ticketType.label,
                'Cantidad (Packs)': 1,
                'Asistentes': sale.ticketType.capacity,
                'Precio Unitario': sale.ticketType.price,
                'Total': sale.ticketType.price
            };
        });

        // Add Total Row
        rows.push({
            'ID Venta': 'TOTAL',
            'Fecha': '',
            'Tipo de Ticket': '',
            'Cantidad (Packs)': sales.length,
            'Asistentes': sales.reduce((acc, s) => acc + s.ticketType.capacity, 0),
            'Precio Unitario': 0,
            'Total': totalRevenue
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Finanzas");

        XLSX.writeFile(workbook, `Reporte_Financiero_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
                onClick={downloadDoorList}
                disabled={sales.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
                <FileSpreadsheet size={20} />
                Lista de Puerta
            </button>

            <button
                onClick={downloadFinancialReport}
                disabled={sales.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
                <Download size={20} />
                Reporte Financiero
            </button>
        </div>
    );
}
