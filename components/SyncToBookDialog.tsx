import React, { useEffect, useState } from 'react';
import { BookCopy, UserCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { username: string; bookTitle: string }) => Promise<void> | void;
  isSubmitting: boolean;
  error?: string | null;
  successMessage?: string | null;
  defaultBookTitle?: string;
  shikokuLink?: string | null;
  onOpenShikoku?: () => void;
}

const SyncToBookDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  successMessage,
  defaultBookTitle,
  shikokuLink,
  onOpenShikoku
}) => {
  const [username, setUsername] = useState('');
  const [bookTitle, setBookTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBookTitle(defaultBookTitle || '');
      setUsername('');
    }
  }, [isOpen, defaultBookTitle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ username, bookTitle });
  };

  const inputClasses =
    'w-full p-3 bg-white text-black placeholder-gray-500 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6 animate-fade-in-up">
        <header className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookCopy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">送到 Shikoku 旅遊書</h2>
            <p className="text-sm text-slate-500">輸入使用者名稱與旅遊書標題，即可同步到 Shikoku 雲端。</p>
          </div>
        </header>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="flex flex-col gap-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <span>{successMessage}</span>
            {shikokuLink && (
              <button
                type="button"
                onClick={onOpenShikoku}
                className="self-start px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                開啟旅遊書
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <UserCircle2 className="w-4 h-4 text-indigo-500" /> 使用者名稱
            </label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例如：ethan"
              className={inputClasses}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BookCopy className="w-4 h-4 text-indigo-500" /> 旅遊書標題
            </label>
            <input
              required
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="例如：京都慢旅手冊"
              className={inputClasses}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? '同步中...' : '送出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SyncToBookDialog;

