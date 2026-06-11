import type { Accommodation } from "./accommodation";

export interface RoomType {
    id: number;
    name: string;
    accommodations: Accommodation[];
}