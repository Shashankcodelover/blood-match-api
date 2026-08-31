import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { RadarMap } from './components/RadarMap';
import { DispatchSidebar } from './components/DispatchSidebar';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { HospitalInventoryModal } from './components/HospitalInventoryModal';
import { RegisterDonorModal } from './components/RegisterDonorModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { BloodMatrixModal } from './components/BloodMatrixModal';
import { EmergencyRequestModal } from './components/EmergencyRequestModal';
import { DonorLeaderboardModal } from './components/DonorLeaderboardModal';
import { InterHospitalTransferModal } from './components/InterHospitalTransferModal';
import { DonorEligibilityModal } from './components/DonorEligibilityModal';
import { playDispatchSonar, playArrivalChime, toggleSound, isSoundEnabled } from './utils/audioAlerts';

export default function App() {
  const [recipientType, setRecipientType] = useState('O-');
  const [urgency, setUrgency] = useState('critical');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('HOSP-01');
  const [matches, setMatches] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [focusedDispatchId, setFocusedDispatchId] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

  // Modal Visibility States
  const [showInventory, setShowInventory] = useState(false);
  const [showRegisterDonor, setShowRegisterDonor] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showEmergencyRequest, setShowEmergencyRequest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInterHospital, setShowInterHospital] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);

  const trackingIntervalRef = useRef(null);
  const acknowledgedArrivedRef = useRef(new Set());

  // Fetch Hospitals list
  const fetchHospitals = useCallback(async () => {
    try {
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      setHospitals(data);
      if (!selectedHospitalId && data.length > 0) {
        setSelectedHospitalId(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching hospitals:', e);
    }
  }, [selectedHospitalId]);

  // Fetch AI Matched Donors
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`/api/donors/matches/${recipientType}?urgency=${urgency}&hospitalId=${selectedHospitalId}`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (e) {
      console.error('Error fetching matches:', e);
    }
  }, [recipientType, urgency, selectedHospitalId]);

  // Fetch all initial data
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Poll active telemetry for all dispatches
  const pollActiveTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/dispatch/track-all');
      const allDispatches = await res.json();
      setDispatches(allDispatches);

      // Check if newly arrived
      allDispatches.forEach(disp => {
        if (disp.status === 'Arrived' && !acknowledgedArrivedRef.current.has(disp.id)) {
          acknowledgedArrivedRef.current.add(disp.id);
          playArrivalChime();
        }
      });
    } catch (e) {
      console.error('Telemetry polling error:', e);
    }
  }, []);

  // Polling loop manager
  useEffect(() => {
    trackingIntervalRef.current = setInterval(pollActiveTelemetry, 1500);
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, [pollActiveTelemetry]);

  // Initiate Dispatch Mission
  const handleDispatch = async (donorId, transportType) => {
    try {
      playDispatchSonar();
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId,
          transportType,
          hospitalId: selectedHospitalId
        })
      });
      const newDisp = await res.json();
      setDispatches(prev => [newDisp, ...prev]);
      setFocusedDispatchId(newDisp.id);
      fetchMatches();
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  // Hospital Intake Confirmation
  const handleConfirmReceipt = async (dispatchId, nurseName, badgeId) => {
    try {
      const res = await fetch(`/api/dispatch/${dispatchId}/confirm-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nurseName, badgeId })
      });
      const data = await res.json();
      pollActiveTelemetry();
      fetchHospitals();
      fetchMatches();
    } catch (err) {
      console.error('Receipt confirmation error:', err);
    }
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const activeInFlightCount = dispatches.filter(d => d.status === 'En Route').length;
  const currentHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0] || { name: 'SF General Trauma Center', lat: 37.7749, lng: -122.4194 };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-slate-950 font-sans text-slate-100">
      {/* Navbar Header */}
      <Navbar
        onOpenInventory={() => setShowInventory(true)}
        onOpenRegisterDonor={() => setShowEligibilityModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenMatrix={() => setShowMatrixModal(true)}
        onOpenEmergencyRequest={() => setShowEmergencyRequest(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenInterHospital={() => setShowInterHospital(true)}
        onToggleSound={handleSoundToggle}
        soundOn={soundOn}
        activeDispatchCount={activeInFlightCount}
      />

      {/* Interactive Leaflet Radar Map */}
      <RadarMap
        hospitals={hospitals}
        selectedHospitalId={selectedHospitalId}
        onSelectHospital={setSelectedHospitalId}
        matches={matches}
        activeDispatches={dispatches}
        focusedDispatchId={focusedDispatchId}
      />

      {/* AI Dispatch Sidebar */}
      <DispatchSidebar
        hospitals={hospitals}
        selectedHospitalId={selectedHospitalId}
        onSelectHospital={setSelectedHospitalId}
        recipientType={recipientType}
        setRecipientType={setRecipientType}
        urgency={urgency}
        setUrgency={setUrgency}
        matches={matches}
        activeDispatches={dispatches}
        onDispatch={handleDispatch}
        onOpenInterHospital={() => setShowInterHospital(true)}
        onOpenEmergencyRequest={() => setShowEmergencyRequest(true)}
        onOpenMatrix={() => setShowMatrixModal(true)}
      />

      {/* Live Telemetry Overlay */}
      <TelemetryOverlay
        dispatches={dispatches}
        focusedDispatchId={focusedDispatchId}
        onFocusDispatch={setFocusedDispatchId}
        onConfirmReceipt={handleConfirmReceipt}
      />

      {/* Modals */}
      {showInventory && (
        <HospitalInventoryModal
          onClose={() => setShowInventory(false)}
        />
      )}

      {showEligibilityModal && (
        <DonorEligibilityModal
          onClose={() => setShowEligibilityModal(false)}
          onClearedForRegistration={() => setShowRegisterDonor(true)}
        />
      )}

      {showRegisterDonor && (
        <RegisterDonorModal
          onClose={() => setShowRegisterDonor(false)}
          onRegistered={() => {
            fetchMatches();
            fetchHospitals();
          }}
        />
      )}

      {showAdminModal && (
        <AdminPortalModal
          onClose={() => setShowAdminModal(false)}
          onDataChange={() => {
            fetchMatches();
            fetchHospitals();
            pollActiveTelemetry();
          }}
        />
      )}

      {showMatrixModal && (
        <BloodMatrixModal
          onClose={() => setShowMatrixModal(false)}
          selectedType={recipientType}
          onSelectType={setRecipientType}
        />
      )}

      {showEmergencyRequest && (
        <EmergencyRequestModal
          onClose={() => setShowEmergencyRequest(false)}
          hospitals={hospitals}
          onDispatchMission={(donorId, transportType) => handleDispatch(donorId, transportType)}
          onRequestCreated={() => {
            fetchMatches();
            pollActiveTelemetry();
          }}
        />
      )}

      {showLeaderboard && (
        <DonorLeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          activeHospitalName={currentHospital?.name}
        />
      )}

      {showInterHospital && (
        <InterHospitalTransferModal
          onClose={() => setShowInterHospital(false)}
          currentHospital={currentHospital}
          onTransferInitiated={(newDisp) => {
            setDispatches(prev => [newDisp, ...prev]);
            setFocusedDispatchId(newDisp.id);
            fetchHospitals();
          }}
        />
      )}
    </div>
  );
}
