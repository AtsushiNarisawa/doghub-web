"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RouteMapProps {
  coordinates: [number, number][];
  startLat: number;
  startLng: number;
  routeName: string;
}

export default function RouteMap({ coordinates, startLat, startLng, routeName }: RouteMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        地図を読み込み中...
      </div>
    );
  }

  const center: [number, number] =
    coordinates.length > 0
      ? [
          coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length,
          coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length,
        ]
      : [startLat, startLng];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <MapContainer center={center} zoom={coordinates.length > 0 ? 14 : 15} className="w-full h-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.length > 0 && (
          <Polyline positions={coordinates} pathOptions={{ color: "#d97706", weight: 4, opacity: 0.8 }} />
        )}
        <Marker position={[startLat, startLng]} icon={defaultIcon}>
          <Popup>{routeName} - スタート地点</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
