import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useState } from "react";
import Map, { Marker } from "react-map-gl/maplibre";

type MapPickerProps = {
   longitude?: number;
   latitude?: number;
   onCoordinatesChange: (longitude: number, latitude: number) => void;
};

const MAPTILER_API_KEY = "lLMSHC7KCVK6NsfkNcUu";
const INITIAL_VIEW_STATE = {
   longitude: 10.7461,
   latitude: 59.9127,
   zoom: 5,
};

export const MapPicker = ({ longitude, latitude, onCoordinatesChange }: MapPickerProps) => {
   const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

   const handleMapClick = useCallback(
      (event: maplibregl.MapLayerMouseEvent) => {
         const { lng, lat } = event.lngLat;
         onCoordinatesChange(lng, lat);
      },
      [onCoordinatesChange]
   );

   return (
      <div className="relative w-full h-[400px] rounded-md overflow-hidden border">
         <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle={`https://api.maptiler.com/maps/base-v4/style.json?key=${MAPTILER_API_KEY}`}
            onClick={handleMapClick}
            cursor="crosshair"
         >
            {longitude !== undefined && latitude !== undefined && (
               <Marker longitude={longitude} latitude={latitude} anchor="bottom">
                  <div className="relative">
                     <svg
                        height="40"
                        viewBox="0 0 24 24"
                        className="fill-red-500 drop-shadow-lg"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                     </svg>
                  </div>
               </Marker>
            )}
         </Map>
         <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md text-sm shadow-md border">
            <p className="font-medium">Klikk på kartet for å velge posisjon</p>
            {longitude !== undefined && latitude !== undefined && (
               <p className="text-muted-foreground text-xs mt-1">
                  {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
               </p>
            )}
         </div>
      </div>
   );
};
