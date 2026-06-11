import { useQuery } from '@tanstack/react-query';

import { getRoomTypes } from '../api/roomTypes';

export const useRoomTypes = () => {
    return useQuery({
        queryKey: ['room-types'],
        queryFn: getRoomTypes,
    });
};