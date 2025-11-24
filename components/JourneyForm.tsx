import React, { useState } from 'react';
import { TripDetails } from '../types';
import { MapPin, Calendar, Users, Heart, Home, Settings, Search } from 'lucide-react';

interface Props {
  onSubmit: (details: TripDetails) => void;
  isLoading: boolean;
}

const JourneyForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TripDetails>({
    destination: '',
    startDate: '',
    endDate: '',
    members: '',
    mustVisit: '',
    accommodation: '',
    preferences: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full p-3 bg-white text-black placeholder-gray-500 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none";

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
           <MapPin className="w-6 h-6" /> 開始您的旅程
        </h2>
        <p className="text-indigo-100 mt-2">提供您的旅行詳情，JourneyX Pro 將為您量身打造完美行程。</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Destination & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-500" /> 目的地
            </label>
            <input
              required
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="例如：日本京都"
              aria-label="目的地"
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-500" /> 日期
            </label>
            <div className="flex gap-2">
                <input
                required
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                aria-label="出發日期"
                className={`${inputClasses} text-sm`}
                />
                <span className="self-center text-slate-400">-</span>
                <input
                required
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                aria-label="結束日期"
                className={`${inputClasses} text-sm`}
                />
            </div>
          </div>
        </div>

        {/* Members & Accommodation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="w-4 h-4 text-indigo-500" /> 旅客人數/成員
                </label>
                <input
                required
                name="members"
                value={formData.members}
                onChange={handleChange}
                placeholder="例如：2位成人，1位小孩(5歲)"
                aria-label="旅客人數/成員"
                className={inputClasses}
                />
            </div>
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Home className="w-4 h-4 text-indigo-500" /> 住宿地點
                </label>
                <input
                name="accommodation"
                value={formData.accommodation}
                onChange={handleChange}
                placeholder="例如：住在京都車站附近"
                aria-label="住宿地點"
                className={inputClasses}
                />
            </div>
        </div>

        {/* Must Visit */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Heart className="w-4 h-4 text-indigo-500" /> 必去清單
          </label>
          <textarea
            name="mustVisit"
            value={formData.mustVisit}
            onChange={handleChange}
            placeholder="例如：清水寺、嵐山竹林、正宗懷石料理"
            aria-label="必去清單"
            rows={3}
            className={`${inputClasses} resize-none`}
          />
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Settings className="w-4 h-4 text-indigo-500" /> 偏好與預算
          </label>
          <textarea
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            placeholder="例如：步調輕鬆，對歷史和攝影感興趣。預算：每人每天 3000 台幣。"
            aria-label="偏好與預算"
            rows={2}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 ${
            isLoading 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在規劃行程...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" /> 開始規劃
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default JourneyForm;