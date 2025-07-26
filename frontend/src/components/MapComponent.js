import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: '/leaflet/marker-icon.png',
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    shadowUrl: '/leaflet/marker-shadow.png',
});

const MapUpdater = ({ coords, initialCenter }) => {
    const map = useMap();
    useEffect(() => {
        if (coords?.length > 0) {
            map.fitBounds(coords);
        } else if (initialCenter) {
            map.setView(initialCenter, 5);
        }
    }, [coords, map, initialCenter]);
    return null;
};

const MapComponent = ({
                          routeCoords = [],
                          selectedStart,
                          selectedDestination,
                          stops = [],
                          currentPosition
                      }) => {
    const defaultCenter = [51.1657, 10.4515]; // Germany
    const [useAlternativeTiles, setUseAlternativeTiles] = useState(false);

    const toLatLng = (coord) => {
        if (!coord) return null;
        return Array.isArray(coord)
            ? [coord[1], coord[0]]
            : [coord.coords[1], coord.coords[0]];
    };

    const tileSources = {
        osm: {
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; OpenStreetMap contributors'
        },
        carto: {
            url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            attribution: '&copy; OpenStreetMap contributors & CartoDB'
        }
    };

    const activeTile = useAlternativeTiles ? tileSources.carto : tileSources.osm;

    return (
        <div>
            <button onClick={() => setUseAlternativeTiles(!useAlternativeTiles)}>
                Kartenservice wechseln
            </button>

            <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ height: '800px', width: '100%', marginTop: '10px' }}
            >
                <TileLayer
                    attribution={activeTile.attribution}
                    url={activeTile.url}
                />

                <MapUpdater coords={routeCoords} initialCenter={defaultCenter} />

                {selectedStart && (
                    <Marker position={toLatLng(selectedStart)}>
                        <Popup>Start</Popup>
                    </Marker>
                )}

                {stops.map((stop, index) => {
                    const pos = toLatLng(stop);
                    return pos && (
                        <Marker key={`stop-${index}`} position={pos}>
                            <Popup>Stop {index + 1}</Popup>
                        </Marker>
                    );
                })}

                {selectedDestination && (
                    <Marker position={toLatLng(selectedDestination)}>
                        <Popup>Ziel</Popup>
                    </Marker>
                )}

                {currentPosition && (
                    <Marker position={currentPosition}>
                        <Popup>Fahrer</Popup>
                    </Marker>
                )}

                {routeCoords.length > 0 && (
                    <Polyline positions={routeCoords} color="blue" />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
