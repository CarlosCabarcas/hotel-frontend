import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CreateHotelPage } from '../pages/CreateHotelPage';
import { HotelListPage } from '../pages/HotelListPage';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<HotelListPage />}
                />
                <Route
                    path="/hotels/create"
                    element={<CreateHotelPage />}
                />
            </Routes>
        </BrowserRouter>
    );
};