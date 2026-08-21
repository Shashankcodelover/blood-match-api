import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { RadarMap } from './components/RadarMap';
import { DispatchSidebar } from './components/DispatchSidebar';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { HospitalInventoryModal } from './components/HospitalInventoryModal';
import { RegisterDonorModal } from './components/RegisterDonorModal';

const HOSPITAL_COORD = [37.7749, -122.4194]; // San Francisco General Hospital

export default function App() {
  const [recipientType, setRecipientType] = useState('O-');
  const [urgency, setUrgency] = useState('critical');
  const [hospital, setHospital] = useState({ name: 'SF General Hospital', lat: 37.7749, lng: -122.4194 });
  const [matches, setMatches] = useState([]);
  const [activeDispatch, setActiveDispatch] = useState(null);

  const [showInventory, setShowInventory] = useState(false);
  const [showRegisterDonor, setShowRegisterDonor] = useState(false);

  const trackingIntervalRef = useRef(null);

  // Fetch matched donors from API
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`/api/donors/matches/${recipientType}?urgency=${urgency}`);
      const data = await res.json();
      setHospital(data.hospital);
      setMatches(data.matches);
    } catch (e) {
      console.error('Error fetching matches:', e);
    }
  }, [recipientType, urgency]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Initiate Dispatch Mission
  const handleDispatch = async (donorId, transportType) => {
    if (activeDispatch) return alert('A mission is already active.');

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId, transportType, hospitalId: hospital.id })
      });
      const data = await res.json();
      setActiveDispatch(data);
      startTelemetryTracking(data.id);
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  // Start real-time telemetry polling
  const startTelemetryTracking = (dispatchId) => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    trackingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/dispatch/track/${dispatchId}`);
        const data = await res.json();
        setActiveDispatch(data);

        if (data.status === 'Arrived') {
          clearInterval(trackingIntervalRef.current);
          setTimeout(() => {
            alert(`🎉 MISSION ACCOMPLISHED!\n${data.transportType} has delivered blood unit (${data.donorBloodType}) from ${data.donorName} to ${data.hospitalName}.`);
            setActiveDispatch(null);
            fetchMatches();
          }, 1000);
        }
      } catch (e) {
        console.error(e);
      }
    }, 1500); // 1.5s live polling interval
  };

  // Cleanup telemetry interval on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navbar Header */}
      <Navbar
        onOpenInventory={() => setShowInventory(true)}
        onOpenRegisterDonor={() => setShowRegisterDonor(true)}
        activeDispatchCount={activeDispatch ? 1 : 0}
      />

      {/* Interactive Radar Leaflet Map */}
      <RadarMap
        hospitalCoord={[hospital.lat, hospital.lng]}
        matches={matches}
        activeDispatch={activeDispatch}
      />

      {/* AI Dispatch Sidebar */}
      <DispatchSidebar
        recipientType={recipientType}
        setRecipientType={setRecipientType}
        urgency={urgency}
        setUrgency={setUrgency}
        matches={matches}
        activeDispatch={activeDispatch}
        onDispatch={handleDispatch}
      />

      {/* Live Telemetry Overlay */}
      <TelemetryOverlay dispatch={activeDispatch} />

      {/* Modals */}
      {showInventory && <HospitalInventoryModal onClose={() => setShowInventory(false)} />}
      {showRegisterDonor && <RegisterDonorModal onClose={() => setShowRegisterDonor(false)} onRegistered={fetchMatches} />}
    </div>
  );
}
