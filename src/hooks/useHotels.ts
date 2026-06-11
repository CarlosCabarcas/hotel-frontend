import { useQuery } from '@tanstack/react-query';

import { getHotels } from '../api/hotels';

export const useHotels = () => {
    return useQuery({
        queryKey: ['hotels'],
        queryFn: getHotels,
    });
};