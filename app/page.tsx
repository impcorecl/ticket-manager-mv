'use client';

import { useState, useEffect } from 'react';
import { Sale } from '@/types';
import TicketForm from '@/components/TicketForm';
import SalesList from '@/components/SalesList';
import ExportButtons from '@/components/ExportButtons';
import { Sparkles, TicketCheck, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sales from Supabase
  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: true }); // Get oldest first, we reverse in display or here

    if (error) {
      console.error('Error fetching sales:', error);
    } else if (data) {
      // Map DB snake_case to TS camelCase if needed, or matched types
      // DB: ticket_type, attendees
      // TS: ticketType, attendees
      const mappedSales: Sale[] = data.map((row: any) => ({
        id: row.id,
        ticketType: row.ticket_type,
        attendees: row.attendees,
        timestamp: new Date(row.created_at).getTime(),
      }));
      setSales(mappedSales);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleAddSale = async (newSale: Sale) => {
    // 1. Optimistic update (optional, but let's wait for confirmation for safety)
    // 2. Insert into DB

    // Remove id from newSale to let DB generate it, or use the one we have?
    // User script: id uuid default gen_random_uuid()
    // We generated a UUID in TicketForm. We can use it.

    const { data, error } = await supabase
      .from('sales')
      .insert([
        {
          // id: newSale.id, // Let's use the DB generated one or client one. using client one is fine if valid UUID.
          // actually TicketForm uses crypto.randomUUID().
          ticket_type: newSale.ticketType,
          attendees: newSale.attendees,
          // created_at will be auto
        }
      ])
      .select();

    if (error) {
      alert('Error al guardar en la nube: ' + error.message);
      console.error(error);
    } else if (data) {
      // Use the returned data which has the real ID and created_at
      const savedSale: Sale = {
        id: data[0].id,
        ticketType: data[0].ticket_type,
        attendees: data[0].attendees,
        timestamp: new Date(data[0].created_at).getTime(),
      };
      setSales((prev) => [...prev, savedSale]);
    }
  };

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.ticketType.price, 0);
  const totalAttendees = sales.reduce((acc, sale) => acc + sale.ticketType.capacity, 0);

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans selection:bg-indigo-500/30">

      {/* Background Gradients */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
              <TicketCheck className="text-indigo-500 w-10 h-10" />
              Ticket Manager
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300" />
              Sistema de Gestión de Accesos
              {loading && <RefreshCw className="animate-spin w-3 h-3 ml-2" />}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Recaudado</p>
              <p className="text-3xl font-bold text-emerald-400">${totalRevenue.toLocaleString('es-CL')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Asistentes: <span className="text-white font-bold">{totalAttendees}</span></p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form */}
          <section className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 z-10">
            <TicketForm onAddSale={handleAddSale} />
          </section>

          {/* Right Column: List & Actions */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* Action Bar */}
            <div className="glass p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Reportes</h3>
                <p className="text-sm text-gray-400">Exporta la información para control en puerta y contabilidad.</p>
              </div>
              <ExportButtons sales={sales} />
            </div>

            {/* Sales List */}
            {loading ? (
              <div className="text-center py-12 text-gray-400">Cargando ventas desde la nube...</div>
            ) : (
              <SalesList sales={sales} />
            )}

          </section>

        </main>
      </div>
    </div>
  );
}
