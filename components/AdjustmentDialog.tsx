import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, SlidersHorizontal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => Promise<void> | void;
  isSubmitting: boolean;
  error?: string | null;
}

const AdjustmentDialog: React.FC<Props> = ({ isOpen, onClose, onSubmit, isSubmitting, error }) => {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFeedback('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    await onSubmit(feedback.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6 animate-fade-in-up">
        <header className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">微調行程建議</h2>
            <p className="text-sm text-slate-500">描述不適合的地方或想加入的新需求，我們會重新優化行程。</p>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400"
            placeholder="例如：餐廳太昂貴、想加上親子活動、請減少徒步距離等"
            disabled={isSubmitting}
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!feedback.trim() || isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  優化中...
                </>
              ) : (
                '重新規劃'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustmentDialog;

