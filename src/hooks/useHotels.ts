import { useQuery } from '@tanstack/react-query';

import { getHotels } from '../api/hotels';

export const useHotels = (page = 1) => {
    return useQuery({
        queryKey: ['hotels', page],
        queryFn: () => getHotels(page),
        placeholderData: (previousData) => previousData,
    });
};
