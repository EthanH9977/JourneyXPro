
import React from 'react';
import { SavedTrip } from '../types';
import { Clock, MapPin, Trash2, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: SavedTrip[];
  onSelectTrip: (trip: SavedTrip) => void;
  onDeleteTrip: (id: string) => void;
}

const SavedItineraries: React.FC<Props> = ({ isOpen, onClose, savedTrips, onSelectTrip, onDeleteTrip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-md z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5" /> 歷史行程
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {savedTrips.length === 0 ? (
            <div className="text-center text-slate-400 py-20 flex flex-col items-center">
               <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p>尚未儲存任何行程</p>
            </div>
          ) : (
            savedTrips.map(trip => (
              <div 
                key={trip.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => onSelectTrip(trip)}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    {trip.response.plan?.tripTitle || trip.details.destination}
                  </h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteTrip(trip.id); }}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                   <Calendar className="w-3.5 h-3.5" />
                  {trip.details.startDate} - {trip.details.endDate}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                   <span>{new Date(trip.timestamp).toLocaleDateString()} 建立</span>
                   <span className="flex items-center text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                     查看行程 <ChevronRight className="w-3 h-3 ml-1" />
                   </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedItineraries;
