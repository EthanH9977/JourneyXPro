import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { TravelBookDay, TripPlan, TripDetails } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug logging
console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

if (!firebaseConfig.apiKey) {
  console.error('Firebase API Key is missing! Check VITE_FIREBASE_API_KEY.');
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const sanitizeId = (text: string) => {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `journey-book-${Date.now()}`;
};

interface SyncPayload {
  username: string;
  bookTitle: string;
  itinerary: TravelBookDay[];
  plan: TripPlan;
  details?: TripDetails | null;
}

const sanitizeData = (data: any): any => {
  if (data === undefined) return null;
  if (data === null) return null;
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = sanitizeData(data[key]);
      }
    }
    return result;
  }
  return data;
};

export const uploadTravelBook = async ({ username, bookTitle, itinerary, plan, details }: SyncPayload) => {
  const trimmedUser = username.trim();
  if (!trimmedUser) {
    throw new Error('請輸入使用者名稱');
  }

  const finalTitle = bookTitle.trim() || plan.tripTitle || '未命名旅遊書';
  const fileId = sanitizeId(finalTitle);

  const docRef = doc(db, 'users', trimmedUser, 'itineraries', fileId);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('同步請求逾時，請檢查網路連線')), 30000)
  );

  // Sanitize all data before sending to Firestore
  // Firestore does not support 'undefined', so we convert them to null
  const safeItinerary = sanitizeData(itinerary);
  const safeMetadata = sanitizeData({
    title: finalTitle,
    destination: plan.destination,
    duration: plan.duration,
    totalBudgetEstimate: plan.totalBudgetEstimate,
    members: details?.members,
    preferences: details?.preferences,
    syncedFrom: 'JourneyXPro',
    tripTitle: plan.tripTitle
  });

  await Promise.race([
    setDoc(docRef, {
      data: safeItinerary,
      metadata: safeMetadata,
      updatedAt: new Date().toISOString()
    }),
    timeoutPromise
  ]);

  return {
    fileId,
    fileName: finalTitle
  };
};

