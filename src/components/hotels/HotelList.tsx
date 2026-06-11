'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHotels } from '../../hooks/useHotels';
import type { Hotel, PaginatedHotels } from '../../types/hotel';
import type { HotelConfiguration } from '../../types/hotel-configuration';
import './HotelForm.css';
import './HotelList.css';

const getRoomTypeName = (configuration: HotelConfiguration) => {
    return configuration.room_type?.name || `Tipo ${configuration.room_type_id}`;
};

const getAccommodationName = (configuration: HotelConfiguration) => {
    return configuration.accommodation?.name || `Acomodación ${configuration.accommodation_id}`;
};

const getAssignedRooms = (hotel: Hotel) => {
    return hotel.configurations?.reduce((total, configuration) => {
        return total + configuration.quantity;
    }, 0) ?? 0;
};

const getPaginationLabel = (hotels?: PaginatedHotels) => {
    if (!hotels?.meta || hotels.meta.total === 0) {
        return 'Sin registros';
    }

    return `Mostrando ${hotels.meta.from} a ${hotels.meta.to} de ${hotels.meta.total} hoteles`;
};

export const HotelList = () => {
    const [page, setPage] = useState(1);
    const { data: hotels, isLoading, isError, isFetching } = useHotels(page);

    const canGoBack = (hotels?.meta.current_page ?? 1) > 1;
    const canGoForward = (hotels?.meta.current_page ?? 1) < (hotels?.meta.last_page ?? 1);

    const handlePreviousPage = () => {
        if (canGoBack) {
            setPage((currentPage) => currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (canGoForward) {
            setPage((currentPage) => currentPage + 1);
        }
    };

    return (
        <main className="hotel-form-container">
            <section className="hotel-list-shell">
                <div className="form-header hotel-list-header">
                    <div>
                        <h1>Hoteles</h1>
                        <p>{getPaginationLabel(hotels)}</p>
                    </div>

                    <Link to="/hotels/create" className="btn-primary hotel-list-create-link">
                        Crear Hotel
                    </Link>
                </div>

                {isError && (
                    <div className="server-error-message">
                        <div className="error-content">
                            <strong>Error en la solicitud</strong>
                            <p>No fue posible cargar el listado de hoteles.</p>
                        </div>
                    </div>
                )}

                <div className="form-section configurations-section hotel-list-section">
                    <div className="hotel-list-section-header">
                        <h2>Listado</h2>
                        {isFetching && !isLoading && (
                            <span className="hotel-list-status">Actualizando</span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="hotel-list-empty">Cargando hoteles...</div>
                    ) : hotels?.data.length ? (
                        <div className="hotel-list-grid">
                            {hotels.data.map((hotel) => {
                                const assignedRooms = getAssignedRooms(hotel);
                                const availableRooms = Math.max(hotel.total_rooms - assignedRooms, 0);

                                return (
                                    <article className="hotel-card" key={hotel.id}>
                                        <div className="hotel-card-main">
                                            <div>
                                                <h3>{hotel.name}</h3>
                                                <p>{hotel.city}</p>
                                            </div>

                                            <span className="hotel-card-nit">NIT {hotel.nit}</span>
                                        </div>

                                        <div className="config-summary hotel-card-summary">
                                            <div className="summary-stat">
                                                <span className="summary-label">Habitaciones</span>
                                                <span className="summary-value">{hotel.total_rooms}</span>
                                            </div>
                                            <div className="summary-stat">
                                                <span className="summary-label">Asignadas</span>
                                                <span className="summary-value assigned">{assignedRooms}</span>
                                            </div>
                                            <div className="summary-stat">
                                                <span className="summary-label">Disponibles</span>
                                                <span className="summary-value available">{availableRooms}</span>
                                            </div>
                                        </div>

                                        <div className="table-wrapper hotel-configurations-wrapper">
                                            {hotel.configurations?.length ? (
                                                <table className="configurations-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Tipo</th>
                                                            <th>Acomodación</th>
                                                            <th>Cantidad</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {hotel.configurations.map((configuration) => (
                                                            <tr key={configuration.id ?? `${configuration.room_type_id}-${configuration.accommodation_id}`}>
                                                                <td>{getRoomTypeName(configuration)}</td>
                                                                <td>{getAccommodationName(configuration)}</td>
                                                                <td>{configuration.quantity}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="hotel-list-empty hotel-card-empty">
                                                    Sin configuraciones cargadas
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="hotel-list-empty">No hay hoteles registrados.</div>
                    )}
                </div>

                <div className="hotel-list-pagination">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handlePreviousPage}
                        disabled={!canGoBack || isFetching}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {hotels?.meta.current_page ?? page} de {hotels?.meta.last_page ?? 1}
                    </span>

                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleNextPage}
                        disabled={!canGoForward || isFetching}
                    >
                        Siguiente
                    </button>
                </div>
            </section>
        </main>
    );
};
