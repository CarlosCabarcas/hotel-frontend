import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CreateHotelPage } from '../pages/CreateHotelPage';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/hotels/create"
                    element={<CreateHotelPage />}
                />
            </Routes>
        </BrowserRouter>
    );
};