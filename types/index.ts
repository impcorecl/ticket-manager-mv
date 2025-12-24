export type TicketType = 'PREVENTA_1' | 'PROMO_2X1' | 'PROMO_4X1' | 'PROMO_4X1_AGUAS';

export interface TicketOption {
  id: TicketType;
  label: string;
  price: number;
  capacity: number;
}

export interface Attendee {
  id: string; // uuid or random string for keying
  fullName: string;
  rut: string;
  phone?: string;
  email?: string;
}

export interface Sale {
  id: string;
  ticketType: TicketOption;
  attendees: Attendee[];
  timestamp: number;
}

export const TICKET_OPTIONS: TicketOption[] = [
  { id: 'PREVENTA_1', label: 'Preventa 1 ($5.000)', price: 5000, capacity: 1 },
  { id: 'PROMO_2X1', label: 'Promo 2x1 ($8.000)', price: 8000, capacity: 2 },
  { id: 'PROMO_4X1', label: 'Promo 4x1 ($15.000)', price: 15000, capacity: 4 },
  { id: 'PROMO_4X1_AGUAS', label: 'Promo 4x1 + Aguas ($25.000)', price: 25000, capacity: 4 },
];
