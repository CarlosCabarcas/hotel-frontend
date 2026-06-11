import { api } from "./axios";
import type { RoomType } from "../types/room-type";


/**
 * Get room types
 * and allowed accommodations.
 */
export const getRoomTypes = async (): Promise<RoomType[]> => {
    const response = await api.get('/room-types');

    return response.data.data;
}