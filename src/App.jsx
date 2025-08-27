import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });
  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

function LocationPicker({ label, value, onChange }) {
  return (
    <div className="mb-4">
      <p className="font-semibold mb-2">{label}</p>
      <div className="h-60 rounded overflow-hidden border">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationMarker onSelect={onChange} />
        </MapContainer>
      </div>
      {value && (
        <p className="text-sm mt-2">
          Selected: {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [bride, setBride] = useState({ name: "", date: "", time: "", lat: null, lon: null });
  const [groom, setGroom] = useState({ name: "", date: "", time: "", lat: null, lon: null });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleMatch() {
    setLoading(true);
    setResult(null);
    const brideDob = bride.date && bride.time ? `${bride.date}T${bride.time}:00` : "";
    const groomDob = groom.date && groom.time ? `${groom.date}T${groom.time}:00` : "";
    try {
      const res = await fetch("http://localhost:4000/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bride: { ...bride, dob: brideDob }, groom: { ...groom, dob: groomDob } }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Error:", e);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Kundali Matcher</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Bride</h2>
          <input type="text" placeholder="Name" value={bride.name} onChange={e => setBride({ ...bride, name: e.target.value })} className="w-full border rounded p-2 mb-2" />
          <input type="date" value={bride.date} onChange={e => setBride({ ...bride, date: e.target.value })} className="w-full border rounded p-2 mb-2" />
          <input type="time" value={bride.time} onChange={e => setBride({ ...bride, time: e.target.value })} className="w-full border rounded p-2 mb-2" />
          <LocationPicker label="Birth Location" value={bride.location} onChange={coords => setBride({ ...bride, lat: coords.lat, lon: coords.lng })} />
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Groom</h2>
          <input type="text" placeholder="Name" value={groom.name} onChange={e => setGroom({ ...groom, name: e.target.value })} className="w-full border rounded p-2 mb-2" />
          <input type="date" value={groom.date} onChange={e => setGroom({ ...groom, date: e.target.value })} className="w-full border rounded p-2 mb-2" />
          <input type="time" value={groom.time} onChange={e => setGroom({ ...groom, time: e.target.value })} className="w-full border rounded p-2 mb-2" />
          <LocationPicker label="Birth Location" value={groom.location} onChange={coords => setGroom({ ...groom, lat: coords.lat, lon: coords.lng })} />
        </div>
      </div>
      <button onClick={handleMatch} disabled={loading} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">{loading ? "Matching..." : "Match Kundalis"}</button>
      {result && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded shadow bg-white">
            <h2 className="text-lg font-bold mb-2">Bride Kundali</h2>
            <p><strong>Name:</strong> {bride.name}</p>
            <p><strong>Rashi:</strong> {result.bride?.rashi}</p>
            <p><strong>Nakshatra:</strong> {result.bride?.nakshatra} (Pada {result.bride?.pada})</p>
            <h3 className="mt-3 font-semibold">Grahas</h3>
            <ul className="list-disc ml-5 text-sm">
              {result.bride?.grahas?.map((g, i) => (
                <li key={i}>{g.name}: {g.longitude.toFixed(2)}°</li>
              ))}
            </ul>
          </div>
          <div className="p-4 border rounded shadow bg-white">
            <h2 className="text-lg font-bold mb-2">Groom Kundali</h2>
            <p><strong>Name:</strong> {groom.name}</p>
            <p><strong>Rashi:</strong> {result.groom?.rashi}</p>
            <p><strong>Nakshatra:</strong> {result.groom?.nakshatra} (Pada {result.groom?.pada})</p>
            <h3 className="mt-3 font-semibold">Grahas</h3>
            <ul className="list-disc ml-5 text-sm">
              {result.groom?.grahas?.map((g, i) => (
                <li key={i}>{g.name}: {g.longitude.toFixed(2)}°</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {result?.score !== undefined && (
        <div className="mt-6 p-4 border rounded shadow bg-green-50 text-center">
          <h2 className="text-xl font-bold">Match Score</h2>
          <p className="text-2xl text-green-700 font-semibold">{result.score} / 36</p>
        </div>
      )}
    </div>
  );
}
