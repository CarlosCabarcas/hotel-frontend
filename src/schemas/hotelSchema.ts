import { z } from 'zod'

export const hotelSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es obligatorio'),

    city: z
        .string()
        .min(1, 'La ciudad es obligatoria'),

    address: z
        .string()
        .min(1, 'La dirección es obligatoria'),

    nit: z
        .string()
        .min(1, 'El NIT es obligatorio'),

    total_rooms: z
        .number()
        .min(1, 'Debe existir al menos una habitación'),
    configurations: z.array(
        z.object({
            room_type_id: z.number(),
            accommodation_id: z.number(),
            quantity: z.number().min(1),
        })
    ),
});

export type HotelFormData =
    z.infer<typeof hotelSchema>;