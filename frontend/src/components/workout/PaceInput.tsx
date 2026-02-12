import { useEffect, useState } from 'react';

interface Props {
  value: number | null;
  onChange: (seconds: number | null) => void;
  label: string;
}

export function PaceInput({ value, onChange, label }: Props) {
  const [min, setMin] = useState<string>(value ? String(Math.floor(value / 60)) : '');
  const [sec, setSec] = useState<string>(value ? String(value % 60).padStart(2, '0') : '');

  useEffect(() => {
    if (value === null) {
      setMin('');
      setSec('');
    } else {
      setMin(String(Math.floor(value / 60)));
      setSec(String(value % 60).padStart(2, '0'));
    }
  }, [value]);

  const handleChange = (newMin: string, newSec: string) => {
    const m = parseInt(newMin);
    const s = parseInt(newSec);
    if (!isNaN(m) && !isNaN(s) && s >= 0 && s < 60) {
      onChange(m * 60 + s);
    } else if (newMin === '' && newSec === '') {
      onChange(null);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={20}
          value={min}
          onChange={(e) => {
            setMin(e.target.value);
            handleChange(e.target.value, sec);
          }}
          className="w-14 px-2 py-1.5 border rounded text-sm text-center"
          placeholder="MM"
        />
        <span className="text-gray-400">:</span>
        <input
          type="number"
          min={0}
          max={59}
          value={sec}
          onChange={(e) => {
            setSec(e.target.value);
            handleChange(min, e.target.value);
          }}
          className="w-14 px-2 py-1.5 border rounded text-sm text-center"
          placeholder="SS"
        />
        <span className="text-xs text-gray-400">/mi</span>
      </div>
    </div>
  );
}
