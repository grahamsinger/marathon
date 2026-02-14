import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RaceCountdown } from './RaceCountdown';
import { FeedbackModal } from '../feedback/FeedbackModal';

export function Header() {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );

  const handleCopyIcal = () => {
    const url = `${window.location.origin}/api/ical/feed`;
    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(onSuccess).catch(() => {
        fallbackCopy(url, onSuccess);
      });
    } else {
      fallbackCopy(url, onSuccess);
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    onSuccess();
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 shrink-0">
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Marathon Training</h1>
            <nav className="flex gap-1">
              {navLink('/', 'Calendar')}
              {navLink('/templates', 'Templates')}
              {navLink('/pace', 'Pace Trend')}
              {navLink('/summary', 'Summary')}
            </nav>
            <button
              onClick={handleCopyIcal}
              className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'iCal Link'}
            </button>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <RaceCountdown />
            <FeedbackModal />
          </div>
        </div>
      </div>
    </header>
  );
}
