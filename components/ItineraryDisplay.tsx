
import React, { useState } from 'react';
import { TripPlan, GroundingChunk, GeoLocation, VisualVibe } from '../types';
import MapDisplay from './MapDisplay';
import { 
  ExternalLink, CheckCircle, RefreshCw, Info, 
  Map as MapIcon, FileText, Save, Download, Calendar, 
  MapPin, Coffee, Train, DollarSign, Lightbulb, 
  Umbrella, Navigation, Utensils, ShoppingBag, Camera, Leaf, Landmark, Building2, Palmtree,
  Waves, Mountain, Sparkles, SlidersHorizontal, Share2
} from 'lucide-react';

interface Props {
  plan: TripPlan;
  groundingChunks?: GroundingChunk[];
  onReset: () => void;
  onSave: () => void;
  isSaved?: boolean;
  onAdjust?: () => void;
  isAdjusting?: boolean;
  onSync?: () => void;
  isSyncingToBook?: boolean;
}

// SVG Patterns (Base64 encoded for portability)
const patterns = {
  seigaiha: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10c0-5.523 4.477-10 10-10s10 4.477 10 10H0zm10 0c0-5.523 4.477-10 10-10s10 4.477 10 10H10z' fill='%23d97706' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234f46e5' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
  topography: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 21c-2.206 0-4.223.75-5.917 2H24v-2zm-9.006 2c-1.332-1.39-2.924-2.483-4.706-3.128-2.607-.944-5.06-.598-7.288.583V23h12zm0-18c2.613-1.076 4.965-1.127 7.006-.27v-2c-2.613.91-5.32 1.156-8.118-.08-2.433-1.074-4.82-1.22-7.143-.53V5.55c1.885-.758 4.606-.826 8.255.45z' fill='%23059669' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  tropical: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%230891b2' fill-opacity='0.1'/%3E%3C/svg%3E")`
};

// Theme Configuration based on Vibe
const getTheme = (vibe: VisualVibe) => {
  switch (vibe) {
    case 'historical':
      return {
        id: 'historical',
        bg: 'bg-[#faf7f2]',
        bgImage: patterns.seigaiha,
        containerBorder: 'border-2 border-amber-800/20',
        headerGradient: 'from-[#8B4513] to-[#5D4037]', // SaddleBrown to Brown
        headerText: 'text-amber-900',
        accentText: 'text-amber-900',
        accentBg: 'bg-amber-100',
        cardBg: 'bg-[#fffefb]',
        cardBorder: 'border border-amber-200 shadow-sm',
        timeline: 'bg-amber-800/30',
        dot: 'bg-amber-800',
        icon: <Landmark className="w-5 h-5" />,
        font: 'font-serif', // Serif for history
        badge: 'bg-amber-800 text-amber-50',
        button: 'bg-[#8B4513] text-white hover:bg-[#6D360F]'
      };
    case 'nature':
      return {
        id: 'nature',
        bg: 'bg-[#f0fdf4]',
        bgImage: patterns.topography,
        containerBorder: 'border border-emerald-200',
        headerGradient: 'from-[#059669] to-[#047857]', // Emerald
        headerText: 'text-emerald-900',
        accentText: 'text-emerald-800',
        accentBg: 'bg-emerald-100',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        cardBorder: 'border border-emerald-100 shadow-sm rounded-2xl',
        timeline: 'bg-emerald-300',
        dot: 'bg-emerald-600',
        icon: <Leaf className="w-5 h-5" />,
        font: 'font-sans',
        badge: 'bg-emerald-600 text-white',
        button: 'bg-emerald-600 text-white hover:bg-emerald-700'
      };
    case 'tropical':
      return {
        id: 'tropical',
        bg: 'bg-[#ecfeff]',
        bgImage: patterns.tropical,
        containerBorder: 'border-none',
        headerGradient: 'from-[#0891b2] to-[#0284c7]', // Cyan to Sky
        headerText: 'text-cyan-900',
        accentText: 'text-cyan-800',
        accentBg: 'bg-cyan-100',
        cardBg: 'bg-white/90',
        cardBorder: 'border-0 shadow-lg shadow-cyan-900/5 rounded-3xl',
        timeline: 'bg-cyan-200',
        dot: 'bg-cyan-500',
        icon: <Palmtree className="w-5 h-5" />,
        font: 'font-sans',
        badge: 'bg-cyan-500 text-white',
        button: 'bg-cyan-500 text-white hover:bg-cyan-600'
      };
    case 'modern':
    default:
      return {
        id: 'modern',
        bg: 'bg-slate-50',
        bgImage: patterns.grid,
        containerBorder: 'border border-slate-200',
        headerGradient: 'from-[#4f46e5] to-[#7c3aed]', // Indigo to Violet
        headerText: 'text-slate-900',
        accentText: 'text-indigo-900',
        accentBg: 'bg-indigo-50',
        cardBg: 'bg-white',
        cardBorder: 'border border-slate-200 shadow-sm',
        timeline: 'bg-slate-300',
        dot: 'bg-indigo-600',
        icon: <Building2 className="w-5 h-5" />,
        font: 'font-sans',
        badge: 'bg-indigo-600 text-white',
        button: 'bg-indigo-600 text-white hover:bg-indigo-700'
      };
  }
};

