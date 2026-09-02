import React, { useState } from 'react';
import { Hospital, Droplet, ShieldCheck, ArrowRightLeft, Plus, RefreshCw, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const WHOLE_BLOOD_DONOR_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export function ReservesView({
  hospitals = [],
  onOpenInterHospital,
  onOpenEmergencyRequest
}) {
  const [selectedType, setSelectedType] = useState('O-');
  const compatibleDonors = WHOLE_BLOOD_DONOR_COMPATIBILITY[selectedType] || [];

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ea4335]" />
            <h2 className="text-xl font-bold text-[#202124] tracking-tight">Google Health • Regional Blood Reserves & Cross-Match Matrix</h2>
            <span className="text-[10px] font-bold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] px-2.5 py-0.5 rounded-full">
              LIVE INVENTORY
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1">
            Real-time blood group stock levels across 5 regional trauma centers and clinical cross-matching calculator
          </p>
        </div>

        <button
          onClick={onOpenInterHospital}
          className="flex items-center gap-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Launch Drone Transfer</span>
        </button>
      </div>

      {/* Google Clinical Transfusion Cross-Match Calculator */}
      <div className="bg-white p-6 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#fce8e6] flex items-center justify-center text-[#ea4335]">
              <Droplet className="w-4 h-4 fill-[#ea4335]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124]">Emergency Transfusion Cross-Match Calculator</h3>
              <p className="text-[11px] text-[#5f6368]">Select recipient blood type below to inspect compatible donor groups</p>
            </div>
          </div>
        </div>

        {/* Blood Group Selection Pills */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
          {BLOOD_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`py-2.5 rounded-2xl font-bold text-xs transition-all border ${
                selectedType === type
                  ? 'bg-[#ea4335] text-white border-[#d93025] shadow-sm font-bold scale-[1.03]'
                  : 'bg-[#f8fafd] text-[#5f6368] border-[#dadce0] hover:border-[#bdc1c6] hover:text-[#202124]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Compatibility Output Card */}
        <div className="bg-[#f8fafd] border border-[#dadce0] p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Selected Recipient</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-[#ea4335]">{selectedType}</span>
              {selectedType === 'AB+' && (
                <span className="text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2 py-0.5 rounded-full">
                  Universal Recipient
                </span>
              )}
              {selectedType === 'O-' && (
                <span className="text-[10px] font-bold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] px-2 py-0.5 rounded-full">
                  Universal Donor
                </span>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Clinically Compatible Donor Types</span>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {compatibleDonors.map(donorType => (
                <span
                  key={donorType}
                  className={`font-mono font-bold px-3 py-1 rounded-full text-xs border ${
                    donorType === 'O-'
                      ? 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf] shadow-sm'
                      : 'bg-white text-[#202124] border-[#dadce0]'
                  }`}
                >
                  {donorType} {donorType === 'O-' && '★ (Universal)'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Regional Trauma Centers Inventory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hospital className="w-5 h-5 text-[#1a73e8]" />
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
              5 Regional Hospital Blood Banks
            </h3>
          </div>
          <span className="text-[11px] text-[#5f6368]">Automated Inventory Sync</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hospitals.map(hosp => {
            const totalUnits = Object.values(hosp.inventory || {}).reduce((a, b) => a + b, 0);
            const isCritical = (hosp.inventory?.['O-'] || 0) < 2;

            return (
              <div
                key={hosp.id}
                className="bg-white border border-[#dadce0] p-5 rounded-3xl shadow-[0_1px_3px_rgba(60,64,67,0.08)] hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#202124] text-sm">{hosp.name}</h4>
                        <span className="text-[10px] font-mono bg-[#f1f3f4] text-[#5f6368] px-2 py-0.5 rounded-full">
                          {hosp.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5f6368] mt-0.5">{hosp.phone} • {hosp.helipad ? '🚁 Rooftop Helipad' : '🚑 Ambulance Bay'}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-[#202124] font-mono">{totalUnits} Units</span>
                      <span className="text-[10px] text-[#70757a] block">Total Reserve</span>
                    </div>
                  </div>

                  {isCritical && (
                    <div className="mb-3 bg-[#fce8e6] border border-[#fad2cf] p-2.5 rounded-2xl text-[11px] text-[#c5221f] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#ea4335]" />
                      <span>Critical O- Universal Donor shortage at this trauma station.</span>
                    </div>
                  )}

                  {/* Blood Units Matrix */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {BLOOD_TYPES.map(type => {
                      const count = hosp.inventory?.[type] || 0;
                      const isLow = count < 2;
                      return (
                        <div
                          key={type}
                          className={`p-2 rounded-2xl text-center border font-mono ${
                            isLow
                              ? 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f] font-bold'
                              : 'bg-[#f8fafd] border-[#dadce0] text-[#202124]'
                          }`}
                        >
                          <span className="text-[10px] text-[#70757a] block">{type}</span>
                          <span className="text-xs font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f1f3f4] flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenEmergencyRequest && onOpenEmergencyRequest()}
                    className="text-[#ea4335] hover:text-[#d93025] font-semibold flex items-center gap-1"
                  >
                    <span>Request Emergency Supply</span>
                  </button>

                  <button
                    onClick={() => onOpenInterHospital && onOpenInterHospital()}
                    className="text-[#1a73e8] hover:text-[#1557b0] font-semibold flex items-center gap-1"
                  >
                    <span>Balance Surplus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
