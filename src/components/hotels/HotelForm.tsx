'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hotelSchema, type HotelFormData } from '../../schemas/hotelSchema';
import { useRoomTypes } from '../../hooks/useRoomTypes';
import { useCreateHotel } from '../../hooks/useCreateHotel';
import type { Hotel } from '../../types/hotel';
import type { HotelConfiguration } from '../../types/hotel-configuration';
import { showSuccessAlert } from '../../utils/alerts';
import './HotelForm.css';

type ServerErrors = Record<string, string>;
type NewConfiguration = {
    room_type_id: number;
    accommodation_id: number;
    quantity: number;
};
type FormConfiguration = NewConfiguration & Pick<HotelConfiguration, 'accommodation' | 'id' | 'room_type'>;
export type HotelPayload = Omit<HotelFormData, 'configurations'> & {
    configurations: NewConfiguration[];
};

interface HotelFormProps {
    initialHotel?: Hotel;
    isSaving?: boolean;
    onSubmitHotel?: (payload: HotelPayload) => Promise<unknown>;
    submitLabel?: string;
    successMessage?: string;
    successTitle?: string;
    title?: string;
}

const getDefaultNewConfig = (): NewConfiguration => ({
    room_type_id: 0,
    accommodation_id: 0,
    quantity: 1,
});

const parseServerErrors = (error: unknown): ServerErrors => {
    const backendErrors: ServerErrors = {};

    if (!error || typeof error !== 'object' || !('response' in error)) {
        return {
            general: 'Ocurrió un error al crear el hotel',
        };
    }

    const response = error.response as {
        data?: {
            detail?: string;
            errors?: unknown;
            message?: string;
        };
    };
    const responseData = response.data;

    if (responseData?.errors && typeof responseData.errors === 'object' && !Array.isArray(responseData.errors)) {
        Object.entries(responseData.errors).forEach(([field, message]) => {
            backendErrors[field] = Array.isArray(message) ? String(message[0]) : String(message);
        });

        return backendErrors;
    }

    if (Array.isArray(responseData?.errors)) {
        responseData.errors.forEach((item) => {
            if (item && typeof item === 'object') {
                const validationError = item as { field?: string; message?: string };
                backendErrors[validationError.field || 'general'] = validationError.message || 'Error en validación';
            }
        });

        return backendErrors;
    }

    return {
        general: responseData?.message || responseData?.detail || 'Ocurrió un error al crear el hotel',
    };
};

const getInitialFormValues = (hotel?: Hotel): HotelFormData => ({
    name: hotel?.name || '',
    city: hotel?.city || '',
    address: hotel?.address || '',
    nit: hotel?.nit || '',
    total_rooms: hotel?.total_rooms || 1,
    configurations: [],
});

const normalizeConfigurations = (configurations?: HotelConfiguration[]): FormConfiguration[] => {
    return configurations?.map((configuration) => ({
        id: configuration.id,
        room_type_id: configuration.room_type_id ?? configuration.room_type?.id ?? 0,
        accommodation_id: configuration.accommodation_id ?? configuration.accommodation?.id ?? 0,
        room_type: configuration.room_type,
        accommodation: configuration.accommodation,
        quantity: configuration.quantity,
    })).filter((configuration) => {
        return configuration.room_type_id > 0 && configuration.accommodation_id > 0;
    }) ?? [];
};