const ItineraryDisplay: React.FC<Props> = ({
  plan,
  groundingChunks,
  onReset,
  onSave,
  isSaved,
  onAdjust,
  isAdjusting,
  onSync,
  isSyncingToBook
}) => {
  const [viewMode, setViewMode] = useState<'itinerary' | 'map'>('itinerary');
  const theme = getTheme(plan.visualVibe || 'modern');

  const allLocations: GeoLocation[] = plan.days.flatMap(day => 
    day.activities
      .filter(act => act.location)
      .map(act => ({
        ...act.location!,
        day: day.day,
        description: act.description
      }))
  );

  const handleExportPDF = () => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById('itinerary-content');
    
    // Add print specific class to body momentarily
    document.body.classList.add('printing-mode');

    const opt = {
      margin: [15, 10, 15, 10], // Increased top/bottom margin
      filename: `${plan.destination}_行程表.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        scrollY: 0,
        // Increase height slightly to avoid cutoffs
        windowHeight: element?.scrollHeight
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    
    // @ts-ignore
    if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save().then(() => {
           document.body.classList.remove('printing-mode');
        });
    } else {
        alert('PDF 套件尚未載入，請稍後再試。');
        document.body.classList.remove('printing-mode');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'transport': return <Train className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'rest': return <Coffee className="w-4 h-4" />;
      case 'sightseeing': return <Camera className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-20 ${theme.font}`}>
      
      {/* Header Actions */}
      <div className={`flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-5 rounded-2xl shadow-sm border ${theme.id === 'tropical' ? 'border-none' : 'border-slate-200'} gap-4 relative overflow-hidden`}>
         {/* Top Decoration Bar */}
         <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.headerGradient}`}></div>
         
        <div className="z-10">
           <h2 className="text-xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${theme.headerGradient}`}>
               {theme.icon}
            </span>
            {plan.tripTitle}
          </h2>
          <div className="flex items-center gap-3 mt-2 ml-14 text-sm font-medium text-slate-500">
             <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{plan.duration}</span>
             <span>•</span>
             <span>預算: {plan.totalBudgetEstimate}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full xl:w-auto ml-14 xl:ml-0 z-10">
            <div className="bg-slate-100 p-1 rounded-lg flex mr-2">
                <button
                    onClick={() => setViewMode('itinerary')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'itinerary' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText className="w-4 h-4" /> 行程
                </button>
                <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MapIcon className="w-4 h-4" /> 地圖
                </button>
            </div>

            <div className="flex gap-2 flex-grow sm:flex-grow-0">
                <button
                    onClick={onSave}
                    disabled={isSaved}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all shadow-sm ${
                        isSaved 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaved ? '已存' : '儲存'}
                </button>
                <button
                    onClick={handleExportPDF}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    PDF
                </button>
                {onSync && (
                  <button
                    onClick={onSync}
                    disabled={isSyncingToBook}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all shadow-sm disabled:opacity-70"
                  >
                    {isSyncingToBook ? (
                      <>
                        <Share2 className="w-4 h-4 animate-pulse" />
                        同步中
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        旅遊書
                      </>
                    )}
                  </button>
                )}
                {onAdjust && (
                  <button
                    onClick={onAdjust}
                    disabled={isAdjusting}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-all shadow-sm disabled:opacity-70"
                  >
                    {isAdjusting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        調整中
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="w-4 h-4" />
                        調整
                      </>
                    )}
                  </button>
                )}
                <button
                    onClick={onReset}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-all shadow-sm ${theme.button}`}
                >
                    <RefreshCw className="w-4 h-4" />
                    重來
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className={`rounded-3xl overflow-hidden min-h-[600px] ${theme.containerBorder} ${theme.bg} relative transition-colors duration-500 shadow-xl`}
        style={{ backgroundImage: theme.bgImage }}
      >
        
        {viewMode === 'map' ? (
            <div className="p-4 h-[700px] flex flex-col bg-white/50 backdrop-blur-md">
                <MapDisplay locations={allLocations} />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800 flex items-start gap-2">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>地圖標記為 AI 自動生成之建議位置。</p>
                </div>
            </div>
        ) : (
            <div id="itinerary-content" className="p-6 md:p-10 print:p-0 print:bg-white">
                
                {/* General Tips - "Sticky Note" Style */}
                <div className="mb-12 print:break-inside-avoid">
                     <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-10 text-yellow-600 transform rotate-12">
                            <Lightbulb size={100} />
                        </div>
                        <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2 relative z-10">
                            <Lightbulb className="w-5 h-5" /> 達人叮嚀 (Local Tips)
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {plan.generalTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
                                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-yellow-400 shrink-0"></span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Days Timeline */}
                <div className="space-y-16 print:space-y-8">
                    {plan.days.map((day, index) => (
                        <div key={index} className="relative pl-0 md:pl-8 print:pl-0 day-container">
                            
                            {/* Day Header */}
                            {/* Use 'page-break-after: avoid' to try keeping header with first item */}
                            <div className="flex items-center gap-5 mb-8 print:mb-4 day-header" style={{ pageBreakAfter: 'avoid' }}>
                                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shrink-0 text-white bg-gradient-to-br ${theme.headerGradient} print:shadow-none`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Day</span>
                                    <span className="text-2xl font-black leading-none">{day.day}</span>
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${theme.headerText}`}>{day.theme}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mt-1">
                                        <Calendar className="w-4 h-4" /> {day.date}
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{day.summary}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Activities List */}
                            <div className="space-y-6 relative print:space-y-4">
                                {/* Vertical Line (Hidden in print to avoid alignment issues) */}
                                <div className={`absolute left-4 md:left-[1.65rem] top-2 bottom-0 w-[2px] ${theme.timeline} md:block hidden print:hidden`}></div>

                                {day.activities.map((activity, actIdx) => (
                                    <div key={actIdx} className="relative flex flex-col md:flex-row gap-5 group activity-item" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                        
                                        {/* Time Marker */}
                                        <div className="md:w-24 shrink-0 flex md:flex-col items-center md:items-end pt-1 z-10 print:w-16 print:items-start">
                                            <span className="text-sm font-bold text-slate-500 font-mono tracking-tight">
                                                {activity.time}
                                            </span>
                                            {/* Dot */}
                                            <div className={`hidden md:block w-3.5 h-3.5 ${theme.dot} rounded-full border-[3px] border-white shadow-sm absolute right-[-2.3rem] top-2 z-10 print:hidden`}></div>
                                        </div>

                                        {/* Activity Card */}
                                        <div className={`flex-1 ${theme.cardBg} ${theme.cardBorder} p-5 hover:shadow-md transition-shadow relative overflow-hidden print:border print:border-slate-200 print:shadow-none print:bg-white`}>
                                            {/* Type Color Strip */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                                activity.type === 'food' ? 'bg-orange-400' : 
                                                activity.type === 'transport' ? 'bg-blue-400' : 
                                                activity.type === 'rest' ? 'bg-emerald-400' : 
                                                'bg-indigo-400'
                                            } print:w-1`}></div>

                                            <div className="flex justify-between items-start mb-3 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <h4 className={`font-bold text-lg ${theme.headerText}`}>{activity.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                        activity.type === 'food' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                                        activity.type === 'transport' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                                    } print:hidden`}>
                                                        {activity.type === 'food' ? '美食' : activity.type === 'transport' ? '交通' : activity.type === 'rest' ? '休息' : '景點'}
                                                    </span>
                                                </div>

                                                {activity.location && (
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${activity.location.lat},${activity.location.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} bg-white border border-slate-200 shadow-sm px-2 py-1 rounded-full hover:bg-slate-50 transition-colors print:hidden`}
                                                    >
                                                        <MapIcon className="w-3 h-3" /> MAP
                                                    </a>
                                                )}
                                            </div>

                                            <p className="text-slate-600 text-sm mb-4 pl-2 leading-relaxed">{activity.description}</p>

                                            {/* Info Chips */}
                                            <div className="flex flex-wrap gap-2 pl-2 mb-3">
                                                 {activity.transportDetail && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                                                        <Navigation className="w-3.5 h-3.5 text-slate-400" />
                                                        {activity.transportDetail}
                                                    </div>
                                                )}
                                                {activity.cost && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                                                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                                        {activity.cost}
                                                    </div>
                                                )}
                                                 {activity.rainPlan && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100">
                                                        <Umbrella className="w-3.5 h-3.5" />
                                                        雨備: {activity.rainPlan}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expert Tip Footer */}
                                            {activity.localTip && (
                                                <div className="pl-2 mt-3 pt-3 border-t border-slate-100/60 dashed">
                                                    <div className="flex gap-2 text-sm text-slate-600 italic">
                                                        <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${theme.accentText}`} />
                                                        <span className={theme.accentText}>{activity.localTip}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grounding Sources */}
                {groundingChunks && groundingChunks.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-slate-200 print:hidden">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">參考資料 (Google Search Grounding)</h3>
                        <div className="flex flex-wrap gap-2">
                            {groundingChunks.map((chunk, idx) => chunk.web?.uri && (
                                <a 
                                    key={idx}
                                    href={chunk.web.uri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 transition-all"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    {chunk.web.title || "來源連結"}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      <style>{`
        @media print {
            body {
                background: white;
            }
            /* Force breaks */
            .activity-item {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }
            .day-header {
                break-after: avoid !important;
                page-break-after: avoid !important;
            }
            .day-container {
                break-inside: auto; /* Allow breaking between activities */
            }
            /* Clean up UI for print */
            a[href]:after { content: none !important; }
            .print\\:hidden { display: none !important; }
            .print\\:bg-white { background-color: white !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border { border: 1px solid #e2e8f0 !important; }
        }
      `}</style>
    </div>
  );
};

export default ItineraryDisplay;
