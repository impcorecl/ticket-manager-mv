'use client';

import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

interface ResetButtonProps {
    onReset: () => void;
}

export default function ResetButton({ onReset }: ResetButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleReset = async () => {
        const confirmed = window.confirm(
            '⚠️ ¿ESTÁS SEGURO?\n\nEsto borrará TODAS las ventas registradas de la base de datos PERMANENTEMENTE.\n\nEsta acción no se puede deshacer. ¿Deseas continuar?'
        );

        if (!confirmed) return;

        const doubleConfirmed = window.confirm(
            'CONFIRMACIÓN FINAL\n\n¿Realmente quieres eliminar todo el historial de ventas para reiniciar el sistema?'
        );

        if (!doubleConfirmed) return;

        setIsDeleting(true);

        try {
            // Delete all rows where id is not null (effectively all rows)
            const { error } = await supabase
                .from('sales')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // UUID placeholder to allow "delete all" logic if filter is required

            if (error) throw error;

            onReset(); // Clear local state
            alert('♻️ Sistema reiniciado correctamente. Todas las ventas han sido eliminadas.');
        } catch (err: any) {
            alert('Error al reiniciar: ' + err.message);
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleReset}
            disabled={isDeleting}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all text-sm ml-auto"
            title="Borrar todos los datos"
        >
            {isDeleting ? (
                <span className="animate-spin">⏳</span>
            ) : (
                <Trash2 size={16} />
            )}
            <span className="font-medium">Reiniciar Sistema</span>
        </button>
    );
}
