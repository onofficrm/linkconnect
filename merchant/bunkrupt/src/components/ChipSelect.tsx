type ChipOption = { value: string; label: string };

type ChipSelectProps = {
  label: string;
  options: readonly ChipOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
};

export default function ChipSelect({ label, options, value, onChange, error, required }: ChipSelectProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-bold text-gray-800">{label}</span>
        {required ? <span className="text-xs font-medium text-cta">필수</span> : null}
        {!required ? <span className="text-xs text-gray-400">선택</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? 'border-cta bg-cta text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-cta/40 hover:bg-blue-50/50'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
