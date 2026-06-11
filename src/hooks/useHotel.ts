import { useQuery } from '@tanstack/react-query';

import { getHotel } from '../api/hotels';

export const useHotel = (id: number) => {
    return useQuery({
        queryKey: ['hotel', id],
        queryFn: () => getHotel(id),
        enabled: Number.isFinite(id) && id > 0,
    });
};
