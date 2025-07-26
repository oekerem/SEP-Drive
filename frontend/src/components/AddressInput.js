import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import GeocodingService from '../services/GeocodingService';

const AddressInput = ({ label, value, onChange, onSelect, onCurrentLocation }) => {
    const [useCoordinates, setUseCoordinates] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
    const [coordError, setCoordError] = useState(null);
    const [debouncedValue, setDebouncedValue] = useState('');

    // Interval to reduce API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, 300 );

        return () => clearTimeout(timer);
    }, [value]);

    const { data, error } = useSWR(
        !useCoordinates && debouncedValue.length > 2 ? ['geocode', debouncedValue] : null,
        ([, query]) => GeocodingService.fetchSuggestions({ query }),
        {
            dedupingInterval: 500,
            revalidateOnFocus: false,
            onError: (err) => {
                console.error('Geocoding error:', err);
            }
        }
    );

    const suggestions = data?.suggestions || [];

    const handleCoordinateConfirm = () => {
        const lat = parseFloat(coordinates.lat);
        const lng = parseFloat(coordinates.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            setCoordError(null);
            onSelect({
                text: `${coordinates.lat}, ${coordinates.lng}`,
                coordinates: [lng, lat]
            });
        } else {
            setCoordError("Ungültige Koordinaten – bitte gültige Zahlen eingeben.");
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <label>{label}:</label>

            <div style={{ margin: '5px 0' }}>
                <label>
                    <input
                        type="checkbox"
                        checked={useCoordinates}
                        onChange={() => {
                            setUseCoordinates(!useCoordinates);
                            setCoordError(null);
                            onChange('');
                        }}
                    />
                    Koordinaten
                </label>
            </div>

            {useCoordinates ? (
                <div>
                    <input
                        type="number"
                        placeholder="(Bsp.) 51.462489"
                        value={coordinates.lat}
                        onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
                        step="0.000001"
                    />
                    <input
                        type="number"
                        placeholder="(Bsp.) 7.007001"
                        value={coordinates.lng}
                        onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
                        step="0.000001"
                    />
                    <button onClick={handleCoordinateConfirm} style={{ marginTop: '5px' }}>
                        Koordinaten bestätigen
                    </button>
                    {coordError && (
                        <div style={{ color: 'red', marginTop: '5px' }}>
                            {coordError}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Adresse eingeben"
                    />
                    {onCurrentLocation && (
                        <button onClick={onCurrentLocation}>Aktueller Standort</button>
                    )}
                    {error && (
                        <div style={{ color: 'red' }}>
                            Adresssuche fehlgeschlagen
                        </div>
                    )}
                    {suggestions.length > 0 && (
                        <select
                            onChange={(e) =>
                                e.target.value && onSelect(suggestions[e.target.value])
                            }
                            style={{ marginTop: '5px', width: '100%' }}
                        >
                            <option value="">Adresse auswählen</option>
                            {suggestions.map((suggestion, i) => (
                                <option key={i} value={i}>
                                    {suggestion.text}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressInput;
