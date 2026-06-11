import { Link, useParams } from 'react-router-dom';
import { HotelForm } from '../components/hotels/HotelForm';
import { useHotel } from '../hooks/useHotel';
import { useUpdateHotel } from '../hooks/useUpdateHotel';
import type { HotelPayload } from '../components/hotels/HotelForm';

export const EditHotelPage = () => {
    const params = useParams();
    const hotelId = Number(params.id);
    const { data: hotel, isLoading, isError } = useHotel(hotelId);
    const updateHotelMutation = useUpdateHotel();

    if (!Number.isFinite(hotelId) || hotelId <= 0) {
        return (
            <main className="hotel-form-container">
                <section className="hotel-form">
                    <div className="server-error-message">
                        <div className="error-content">
                            <strong>Hotel no válido</strong>
                            <p>El identificador del hotel no es válido.</p>
                        </div>
                    </div>
                    <Link to="/" className="btn-secondary form-return-link">
                        Volver al listado
                    </Link>
                </section>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="hotel-form-container">
                <section className="hotel-form">
                    <div className="empty-configurations">
                        Cargando hotel...
                    </div>
                </section>
            </main>
        );
    }

    if (isError || !hotel) {
        return (
            <main className="hotel-form-container">
                <section className="hotel-form">
                    <div className="server-error-message">
                        <div className="error-content">
                            <strong>Error en la solicitud</strong>
                            <p>No fue posible cargar el hotel.</p>
                        </div>
                    </div>
                    <Link to="/" className="btn-secondary form-return-link">
                        Volver al listado
                    </Link>
                </section>
            </main>
        );
    }

    const handleUpdateHotel = (payload: HotelPayload) => {
        return updateHotelMutation.mutateAsync({
            id: hotel.id,
            payload,
        });
    };

    return (
        <HotelForm
            initialHotel={hotel}
            isSaving={updateHotelMutation.isPending}
            onSubmitHotel={handleUpdateHotel}
            submitLabel="Actualizar"
            successMessage="Hotel actualizado correctamente"
            successTitle="Hotel actualizado"
            title="Editar Hotel"
        />
    );
};
