import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { TravelBookDay, TripPlan, TripDetails } from '../types';

const firebaseConfig = {
  apiKey: 'AIzaSyCOa0FIsy4MGYmkqG3_cmTOeEqSJ5c6GMo',
  authDomain: 'journeyxbook.firebaseapp.com',
  projectId: 'journeyxbook',
  storageBucket: 'journeyxbook.firebasestorage.app',
  messagingSenderId: '701189543816',
  appId: '1:701189543816:web:7f498e501ebc7babc34c3d',
  measurementId: 'G-FVLH8RZWF8'
};

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

export const uploadTravelBook = async ({ username, bookTitle, itinerary, plan, details }: SyncPayload) => {
  const trimmedUser = username.trim();
  if (!trimmedUser) {
    throw new Error('請輸入使用者名稱');
  }

  const finalTitle = bookTitle.trim() || plan.tripTitle || '未命名旅遊書';
  const fileId = sanitizeId(finalTitle);

  const docRef = doc(db, 'users', trimmedUser, 'itineraries', fileId);

  await setDoc(docRef, {
    data: itinerary,
    metadata: {
      title: finalTitle,
      destination: plan.destination,
      duration: plan.duration,
      totalBudgetEstimate: plan.totalBudgetEstimate,
       members: details?.members,
       preferences: details?.preferences,
      syncedFrom: 'JourneyXPro',
      tripTitle: plan.tripTitle
    },
    updatedAt: new Date().toISOString()
  });

  return {
    fileId,
    fileName: finalTitle
  };
};

