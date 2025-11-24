
import React, { useState, useEffect } from 'react';
import JourneyForm from './components/JourneyForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import { TripDetails, GroundingChunk, TripPlan, SavedTrip } from './types';
import { generateItinerary } from './services/geminiService';
import { Plane, Map as MapIcon, Compass, History } from 'lucide-react';

const App: React.FC = () => {
  const [currentTripDetails, setCurrentTripDetails] = useState<TripDetails | null>(null);
  
  // Changed from string to TripPlan object
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('journeyx_trips');
    if (saved) {
      try {
        setSavedTrips(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved trips", e);
      }
    }
  }, []);

  const handleFormSubmit = async (details: TripDetails) => {
    setLoading(true);
    setError(null);
    setTripPlan(null);
    setIsCurrentSaved(false);
    setCurrentTripDetails(details);
    
    try {
      const response = await generateItinerary(details);
      setTripPlan(response.plan);
      setGroundingChunks(response.groundingChunks || []);
    } catch (err: any) {
      console.error(err);
      setError("無法產生行程。請確認您的請求內容或稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = () => {
    if (!tripPlan || !currentTripDetails) return;
    
    const newTrip: SavedTrip = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      details: currentTripDetails,
      response: {
        plan: tripPlan,
        groundingChunks
      }
    };

    const updatedTrips = [newTrip, ...savedTrips];
    setSavedTrips(updatedTrips);
    localStorage.setItem('journeyx_trips', JSON.stringify(updatedTrips));
    setIsCurrentSaved(true);
  };

  const handleDeleteTrip = (id: string) => {
    const updatedTrips = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updatedTrips);
    localStorage.setItem('journeyx_trips', JSON.stringify(updatedTrips));
  };

  const handleSelectSavedTrip = (trip: SavedTrip) => {
    setCurrentTripDetails(trip.details);
    setTripPlan(trip.response.plan);
    setGroundingChunks(trip.response.groundingChunks || []);
    setIsHistoryOpen(false);
    setIsCurrentSaved(true);
  };

  const handleReset = () => {
    setTripPlan(null);
    setGroundingChunks([]);
    setError(null);
    setCurrentTripDetails(null);
    setIsCurrentSaved(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">
                JourneyX Pro
              </span>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all"
               >
                 <History className="w-4 h-4" />
                 <span className="hidden sm:inline">歷史行程</span>
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* History Sidebar */}
      <SavedItineraries 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        savedTrips={savedTrips}
        onSelectTrip={handleSelectSavedTrip}
        onDeleteTrip={handleDeleteTrip}
      />

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 relative">
        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-fade-in">
            <div className="mt-0.5 font-bold">錯誤：</div>
            <div>{error}</div>
          </div>
        )}

        {!tripPlan ? (
           <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
              <div className="text-center mb-10 max-w-2xl px-4">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                    像在地人一樣旅行，<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">個人化你的專屬行程。</span>
                 </h1>
                 <p className="text-lg text-slate-600 leading-relaxed">
                    在下方輸入您的目的地和偏好。AI 將結合即時數據，為您打造經過驗證的超在地化行程。
                 </p>
              </div>
              
              <JourneyForm onSubmit={handleFormSubmit} isLoading={loading} />
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl text-center px-4">
                  <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MapIcon className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2">極致在地化</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">發掘在地秘境，避開觀光陷阱，推薦在地人喜愛的餐廳與景點。</p>
                  </div>
                   <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Compass className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2">交通精算</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">最佳化動線規劃，包含雨備方案、休息點建議與混合交通策略。</p>
                  </div>
                   <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Plane className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2">即時資訊</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">即時查詢天氣預報、票務狀況與營業時間，確保行程萬無一失。</p>
                  </div>
              </div>
           </div>
        ) : (
          <ItineraryDisplay 
            plan={tripPlan} 
            groundingChunks={groundingChunks}
            onReset={handleReset} 
            onSave={handleSaveTrip}
            isSaved={isCurrentSaved}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} JourneyX Pro. 由 Google Gemini 技術提供。</p>
      </footer>
    </div>
  );
};

export default App;
