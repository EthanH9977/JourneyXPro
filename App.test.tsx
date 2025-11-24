import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { generateItinerary } from './services/geminiService';
import { TripPlan } from './types';

vi.mock('./services/geminiService', () => ({
  generateItinerary: vi.fn()
}));

const buildMockPlan = (): TripPlan => ({
  tripTitle: '京都深度 3 日遊',
  destination: '京都',
  duration: '3天2夜',
  totalBudgetEstimate: '每人 20,000 TWD',
  visualVibe: 'historical',
  generalTips: ['早起避開人潮'],
  days: [
    {
      day: 1,
      date: '2025-01-01',
      theme: '古都巡禮',
      summary: '探索京都東山區',
      activities: [
        {
          time: '09:00',
          title: '清水寺',
          description: '拜訪世界文化遺產，俯瞰京都市景。',
          type: 'sightseeing',
          transportDetail: '從住宿搭乘公車 100 號',
          cost: '¥1,000/人',
          localTip: '建議開門前到達以避開人潮',
          duration: '2 小時',
          bookingRequired: false,
          rainPlan: '改至三十三間堂（室內）',
          location: {
            lat: 34.9949,
            lng: 135.7850,
            name: '清水寺',
            address: '京都府京都市東山區'
          }
        }
      ]
    }
  ]
});

describe('App', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  const fillForm = async () => {
    await user.type(screen.getByPlaceholderText('例如：日本京都'), '日本京都');
    await user.type(screen.getByLabelText('出發日期'), '2025-01-01');
    await user.type(screen.getByLabelText('結束日期'), '2025-01-03');
    await user.type(screen.getByPlaceholderText('例如：2位成人，1位小孩(5歲)'), '2 位成人');
    await user.type(screen.getByLabelText('住宿地點'), '京都車站附近');
    await user.type(screen.getByLabelText('必去清單'), '清水寺');
    await user.type(screen.getByLabelText('偏好與預算'), '步調輕鬆');
  };

  it('renders itinerary after submitting valid details', async () => {
    (generateItinerary as unknown as Mock).mockResolvedValue({
      plan: buildMockPlan(),
      groundingChunks: []
    });

    render(<App />);

    await fillForm();

    await user.click(screen.getByRole('button', { name: '開始規劃' }));

    expect(await screen.findByText('京都深度 3 日遊')).toBeInTheDocument();
  });

  it('shows error message when itinerary generation fails', async () => {
    (generateItinerary as unknown as Mock).mockRejectedValue(
      new Error('行程資料格式驗證失敗')
    );

    render(<App />);

    await fillForm();
    await user.click(screen.getByRole('button', { name: '開始規劃' }));

    await waitFor(() =>
      expect(screen.getByText(/行程資料格式驗證失敗/)).toBeInTheDocument()
    );
  });
});

