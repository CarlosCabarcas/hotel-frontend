'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hotelSchema, type HotelFormData } from '../../schemas/hotelSchema';
import { useRoomTypes } from '../../hooks/useRoomTypes';
import { useCreateHotel } from '../../hooks/useCreateHotel';
import type { HotelConfiguration } from '../../types/hotel-configuration';
import './HotelForm.css';

export const HotelForm = () => {
    const { data: roomTypes = [] } = useRoomTypes();
    const createHotelMutation = useCreateHotel();
    const [configurations, setConfigurations] = useState<HotelConfiguration[]>([]);
    const [isAddingConfig, setIsAddingConfig] = useState(false);
    const [configError, setConfigError] = useState<string>('');
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    const [newConfig, setNewConfig] = useState<Partial<HotelConfiguration>>({
        room_type_id: 0,
        accommodation_id: 0,
        quantity: 1,
    });

    const getDefaultNewConfig = (): Partial<HotelConfiguration> => ({
        room_type_id: 0,
        accommodation_id: 0,
        quantity: 1,
    });

    const clearServerError = (field: string) => {
        if (serverErrors[field]) {
            setServerErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<HotelFormData>({
        resolver: zodResolver(hotelSchema),
        defaultValues: {
            configurations: [],
        },
    });

    const total_rooms = watch('total_rooms');

    const handleAddConfiguration = () => {
        // Verify that total_rooms is set
        if (!total_rooms || total_rooms <= 0) {
            setConfigError('Debes establecer el total de habitaciones primero');
            return;
        }

        // Verify that all fields are filled in
        if (
            !newConfig.room_type_id ||
            !newConfig.accommodation_id ||
            !newConfig.quantity
        ) {
            setConfigError('Todos los campos son obligatorios');
            return;
        }

        // Calculate the current total number of configurations
        const currentTotal = configurations.reduce(
            (sum, config) => sum + config.quantity,
            0
        );

        // Verify that the new amount does not exceed the total
        const newTotal = currentTotal + newConfig.quantity;
        if (newTotal > total_rooms) {
            setConfigError(
                `La suma de habitaciones (${newTotal}) no puede exceder el total configurado (${total_rooms})`
            );
            return;
        }

        // If all validations pass, add the configuration
        setConfigurations([...configurations, newConfig as HotelConfiguration]);
        setNewConfig(getDefaultNewConfig());
        setConfigError('');
        setIsAddingConfig(false);
    };

    const handleRemoveConfiguration = (index: number) => {
        setConfigurations(configurations.filter((_, i) => i !== index));
        setConfigError('');
    };

    const onSubmit = async (data: HotelFormData) => {
        setServerErrors({});
        
        const payload = {
            ...data,
            configurations,
        };

        try {
            await createHotelMutation.mutateAsync(payload);
            alert('Hotel creado correctamente');
        } catch (error: any) {
            const backendErrors: Record<string, string> = {};
            
            if (error.response?.data?.errors) {
                if (typeof error.response.data.errors === 'object' && !Array.isArray(error.response.data.errors)) {
                    Object.assign(backendErrors, error.response.data.errors);
                }
                else if (Array.isArray(error.response.data.errors)) {
                    error.response.data.errors.forEach((err: any) => {
                        const field = err.field || 'general';
                        backendErrors[field] = err.message || 'Error en validación';
                    });
                }
            } else if (error.response?.data?.message) {
                backendErrors['general'] = error.response.data.message;
            } else if (error.response?.data?.detail) {
                backendErrors['general'] = error.response.data.detail;
            } else {
                backendErrors['general'] = 'Ocurrió un error al crear el hotel';
            }

            setServerErrors(backendErrors);
        }
    };

    const getRoomTypeName = (id: number) => {
        return roomTypes.find((rt) => rt.id === id)?.name || '';
    };

    const getAccommodationName = (roomTypeId: number, accId: number) => {
        const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
        return roomType?.accommodations.find((a) => a.id === accId)?.name || '';
    };

    const getAccommodationsByRoomType = (roomTypeId: number) => {
        const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
        return roomType?.accommodations || [];
    };

    return (
        <div className="hotel-form-container">
            <form onSubmit={handleSubmit(onSubmit)} className="hotel-form">
                {/* Header */}
                <div className="form-header">
                    <h1>Crear Hotel</h1>
                </div>

                {/* Errores generales del servidor */}
                {serverErrors['general'] && (
                    <div className="server-error-message">
                        <span className="error-icon">❌</span>
                        <div className="error-content">
                            <strong>Error en la solicitud</strong>
                            <p>{serverErrors['general']}</p>
                        </div>
                    </div>
                )}

                {/* Basic data section */}
                <div className="form-section basic-info">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Nombre</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Nombre del hotel"
                                {...register('name', {
                                    onChange: () => clearServerError('name')
                                })}
                                className={errors.name || serverErrors['name'] ? 'input-error' : ''}
                            />
                            {errors.name && (
                                <span className="error-message">{errors.name.message}</span>
                            )}
                            {serverErrors['name'] && !errors.name && (
                                <span className="error-message">{serverErrors['name']}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">Ciudad</label>
                            <input
                                id="city"
                                type="text"
                                placeholder="Ciudad"
                                {...register('city', {
                                    onChange: () => clearServerError('city')
                                })}
                                className={errors.city || serverErrors['city'] ? 'input-error' : ''}
                            />
                            {errors.city && (
                                <span className="error-message">{errors.city.message}</span>
                            )}
                            {serverErrors['city'] && !errors.city && (
                                <span className="error-message">{serverErrors['city']}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="address">Dirección</label>
                            <input
                                id="address"
                                type="text"
                                placeholder="Dirección"
                                {...register('address', {
                                    onChange: () => clearServerError('address')
                                })}
                                className={errors.address || serverErrors['address'] ? 'input-error' : ''}
                            />
                            {errors.address && (
                                <span className="error-message">{errors.address.message}</span>
                            )}
                            {serverErrors['address'] && !errors.address && (
                                <span className="error-message">{serverErrors['address']}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nit">NIT</label>
                            <input
                                id="nit"
                                type="text"
                                placeholder="NIT"
                                {...register('nit', {
                                    onChange: () => clearServerError('nit')
                                })}
                                className={errors.nit || serverErrors['nit'] ? 'input-error' : ''}
                            />
                            {errors.nit && (
                                <span className="error-message">{errors.nit.message}</span>
                            )}
                            {serverErrors['nit'] && !errors.nit && (
                                <span className="error-message">{serverErrors['nit']}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="total_rooms">Total Habitaciones</label>
                            <input
                                id="total_rooms"
                                type="number"
                                placeholder="Total de habitaciones"
                                {...register('total_rooms', { 
                                    valueAsNumber: true,
                                    onChange: () => clearServerError('total_rooms')
                                })}
                                className={errors.total_rooms || serverErrors['total_rooms'] ? 'input-error' : ''}
                            />
                            {errors.total_rooms && (
                                <span className="error-message">{errors.total_rooms.message}</span>
                            )}
                            {serverErrors['total_rooms'] && !errors.total_rooms && (
                                <span className="error-message">{serverErrors['total_rooms']}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Configurations section */}
                <div className="form-section configurations-section">
                    <h2>Configuraciones</h2>

                    {serverErrors['configurations'] && (
                        <div className="config-error-message">
                            {serverErrors['configurations']}
                        </div>
                    )}

                    {configError && (
                        <div className="config-error-message">
                            {configError}
                        </div>
                    )}

                    {total_rooms > 0 && configurations.length > 0 && (
                        <div className="config-summary">
                            <div className="summary-stat">
                                <span className="summary-label">Total Habitaciones:</span>
                                <span className="summary-value">{total_rooms}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-label">Asignadas:</span>
                                <span className="summary-value assigned">
                                    {configurations.reduce((sum, config) => sum + config.quantity, 0)}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-label">Disponibles:</span>
                                <span className="summary-value available">
                                    {Math.max(0, (total_rooms || 0) - configurations.reduce((sum, config) => sum + config.quantity, 0))}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Configurations table */}
                    {configurations.length > 0 && (
                        <div className="table-wrapper">
                            <table className="configurations-table">
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Acomodación</th>
                                        <th>Cantidad</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {configurations.map((config, index) => (
                                        <tr key={index}>
                                            <td>{getRoomTypeName(config.room_type_id)}</td>
                                            <td>
                                                {getAccommodationName(
                                                    config.room_type_id,
                                                    config.accommodation_id
                                                )}
                                            </td>
                                            <td>{config.quantity}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-delete"
                                                    onClick={() =>
                                                        handleRemoveConfiguration(index)
                                                    }
                                                    title="Eliminar configuración"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Add config form */}
                    {isAddingConfig ? (
                        <div className="add-configuration-form">
                            <div className="config-form-row">
                                <div className="config-form-group">
                                    <label htmlFor="room_type_id">Tipo de Habitación</label>
                                    <select
                                        id="room_type_id"
                                        value={newConfig.room_type_id || ''}
                                        onChange={(e) =>
                                            setNewConfig({
                                                ...newConfig,
                                                room_type_id: parseInt(e.target.value),
                                                accommodation_id: 0,
                                            })
                                        }
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        {roomTypes.map((rt) => (
                                            <option key={rt.id} value={rt.id}>
                                                {rt.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="config-form-group">
                                    <label htmlFor="accommodation_id">Acomodación</label>
                                    <select
                                        id="accommodation_id"
                                        value={newConfig.accommodation_id || ''}
                                        onChange={(e) =>
                                            setNewConfig({
                                                ...newConfig,
                                                accommodation_id: parseInt(e.target.value),
                                            })
                                        }
                                        disabled={!newConfig.room_type_id}
                                    >
                                        <option value="">Seleccionar acomodación</option>
                                        {getAccommodationsByRoomType(
                                            newConfig.room_type_id || 0
                                        ).map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="config-form-group">
                                    <label htmlFor="quantity">Cantidad</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={Math.max(1, newConfig.quantity ?? 1)}
                                        onChange={(e) => {
                                            const rawValue = e.target.value;
                                            const parsedValue = parseInt(rawValue, 10);
                                            const finalValue = isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue;
                                            
                                            setNewConfig({
                                                ...newConfig,
                                                quantity: finalValue,
                                            });
                                        }}
                                    />
                                </div>

                                <div className="config-form-actions">
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={handleAddConfiguration}
                                    >
                                        Agregar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => {
                                            setIsAddingConfig(false);
                                            setNewConfig(getDefaultNewConfig());
                                            setConfigError('');
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="btn-add-configuration"
                            onClick={() => setIsAddingConfig(true)}
                        >
                            + Agregar Configuración
                        </button>
                    )}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button type="submit" className="btn-submit">
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
}

