import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createHotel } from '../api/hotels';

export const useCreateHotel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createHotel,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['hotels'],
            });
        },
    });
};
