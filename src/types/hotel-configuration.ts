interface ConfigurationRelation {
    id: number;
    name: string;
}

export interface HotelConfiguration {
    id?: number;
    room_type_id?: number;
    accommodation_id?: number;
    room_type?: ConfigurationRelation;
    accommodation?: ConfigurationRelation;
    quantity: number;
}
