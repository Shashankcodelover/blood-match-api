import React, { useEffect, useRef } from 'react';

export function RadarMap({ hospitalCoord, matches, activeDispatch }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(hospitalCoord, 13);
    mapInstanceRef.current = map;

    // Dark Leaflet tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Hospital Marker with pulsing halo
    const hospitalIcon = L.divIcon({ className: 'hospital-icon', iconSize: [26, 26] });
    L.marker(hospitalCoord, { icon: hospitalIcon })
      .addTo(map)
      .bindTooltip('<b style="color:#ef4444">SF General Emergency Hospital</b><br><span style="font-size:11px;color:#94a3b8">Trauma Center Dispatch Hub</span>', { permanent: false });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hospitalCoord]);

  // Update donor markers when matches change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    matches.forEach(d => {
      const isSelected = activeDispatch && activeDispatch.donorId === d.id;
      const iconClass = isSelected ? 'active-donor-icon' : 'donor-icon';
      const size = isSelected ? [24, 24] : [18, 18];

      const icon = L.divIcon({ className: iconClass, iconSize: size });
      const marker = L.marker([d.lat, d.lng], { icon })
        .addTo(map)
        .bindTooltip(`<b>${d.name} (${d.bloodType})</b><br>Match Score: <span style="color:#10b981;font-weight:bold">${d.aiScore}%</span>`, { direction: 'top' });

      markersRef.current[d.id] = marker;
    });
  }, [matches, activeDispatch]);

  // Update active dispatch vector polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (activeDispatch) {
      const coords = [
        [activeDispatch.currentLat, activeDispatch.currentLng],
        [activeDispatch.targetLat, activeDispatch.targetLng]
      ];

      polylineRef.current = L.polyline(coords, {
        color: '#10b981',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);

      // Pan smoothly to dispatch location
      map.panTo([activeDispatch.currentLat, activeDispatch.currentLng], { animate: true });
    }
  }, [activeDispatch]);

  return <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />;
}
