import React, { useEffect, useRef } from 'react';

export function RadarMap({
  hospitals = [],
  selectedHospitalId,
  onSelectHospital,
  matches = [],
  activeDispatches = [],
  focusedDispatchId,
  userLocation = null
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hospitalMarkersRef = useRef({});
  const donorMarkersRef = useRef({});
  const dispatchPolylinesRef = useRef({});
  const droneMarkersRef = useRef({});
  const userLocationMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194];
    const map = L.map(mapRef.current, { zoomControl: false }).setView(initialCenter, 13);
    mapInstanceRef.current = map;

    // Dark Leaflet tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Live User GPS Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (userLocationMarkerRef.current) {
      map.removeLayer(userLocationMarkerRef.current);
      userLocationMarkerRef.current = null;
    }

    if (userLocation) {
      const userGpsIcon = L.divIcon({
        className: 'user-gps-beacon',
        html: `<div style="background:#06b6d4; width:22px; height:22px; border-radius:50%; border:3px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(6,182,212,0.9); animation:pulse 2s infinite">📍</div>`,
        iconSize: [22, 22]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userGpsIcon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-family:sans-serif"><b style="color:#06b6d4">Your Live GPS Location</b><br><span style="font-size:10px;color:#94a3b8">Active Radar Origin</span></div>`,
          { direction: 'top' }
        );

      userLocationMarkerRef.current = marker;
      map.flyTo([userLocation.lat, userLocation.lng], 14, { animate: true, duration: 1.2 });
    }
  }, [userLocation]);

  // Render & Update Hospital Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !hospitals.length) return;

    // Clear old hospital markers
    Object.values(hospitalMarkersRef.current).forEach(m => map.removeLayer(m));
    hospitalMarkersRef.current = {};

    hospitals.forEach(h => {
      const isSelected = h.id === selectedHospitalId;
      const iconClass = isSelected ? 'hospital-icon-active' : 'hospital-icon';
      const size = isSelected ? [32, 32] : [24, 24];

      const hospitalIcon = L.divIcon({
        className: `${iconClass} flex items-center justify-center text-white font-bold text-[10px]`,
        html: `<div style="background:${isSelected ? '#ef4444' : '#64748b'}; width:100%; height:100%; border-radius:8px; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px ${isSelected ? 'rgba(239,68,68,0.7)' : 'rgba(0,0,0,0.5)'}">🏥</div>`,
        iconSize: size
      });

      const marker = L.marker([h.lat, h.lng], { icon: hospitalIcon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-family:sans-serif"><b style="color:#ef4444;font-size:12px">${h.name}</b><br><span style="font-size:10px;color:#94a3b8">Code: ${h.code} • Helipad: ${h.helipad ? 'Active' : 'No'}</span><br><span style="font-size:9px;color:#38bdf8">Click to set as Active Hub</span></div>`,
          { direction: 'top' }
        );

      marker.on('click', () => {
        if (onSelectHospital) onSelectHospital(h.id);
      });

      hospitalMarkersRef.current[h.id] = marker;
    });

    // Pan to selected hospital if no user GPS override
    if (!userLocation) {
      const currentHosp = hospitals.find(h => h.id === selectedHospitalId);
      if (currentHosp) {
        map.panTo([currentHosp.lat, currentHosp.lng], { animate: true, duration: 0.6 });
      }
    }
  }, [hospitals, selectedHospitalId, userLocation]);

  // Update Donor Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    // Clear old markers
    Object.values(donorMarkersRef.current).forEach(m => map.removeLayer(m));
    donorMarkersRef.current = {};

    matches.forEach(d => {
      const isTargeted = activeDispatches.some(disp => disp.donorId === d.id && disp.status === 'En Route');
      const iconClass = isTargeted ? 'active-donor-icon' : 'donor-icon';
      const size = isTargeted ? [28, 28] : [18, 18];

      const icon = L.divIcon({
        className: iconClass,
        html: `<div style="background:${isTargeted ? '#10b981' : '#f43f5e'}; width:100%; height:100%; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(244,63,94,0.6)">🩸</div>`,
        iconSize: size
      });

      const marker = L.marker([d.lat, d.lng], { icon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-family:sans-serif"><b style="color:#ffffff">${d.name} (${d.bloodType})</b><br><span style="color:#10b981;font-weight:bold">AI Match: ${d.aiScore}%</span> • <span style="color:#94a3b8">${d.distanceMiles} mi</span></div>`,
          { direction: 'top' }
        );

      donorMarkersRef.current[d.id] = marker;
    });
  }, [matches, activeDispatches]);

  // Update Active Dispatches (Polylines & Animated Drone Vectors)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    // Clear old polylines & drone markers
    Object.values(dispatchPolylinesRef.current).forEach(p => map.removeLayer(p));
    dispatchPolylinesRef.current = {};

    Object.values(droneMarkersRef.current).forEach(m => map.removeLayer(m));
    droneMarkersRef.current = {};

    activeDispatches.forEach(disp => {
      if (disp.status === 'Cancelled' || disp.status === 'Arrived') return;

      const isFocused = disp.id === focusedDispatchId;

      // Draw dashed trajectory line
      const coords = [
        [disp.currentLat, disp.currentLng],
        [disp.targetLat, disp.targetLng]
      ];

      const polyline = L.polyline(coords, {
        color: disp.transportType === 'Inter-Hospital Drone' ? '#38bdf8' : disp.transportType === 'Autonomous Drone' ? '#a855f7' : '#f59e0b',
        weight: isFocused ? 4 : 3,
        dashArray: '8, 8',
        opacity: 0.9
      }).addTo(map);

      dispatchPolylinesRef.current[disp.id] = polyline;

      // Drone / Transport Icon on current position
      const droneIcon = L.divIcon({
        className: 'drone-current-pos',
        html: `<div style="background:${disp.transportType.includes('Drone') ? '#9333ea' : '#f59e0b'}; width:26px; height:26px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(168,85,247,0.9); font-size:13px">🚁</div>`,
        iconSize: [26, 26]
      });

      const droneMarker = L.marker([disp.currentLat, disp.currentLng], { icon: droneIcon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-family:sans-serif"><b style="color:#c084fc">${disp.id} (${disp.transportType})</b><br><span style="font-size:10px;color:#94a3b8">Temp: ${disp.tempCelsius}°C • ETA: ~${disp.etaMinutes}m</span></div>`,
          { direction: 'top' }
        );

      droneMarkersRef.current[disp.id] = droneMarker;

      if (isFocused) {
        map.panTo([disp.currentLat, disp.currentLng], { animate: true });
      }
    });
  }, [activeDispatches, focusedDispatchId]);

  return <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />;
}
