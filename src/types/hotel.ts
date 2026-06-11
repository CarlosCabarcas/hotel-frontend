import type { HotelConfiguration } from './hotel-configuration';

export interface Hotel {
    id: number;
    name: string;
    city: string;
    address?: string;
    nit: string;
    total_rooms: number;
    configurations?: HotelConfiguration[];
}

export interface PaginatedHotels {
    data: Hotel[];
    links?: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}
