import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateHotel } from '../api/hotels';
import type { Hotel } from '../types/hotel';

interface UpdateHotelParams {
    id: number;
    payload: Partial<Hotel>;
}

export const useUpdateHotel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: UpdateHotelParams) => updateHotel(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['hotels'],
            });
            queryClient.invalidateQueries({
                queryKey: ['hotel', variables.id],
            });
        },
    });
};
