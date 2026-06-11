import axios from "axios";

/**
 * Main HTTP client.
 */

export const api = axios.create({
    baseURL: import.meta.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})