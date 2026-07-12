export const PARTNER_CHANNEL_OPTIONS = ['블로그', '웹사이트', '카페', '직접입력'] as const;

export function resolvePartnerChannel(preset: string, custom: string): string {
  if (preset === '직접입력') {
    return custom.trim();
  }

  return preset.trim();
}

type PartnerLinkCreateFieldsProps = {
  channelPreset: string;
  channelCustom: string;
  linkName: string;
  onChannelPresetChange: (value: string) => void;
  onChannelCustomChange: (value: string) => void;
  onLinkNameChange: (value: string) => void;
};

export function PartnerLinkCreateFields({
  channelPreset,
  channelCustom,
  linkName,
  onChannelPresetChange,
  onChannelCustomChange,
  onLinkNameChange,
}: PartnerLinkCreateFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          채널명 <span className="text-slate-400 font-normal">(선택)</span>
        </label>
        <select
          value={channelPreset}
          onChange={(e) => onChannelPresetChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          <option value="">선택 안 함</option>
          {PARTNER_CHANNEL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {channelPreset === '직접입력' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">직접 입력</label>
          <input
            type="text"
            value={channelCustom}
            onChange={(e) => onChannelCustomChange(e.target.value)}
            placeholder="채널명을 입력하세요"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          링크이름 <span className="text-slate-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          value={linkName}
          onChange={(e) => onLinkNameChange(e.target.value)}
          placeholder="예) 메인블로그"
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>
    </>
  );
}
