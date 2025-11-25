import { useCallback, useEffect, useState } from 'react';
import { generateItinerary } from '../services/geminiService';
import { uploadTravelBook } from '../services/firebaseSyncService';
import { tripPlanToTravelBook } from '../utils/tripPlanTransform';
import { GroundingChunk, SavedTrip, TripDetails, TripPlan } from '../types';

const STORAGE_KEY = 'journeyx_trips';
const SHIKOKU_APP_URL =
  import.meta.env.VITE_SHIKOKU_URL || 'https://shikoku.vercel.app';

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
        const link = `${SHIKOKU_APP_URL}?user=${encodeURIComponent(
          username
        )}&file=${encodeURIComponent(result.fileId)}`;
        setLastSyncedLink(link);
        setSyncSuccessMessage(`已同步：${username}/${result.fileName}`);
        window.open(link, '_blank', 'noopener');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '同步失敗，請稍後再試。';
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
    openLastSyncedBook
  };
};

