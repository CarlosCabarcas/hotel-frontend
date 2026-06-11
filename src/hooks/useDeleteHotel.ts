import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteHotel } from '../api/hotels';

export const useDeleteHotel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteHotel,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['hotels'],
            });
        },
    });
};
