import { useCallback, useEffect, useState } from 'react';
import { generateItinerary } from '../services/geminiService';
import { uploadTravelBook } from '../services/firebaseSyncService';
import { tripPlanToTravelBook } from '../utils/tripPlanTransform';
import { GroundingChunk, SavedTrip, TripDetails, TripPlan } from '../types';

const STORAGE_KEY = 'journeyx_trips';
const JOURNEYXBOOK_APP_URL =
  import.meta.env.VITE_JOURNEYXBOOK_URL || 'https://journeyxbook.vercel.app';

export const useTripPlanner = () => {
  const [currentTripDetails, setCurrentTripDetails] = useState<TripDetails | null>(null);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);

  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [lastSyncedLink, setLastSyncedLink] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as SavedTrip[];
      setSavedTrips(parsed);
    } catch (err) {
      console.error('Failed to parse saved trips', err);
    }
  }, []);

  const persistTrips = useCallback((trips: SavedTrip[]) => {
    setSavedTrips(trips);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    }
  }, []);

  const runItineraryGeneration = useCallback(
    async (details: TripDetails, options?: { adjustments?: string }) => {
      const isAdjustment = Boolean(options?.adjustments);
      if (isAdjustment) {
        setAdjustmentLoading(true);
      } else {
        setLoading(true);
        setTripPlan(null);
        setGroundingChunks([]);
      }

      setError(null);
      setAdjustmentError(null);
      setIsCurrentSaved(false);
      setCurrentTripDetails(details);

      try {
        const response = await generateItinerary(details, options?.adjustments);
        setTripPlan(response.plan);
        setGroundingChunks(response.groundingChunks || []);
        if (isAdjustment) {
          setIsAdjustmentOpen(false);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '無法產生行程。請確認您的請求內容或稍後再試。';
        setError(message);
        if (isAdjustment) {
          setAdjustmentError(message);
        }
        throw err;
      } finally {
        if (isAdjustment) {
          setAdjustmentLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  const submitTrip = useCallback(
    async (details: TripDetails) => {
      try {
        await runItineraryGeneration(details);
      } catch {
        // Error state already handled inside runItineraryGeneration
      }
    },
    [runItineraryGeneration]
  );

  const saveTrip = useCallback(() => {
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

    persistTrips([newTrip, ...savedTrips]);
    setIsCurrentSaved(true);
  }, [currentTripDetails, groundingChunks, persistTrips, savedTrips, tripPlan]);

  const deleteTrip = useCallback(
    (id: string) => {
      const filtered = savedTrips.filter(trip => trip.id !== id);
      persistTrips(filtered);
    },
    [persistTrips, savedTrips]
  );

  const selectTrip = useCallback((trip: SavedTrip) => {
    setCurrentTripDetails(trip.details);
    setTripPlan(trip.response.plan);
    setGroundingChunks(trip.response.groundingChunks || []);
    setIsHistoryOpen(false);
    setIsCurrentSaved(true);
  }, []);

  const resetTrip = useCallback(() => {
    setTripPlan(null);
    setGroundingChunks([]);
    setError(null);
    setCurrentTripDetails(null);
    setIsCurrentSaved(false);
  }, []);

  const adjustTripPlan = useCallback(
    async (feedback: string) => {
      if (!currentTripDetails) {
        setAdjustmentError('找不到原始旅遊資訊，請重新產生行程。');
        return;
      }
      try {
        await runItineraryGeneration(currentTripDetails, { adjustments: feedback });
      } catch {
        // Error state handled internally
      }
    },
    [currentTripDetails, runItineraryGeneration]
  );

  const openAdjustmentDialog = useCallback(() => {
    setAdjustmentError(null);
    setIsAdjustmentOpen(true);
  }, []);

  const openSyncDialog = useCallback(() => {
    setSyncError(null);
    setSyncSuccessMessage(null);
    setIsSyncDialogOpen(true);
  }, []);

  const closeSyncDialog = useCallback(() => {
    setIsSyncDialogOpen(false);
  }, []);

  const syncTripPlanToBook = useCallback(
    async ({ username, bookTitle }: { username: string; bookTitle: string }) => {
      if (!tripPlan || !currentTripDetails) {
        setSyncError('目前沒有可同步的行程，請先產生新的旅遊計畫。');
        return;
      }
      setSyncLoading(true);
      setSyncError(null);
      setSyncSuccessMessage(null);
      try {
        const itinerary = tripPlanToTravelBook(tripPlan);
        const result = await uploadTravelBook({
          username,
          bookTitle,
          itinerary,
          plan: tripPlan,
          details: currentTripDetails
        });
        const link = `${JOURNEYXBOOK_APP_URL}?user=${encodeURIComponent(
          username
        )}&file=${encodeURIComponent(result.fileId)}`;
        setLastSyncedLink(link);
        setSyncSuccessMessage(`成功同步！您的行程 ID 為：${result.fileId}`);

        // Auto open the book site
        setTimeout(() => {
          window.open(link, '_blank', 'noopener');
        }, 1500);

      } catch (err: any) {
        console.error('Sync error details:', err);
        let message = '同步失敗，請稍後再試。';

        if (err instanceof Error) {
          message = err.message;
          // Add specific hints for common errors
          if (message.includes('permission-denied')) {
            message = '權限不足：請檢查 Firebase 安全規則 (Firestore Rules)。';
          } else if (message.includes('unavailable') || message.includes('network')) {
            message = '網路連線問題：無法連接到 Firebase。';
          } else if (message.includes('API Key')) {
            message = '配置錯誤：Firebase API Key 無效或遺失。';
          }
        }

        setSyncError(message);
      } finally {
        setSyncLoading(false);
      }
    },
    [tripPlan, currentTripDetails]
  );

  const openLastSyncedBook = useCallback(() => {
    if (lastSyncedLink) {
      window.open(lastSyncedLink, '_blank', 'noopener');
    }
  }, [lastSyncedLink]);

  const loadTestPlan = useCallback(() => {
    const mockDetails: TripDetails = {
      destination: '日本京都',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      members: '2位成人',
      mustVisit: '清水寺、嵐山、金閣寺',
      accommodation: '京都車站附近飯店',
      preferences: '喜歡歷史文化，步調輕鬆'
    };

    const mockPlan: TripPlan = {
      tripTitle: '京都古都巡禮五日遊',
      destination: '日本京都',
      duration: '5天4夜',
      totalBudgetEstimate: '約 50,000 TWD (不含機票)',
      visualVibe: 'historical',
      generalTips: [
        '京都市區巴士一日券非常划算，建議購買。',
        '參觀寺廟請保持安靜，部分區域禁止攝影。',
        '早起可以避開熱門景點的人潮。'
      ],
      days: [
        {
          day: 1,
          date: '2024-04-01',
          theme: '抵達與車站周邊探索',
          summary: '抵達京都，入住飯店，探索京都車站周邊現代與傳統的融合。',
          activities: [
            {
              time: '14:00',
              title: '抵達京都車站',
              description: '搭乘 Haruka 特急抵達京都車站，欣賞現代化建築設計。',
              type: 'transport',
              location: { lat: 34.9858, lng: 135.7588, name: '京都車站' }
            },
            {
              time: '15:30',
              title: '飯店 Check-in',
              description: '前往飯店辦理入住手續，放置行李。',
              type: 'rest',
              location: { lat: 34.9858, lng: 135.7588, name: '京都車站附近飯店' }
            },
            {
              time: '17:00',
              title: '京都塔展望台',
              description: '登上京都塔俯瞰京都市景，欣賞夕陽。',
              type: 'sightseeing',
              location: { lat: 34.9875, lng: 135.7594, name: '京都塔' }
            },
            {
              time: '19:00',
              title: '拉麵小路晚餐',
              description: '在京都車站拉麵小路品嚐來自日本各地的拉麵。',
              type: 'food',
              location: { lat: 34.9858, lng: 135.7588, name: '京都拉麵小路' }
            }
          ]
        },
        {
          day: 2,
          date: '2024-04-02',
          theme: '清水寺與祇園風情',
          summary: '探訪世界遺產清水寺，漫步二年坂、三年坂，感受祇園古街氛圍。',
          activities: [
            {
              time: '09:00',
              title: '清水寺參拜',
              description: '參觀著名的清水舞台，祈求良緣與健康。',
              type: 'sightseeing',
              location: { lat: 34.9949, lng: 135.7850, name: '清水寺' }
            },
            {
              time: '11:30',
              title: '二三年坂散策',
              description: '漫步於古色古香的街道，選購傳統工藝品與伴手禮。',
              type: 'shopping',
              location: { lat: 34.9965, lng: 135.7820, name: '三年坂' }
            },
            {
              time: '13:00',
              title: '湯豆腐午餐',
              description: '品嚐京都著名的湯豆腐料理，享受清淡優雅的風味。',
              type: 'food',
              location: { lat: 34.9910, lng: 135.7790, name: '奧丹清水' }
            },
            {
              time: '15:00',
              title: '八坂神社',
              description: '參訪祇園的守護神社，感受熱鬧的氣氛。',
              type: 'sightseeing',
              location: { lat: 35.0037, lng: 135.7785, name: '八坂神社' }
            },
            {
              time: '17:00',
              title: '花見小路',
              description: '運氣好的話可以看到藝妓穿梭於茶屋之間。',
              type: 'sightseeing',
              location: { lat: 35.0010, lng: 135.7750, name: '花見小路' }
            }
          ]
        },
        {
          day: 3,
          date: '2024-04-03',
          theme: '嵐山竹林與小火車',
          summary: '前往嵐山地區，搭乘嵯峨野小火車，漫步竹林之道。',
          activities: [
            {
              time: '09:00',
              title: '嵯峨野小火車',
              description: '搭乘復古小火車欣賞保津川峽谷美景。',
              type: 'sightseeing',
              location: { lat: 35.0170, lng: 135.6810, name: '嵯峨野小火車' }
            },
            {
              time: '10:30',
              title: '嵐山竹林之道',
              description: '漫步於高聳的竹林中，聆聽風吹過竹葉的聲音。',
              type: 'sightseeing',
              location: { lat: 35.0170, lng: 135.6730, name: '竹林之道' }
            },
            {
              time: '12:00',
              title: '野宮神社',
              description: '祈求學業進步與良緣的古老神社。',
              type: 'sightseeing',
              location: { lat: 35.0178, lng: 135.6745, name: '野宮神社' }
            },
            {
              time: '13:30',
              title: '渡月橋與嵐山大街',
              description: '欣賞渡月橋美景，品嚐嵐山大街的抹茶甜點。',
              type: 'food',
              location: { lat: 35.0130, lng: 135.6770, name: '渡月橋' }
            }
          ]
        }
      ]
    };

    setCurrentTripDetails(mockDetails);
    setTripPlan(mockPlan);
    setGroundingChunks([]);
    setError(null);
    setIsCurrentSaved(false);
  }, []);

  return {
    currentTripDetails,
    tripPlan,
    groundingChunks,
    loading,
    adjustmentLoading,
    error,
    adjustmentError,
    savedTrips,
    isHistoryOpen,
    isCurrentSaved,
    isAdjustmentOpen,
    isSyncDialogOpen,
    submitTrip,
    saveTrip,
    deleteTrip,
    selectTrip,
    resetTrip,
    openHistory: () => setIsHistoryOpen(true),
    closeHistory: () => setIsHistoryOpen(false),
    openAdjustmentDialog,
    closeAdjustmentDialog: () => setIsAdjustmentOpen(false),
    adjustTripPlan,
    openSyncDialog,
    closeSyncDialog,
    syncTripPlanToBook,
    syncError,
    syncSuccessMessage,
    syncLoading,
    lastSyncedLink,
    openLastSyncedBook,
    loadTestPlan // Export the new function
  };
};