export const HotelForm = ({
    initialHotel,
    isSaving,
    onSubmitHotel,
    submitLabel = 'Guardar',
    successMessage = 'Hotel creado correctamente',
    successTitle = 'Hotel creado correctamente',
    title = 'Crear Hotel',
}: HotelFormProps) => {
    const { data: roomTypes = [], isLoading: isLoadingRoomTypes } = useRoomTypes();
    const createHotelMutation = useCreateHotel();
    const [configurations, setConfigurations] = useState<FormConfiguration[]>(() => normalizeConfigurations(initialHotel?.configurations));
    const [isAddingConfig, setIsAddingConfig] = useState(false);
    const [configError, setConfigError] = useState<string>('');
    const [serverErrors, setServerErrors] = useState<ServerErrors>({});
    const [formSuccessMessage, setFormSuccessMessage] = useState('');
    const [newConfig, setNewConfig] = useState<NewConfiguration>(getDefaultNewConfig());

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
        reset,
        formState: { errors },
        watch,
    } = useForm<HotelFormData>({
        resolver: zodResolver(hotelSchema),
        defaultValues: getInitialFormValues(initialHotel),
    });

    useEffect(() => {
        reset(getInitialFormValues(initialHotel));
        setConfigurations(normalizeConfigurations(initialHotel?.configurations));
        setServerErrors({});
        setConfigError('');
        setFormSuccessMessage('');
        setNewConfig(getDefaultNewConfig());
        setIsAddingConfig(false);
    }, [initialHotel, reset]);

    const total_rooms = watch('total_rooms');
    const assignedRooms = useMemo(() => {
        return configurations.reduce((sum, config) => sum + config.quantity, 0);
    }, [configurations]);
    const availableRooms = Math.max(0, (total_rooms || 0) - assignedRooms);
    const availableRoomsForNewConfig = Math.max(0, availableRooms + (newConfig.quantity || 0));
    const hasConfigurations = configurations.length > 0;
    const isSubmitting = isSaving ?? createHotelMutation.isPending;

    const handleAddConfiguration = () => {
        setFormSuccessMessage('');

        // Ensure total rooms is defined before assigning room configurations.
        if (!total_rooms || total_rooms <= 0) {
            setConfigError('Debes establecer el total de habitaciones primero');
            return;
        }

        if (
            !newConfig.room_type_id ||
            !newConfig.accommodation_id ||
            !newConfig.quantity
        ) {
            setConfigError('Todos los campos son obligatorios');
            return;
        }

        const duplicatedConfiguration = configurations.some((config) => {
            return config.room_type_id === newConfig.room_type_id
                && config.accommodation_id === newConfig.accommodation_id;
        });

        if (duplicatedConfiguration) {
            setConfigError('Esta configuración ya fue agregada');
            return;
        }

        const newTotal = assignedRooms + newConfig.quantity;
        if (newTotal > total_rooms) {
            setConfigError(
                `La suma de habitaciones (${newTotal}) no puede exceder el total configurado (${total_rooms})`
            );
            return;
        }

        setConfigurations((currentConfigurations) => [...currentConfigurations, newConfig]);
        setNewConfig(getDefaultNewConfig());
        setConfigError('');
        setIsAddingConfig(false);
    };

    const handleRemoveConfiguration = (index: number) => {
        setConfigurations((currentConfigurations) => currentConfigurations.filter((_, i) => i !== index));
        setConfigError('');
        setFormSuccessMessage('');
    };

    const onSubmit = async (data: HotelFormData) => {
        setServerErrors({});
        setFormSuccessMessage('');

        if (assignedRooms > data.total_rooms) {
            setConfigError(
                `Las habitaciones asignadas (${assignedRooms}) exceden el total configurado (${data.total_rooms})`
            );
            return;
        }
        
        const payload: HotelPayload = {
            ...data,
            configurations: configurations.map((configuration) => ({
                room_type_id: configuration.room_type_id,
                accommodation_id: configuration.accommodation_id,
                quantity: configuration.quantity,
            })),
        };

        try {
            if (onSubmitHotel) {
                await onSubmitHotel(payload);
            } else {
                await createHotelMutation.mutateAsync(payload);
                reset(getInitialFormValues());
                setConfigurations([]);
                setNewConfig(getDefaultNewConfig());
                setIsAddingConfig(false);
            }

            setConfigError('');
            setFormSuccessMessage(successMessage);
            void showSuccessAlert(successTitle, 'El hotel fue guardado con sus configuraciones.');
        } catch (error: unknown) {
            setServerErrors(parseServerErrors(error));
        }
    };

    const getRoomTypeName = (configuration: FormConfiguration) => {
        return roomTypes.find((rt) => rt.id === configuration.room_type_id)?.name
            || configuration.room_type?.name
            || '';
    };

    const getAccommodationName = (configuration: FormConfiguration) => {
        const roomType = roomTypes.find((rt) => rt.id === configuration.room_type_id);

        return roomType?.accommodations.find((a) => a.id === configuration.accommodation_id)?.name
            || configuration.accommodation?.name
            || '';
    };

    const getAccommodationsByRoomType = (roomTypeId: number) => {
        const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
        return roomType?.accommodations || [];
    };

    return (
        <div className="hotel-form-container">
            <form onSubmit={handleSubmit(onSubmit)} className="hotel-form">
                <div className="form-header">
                    <div>
                        <h1>{title}</h1>
                        <p>Registra los datos básicos y distribuye las habitaciones por tipo y acomodación.</p>
                    </div>
                </div>

                {serverErrors['general'] && (
                    <div className="server-error-message">
                        <div className="error-content">
                            <strong>Error en la solicitud</strong>
                            <p>{serverErrors['general']}</p>
                        </div>
                    </div>
                )}

                {formSuccessMessage && (
                    <div className="success-message">
                        {formSuccessMessage}
                    </div>
                )}

                <div className="form-section basic-info">
                    <div className="form-group form-group-wide">
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

                    <div className="form-group">
                        <label htmlFor="total_rooms">Total Habitaciones</label>
                        <input
                            id="total_rooms"
                            type="number"
                            min="1"
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

                <div className="form-section configurations-section">
                    <div className="section-heading">
                        <div>
                            <h2>Configuraciones</h2>
                            <p>Distribuye el total de habitaciones sin exceder la capacidad del hotel.</p>
                        </div>
                    </div>

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

                    {total_rooms > 0 && (
                        <div className="config-summary">
                            <div className="summary-stat">
                                <span className="summary-label">Total Habitaciones:</span>
                                <span className="summary-value">{total_rooms}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-label">Asignadas:</span>
                                <span className="summary-value assigned">
                                    {assignedRooms}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-label">Disponibles:</span>
                                <span className="summary-value available">
                                    {availableRooms}
                                </span>
                            </div>
                        </div>
                    )}

                    {hasConfigurations ? (
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
                                        <tr key={`${config.room_type_id}-${config.accommodation_id}-${index}`}>
                                            <td>{getRoomTypeName(config)}</td>
                                            <td>{getAccommodationName(config)}</td>
                                            <td>{config.quantity}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-delete"
                                                    onClick={() => handleRemoveConfiguration(index)}
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
                    ) : (
                        <div className="empty-configurations">
                            No hay configuraciones agregadas.
                        </div>
                    )}

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
                                                room_type_id: Number(e.target.value),
                                                accommodation_id: 0,
                                            })
                                        }
                                        disabled={isLoadingRoomTypes}
                                    >
                                        <option value="">
                                            {isLoadingRoomTypes ? 'Cargando tipos' : 'Seleccionar tipo'}
                                        </option>
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
                                                accommodation_id: Number(e.target.value),
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
                                        max={Math.max(1, availableRoomsForNewConfig)}
                                        value={Math.max(1, newConfig.quantity ?? 1)}
                                        onChange={(e) => {
                                            const rawValue = e.target.value;
                                            const parsedValue = parseInt(rawValue, 10);
                                            const normalizedValue = isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue;
                                            const finalValue = Math.min(normalizedValue, Math.max(1, availableRoomsForNewConfig));
                                            
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
                            onClick={() => {
                                setFormSuccessMessage('');
                                setIsAddingConfig(true);
                            }}
                        >
                            + Agregar Configuración
                        </button>
                    )}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}
