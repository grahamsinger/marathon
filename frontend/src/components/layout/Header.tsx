import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RaceCountdown } from './RaceCountdown';

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
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-gray-900">Marathon Training</h1>
            <nav className="flex gap-1">
              {navLink('/', 'Calendar')}
              {navLink('/templates', 'Templates')}
              {navLink('/pace', 'Pace Trend')}
            </nav>
            <button
              onClick={handleCopyIcal}
              className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {copied ? 'Copied!' : 'iCal Link'}
            </button>
          </div>
          <RaceCountdown />
        </div>
      </div>
    </header>
  );
}
