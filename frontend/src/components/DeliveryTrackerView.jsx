import React, { useState, useEffect } from 'react';
import {
  Package, ShieldCheck, Thermometer, Radio, Clock, MapPin,
  CheckCircle2, Navigation, ArrowRight, ExternalLink, RefreshCw
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function DeliveryTrackerView({ activeDispatches = [], onOpenEmergencyRequest }) {
  const [requests, setRequests] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await resilientFetch('/api/requests');
        if (Array.isArray(data)) {
          setRequests(data);
          if (data.length > 0 && !selectedReqId) setSelectedReqId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentReq = requests.find(r => r.id === selectedReqId) || requests[0];
  const relatedDispatch = activeDispatches.find(d => d.donorBloodType === currentReq?.bloodType) || activeDispatches[0];

  let currentStep = 3;
  if (currentReq?.status === 'Fulfilled' || relatedDispatch?.status === 'Arrived') currentStep = 5;
  else if (relatedDispatch?.status === 'En Route') currentStep = 4;

  const STEPS = [
    {
      num: 1,
      title: 'STAT Emergency Requisition Logged',
      desc: 'Digital intake ticket verified by regional medical dispatch.',
      time: currentReq?.createdAt ? new Date(currentReq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:14 AM',
      done: currentStep >= 1
    },
    {
      num: 2,
      title: 'AI Proximity Donor Matched',
      desc: 'Donor compatibility verified. 56-day cooldown cleared.',
      time: '10:16 AM',
      done: currentStep >= 2
    },
    {
      num: 3,
      title: 'Cold-Chain Thermal Sealed',
      desc: 'Unit packaged in IoT thermal box (2.0°C–6.0°C safe zone).',
      time: '10:18 AM',
      done: currentStep >= 3
    },
    {
      num: 4,
      title: 'Autonomous Vector In-Flight',
      desc: relatedDispatch ? `${relatedDispatch.transportType} traveling at ${relatedDispatch.speedMph || 48} mph.` : 'Autonomous transport active.',
      time: relatedDispatch ? `ETA ~${relatedDispatch.etaMinutes}m` : 'In Transit',
      done: currentStep >= 4,
      current: currentStep === 4
    },
    {
      num: 5,
      title: 'Hospital Rooftop Intake & Stock',
      desc: 'Verified by receiving trauma nurse and placed in ICU blood reserve.',
      time: currentStep === 5 ? 'Delivered' : 'Pending',
      done: currentStep >= 5
    }
  ];

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Live Emergency Delivery & Cold-Chain Logistics</h2>
            <span className="text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              AMAZON-GRADE TRACKER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-stage transit pipeline, IoT thermal compliance, and cryptographic custody verification
          </p>
        </div>

        <button
          onClick={onOpenEmergencyRequest}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all"
        >
          <span>New STAT Request</span>
        </button>
      </div>

      {currentReq ? (
        <div className="space-y-6">
          {/* Order Header Summary */}
          <div className="glass-panel bg-slate-900/80 border border-slate-800 p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs shadow-2xl">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tracking Requisition ID</span>
              <span className="font-mono font-black text-white text-base">{currentReq.id}</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Custody Seal: {currentReq.custodySeal || 'E39F8A2D104B76C1'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Patient Information</span>
              <span className="font-bold text-slate-200">{currentReq.patientName}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{currentReq.contactPhone}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Destination Trauma Center</span>
              <span className="font-bold text-rose-300">{currentReq.hospitalName}</span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">ICU Acute Trauma Unit</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Payload Specification</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold font-mono text-white bg-red-600 px-2 py-0.5 rounded-lg shadow-sm">
                  {currentReq.bloodType}
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">{currentReq.unitsRequired || 2} Units Required</span>
              </div>
            </div>
          </div>

          {/* 5-Step Delivery Milestone Timeline */}
          <div className="glass-panel bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center justify-between">
              <span>Autonomous Delivery Milestone Pipeline</span>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                Progress: {currentStep === 5 ? 'COMPLETED' : 'IN TRANSIT'}
              </span>
            </h3>

            <div className="relative pl-6 space-y-7">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-800" />

              {STEPS.map((step, idx) => {
                const isDone = step.done;
                const isCurrent = step.current;

                return (
                  <div key={idx} className="relative flex items-start justify-between gap-4">
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                          : isCurrent
                          ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-md shadow-rose-600/40'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isDone ? '✓' : step.num}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-bold ${isDone ? 'text-white' : 'text-slate-400'}`}>
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-bold animate-pulse">
                            ACTIVE VECTOR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                      {step.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IoT Cold Chain Telemetry Metrics */}
          {relatedDispatch && (
            <div className="bg-slate-950/90 border border-cyan-500/30 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Thermometer className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Thermal Sensor</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-cyan-400">{relatedDispatch.tempCelsius || 4.0}°C</span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Safe Medical Range (2°C–6°C)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">SPEED</span>
                  <span className="font-bold text-white">{relatedDispatch.speedMph || 48} mph</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ALTITUDE</span>
                  <span className="font-bold text-white">{relatedDispatch.altitudeMeters || 150}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">BATTERY</span>
                  <span className="font-bold text-emerald-400">{relatedDispatch.batteryPct || 98}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center text-sm text-slate-400 glass-panel p-8 rounded-3xl">
          <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p>No active emergency delivery tickets found.</p>
          <p className="text-xs text-slate-500 mt-1">Submit a STAT Emergency Request to launch autonomous drone transport.</p>
        </div>
      )}
    </div>
  );
}
