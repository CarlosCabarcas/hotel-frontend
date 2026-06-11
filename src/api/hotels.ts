import { api } from './axios';
import type { Hotel, PaginatedHotels } from '../types/hotel';

/**
 * Hotel list
 */
export const getHotels = async (page = 1): Promise<PaginatedHotels> => {
    const response = await api.get('/hotels', {
        params: { page },
    });

    return response.data;
}

/**
 * Get a Hotel
 */
export const getHotel = async (id: number) => {
    const response = await api.get(`/hotels/${id}`);

    return response.data.data;
}

/**
 * Create Hotel
 */
export const createHotel = async (payload: Partial<Hotel>) => {
    const response = await api.post('/hotels', payload);

    return response.data;
}

/**
 * Update Hotel
 */
export const updateHotel = async(id: number, payload: Partial<Hotel>) => {
    const response = await api.put(`/hotels/${id}`, payload);

    return response.data;
}

/**
 * Delete Hotel
 */
export const deleteHotel = async(id: number) => {
    const response = await api.delete(`/hotels/${id}`);

    return response.data;
}
