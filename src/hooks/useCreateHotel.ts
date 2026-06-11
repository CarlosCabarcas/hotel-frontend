import { useMutation } from '@tanstack/react-query';

import { createHotel } from '../api/hotels';

export const useCreateHotel = () => {
    return useMutation({
        mutationFn: createHotel,
    });
};