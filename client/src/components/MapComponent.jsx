import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const createColoredIcon = (color) => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42"><path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="' + color + '" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="#ffffff"/></svg>';
  return L.divIcon({
    html: svg,
    className: 'custom-pin',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -36]
  });
};

const truckIcon = L.divIcon({
  html: '<div style="background:#2563eb; color:white; border-radius:9999px; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 6px -1px rgba(0,0,0,0.3); font-size:16px;">🚛</div>',
  className: 'truck-pin',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20]
});

export default function MapComponent({
  center = [31.2210, 75.7720],
  zoom = 14,
  complaints = [],
  collectors = [],
  draggableMarker = null,
  onMarkerDragEnd = null,
  onComplaintSelect = null,
  height = '400px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && center && center[0] && center[1]) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    if (draggableMarker) {
      const marker = L.marker([draggableMarker.lat, draggableMarker.lng], {
        draggable: true,
        icon: createColoredIcon('#10b981')
      }).addTo(markersGroupRef.current);

      marker.bindPopup('<b>📍 Your Location</b><br/>Drag to fine-tune coordinates.').openPopup();

      if (onMarkerDragEnd) {
        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          onMarkerDragEnd({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
        });
      }
    }

    complaints.forEach((c) => {
      if (!c.latitude || !c.longitude) return;

      let pinColor = '#f59e0b';
      if (c.status === 'Resolved') pinColor = '#10b981';
      else if (c.priority === 'CRITICAL') pinColor = '#ef4444';
      else if (c.priority === 'HIGH') pinColor = '#f97316';
      else if (c.priority === 'LOW') pinColor = '#64748b';

      const marker = L.marker([c.latitude, c.longitude], {
        icon: createColoredIcon(pinColor)
      }).addTo(markersGroupRef.current);

      const popupContent = '<div style="font-family:sans-serif; min-width:180px;">' +
        '<div style="font-size:12px; font-weight:bold; color:#0f172a;">' + c.complaintId + ' • ' + c.wasteType + ' Waste</div>' +
        '<div style="font-size:11px; color:#475569; margin:4px 0;">' + (c.address || 'Detected Location') + '</div>' +
        '<div style="display:flex; justify-content:space-between; font-size:10px; font-weight:bold; margin-bottom:6px;">' +
        '<span style="color:' + (c.priority === 'CRITICAL' ? '#ef4444' : '#f97316') + '">Priority: ' + c.priority + '</span>' +
        '<span style="color:#059669">' + c.status + '</span>' +
        '</div>' +
        '<button id="btn-popup-' + c._id + '" style="width:100%; background:#10b981; color:white; border:none; border-radius:6px; padding:4px 8px; font-size:11px; font-weight:bold; cursor:pointer;">' +
        'View / Assign Collector' +
        '</button>' +
        '</div>';

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById('btn-popup-' + c._id);
        if (btn && onComplaintSelect) {
          btn.onclick = () => onComplaintSelect(c);
        }
      });
    });

    collectors.forEach((col) => {
      if (!col.latitude || !col.longitude) return;
      const marker = L.marker([col.latitude, col.longitude], { icon: truckIcon }).addTo(markersGroupRef.current);
      marker.bindPopup(
        '<div style="font-family:sans-serif; min-width:160px;">' +
        '<div style="font-size:12px; font-weight:bold; color:#1e40af;">🚛 ' + (col.name || 'Collector') + '</div>' +
        '<div style="font-size:11px; color:#475569;">Vehicle: ' + (col.vehicle || 'Truck') + '</div>' +
        '<div style="font-size:11px; color:#059669; font-weight:bold;">Status: ' + (col.availability || 'Available') + '</div>' +
        '</div>'
      );
    });
  }, [complaints, collectors, draggableMarker]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl border border-slate-200 shadow-inner overflow-hidden"
    />
  );
}
