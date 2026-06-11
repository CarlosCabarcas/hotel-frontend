import type { HotelConfiguration } from './hotel-configuration';

export interface Hotel {
    id: number;
    name: string;
    city: string;
    address: string;
    nit: string;
    total_rooms: number;
    configurations: HotelConfiguration[];
}