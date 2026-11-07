import React, { useState, useEffect } from 'react';
import { Sliders, Edit3, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface PrioritiesPanelProps {
  priorities: string;
  isSaving: boolean;
  onSavePriorities: (newPriorities: string) => Promise<void>;
}

export const PrioritiesPanel: React.FC<PrioritiesPanelProps> = ({
  priorities,
  isSaving,
  onSavePriorities,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftPriorities, setDraftPriorities] = useState(priorities);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync draft when incoming priorities update (unless currently editing)
  useEffect(() => {
    if (!isEditing) {
      setDraftPriorities(priorities);
    }
  }, [priorities, isEditing]);

  const handleStartEdit = () => {
    setDraftPriorities(priorities);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftPriorities(priorities);
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draftPriorities.trim()) {
      setErrorMessage('Priorities cannot be completely empty.');
      return;
    }

    try {
      setErrorMessage(null);
      await onSavePriorities(draftPriorities.trim());
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: unknown) {
      console.error('Failed to save priorities:', err);
      setErrorMessage('Failed to save priorities to Firestore. Please check your connection.');
    }
  };

  // Helper to parse priorities into display items
  const parsePriorityLines = (rawText: string) => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const items: { number: number; title: string; desc: string }[] = [];
    let biasProfile = '';

    let counter = 1;
    for (const line of lines) {
      if (line.toLowerCase().startsWith('bias profile:') || line.toLowerCase().startsWith('bias:')) {
        biasProfile = line;
        continue;
      }

      // Check if numbered: "1. Title: Description" or "1. Title - Description" or "Title: Description"
      const cleaned = line.replace(/^\d+[\.\)]\s*/, '');
      const colonIdx = cleaned.indexOf(':');
      const dashIdx = cleaned.indexOf(' - ');

      if (colonIdx > 0 && (dashIdx === -1 || colonIdx < dashIdx)) {
        items.push({
          number: counter++,
          title: cleaned.substring(0, colonIdx).trim(),
          desc: cleaned.substring(colonIdx + 1).trim(),
        });
      } else if (dashIdx > 0) {
        items.push({
          number: counter++,
          title: cleaned.substring(0, dashIdx).trim(),
          desc: cleaned.substring(dashIdx + 3).trim(),
        });
      } else {
        items.push({
          number: counter++,
          title: cleaned,
          desc: '',
        });
      }
    }

    return { items, biasProfile };
  };

  const { items, biasProfile } = parsePriorityLines(priorities);

  return (
    <aside className="w-full lg:w-[27%] max-w-md h-full bg-slate-50/70 border-l border-slate-200/80 flex flex-col p-6 overflow-y-auto">
      {/* Header: "My Priorities" */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            My Priorities
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Active weighting matrix & boundary rules
          </p>
        </div>
        <span className="inline-flex items-center justify-center p-1.5 text-slate-400 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <Sliders className="w-4 h-4 text-slate-500" />
        </span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-4 transition-all">
        {/* Card Sub-Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Decision Criteria
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            {saveSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            ) : (
              'v1.4 updated'
            )}
          </span>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Read-Only View */}
        {!isEditing ? (
          <div className="space-y-3">
            <div className="text-sm text-slate-700 leading-relaxed space-y-2.5">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.number}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 transition-colors hover:bg-slate-100/60"
                  >
                    <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {item.number}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 text-xs leading-snug">
                        {item.title}
                      </p>
                      {item.desc && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic p-3 text-center">
                  No criteria set yet. Click Edit Priorities below to establish your decision rules.
                </p>
              )}
            </div>

            {biasProfile ? (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block font-mono">
                  {biasProfile}
                </span>
              </div>
            ) : (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block font-mono">
                  Bias profile: Risk-neutral, Evidence-weighted
                </span>
              </div>
            )}

            {/* Edit Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleStartEdit}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all active:scale-98 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Priorities</span>
              </button>
            </div>
          </div>
        ) : (
          /* Editable Textarea View */
          <div className="flex flex-col gap-3">
            <label htmlFor="prioritiesText" className="text-xs font-medium text-slate-600">
              Edit your rational guidelines:
            </label>
            <textarea
              id="prioritiesText"
              rows={9}
              value={draftPriorities}
              onChange={(e) => setDraftPriorities(e.target.value)}
              disabled={isSaving}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none text-slate-800 leading-relaxed resize-none transition-all disabled:opacity-60"
              placeholder="1. Long-term Autonomy & Leverage: Maximize ownership of time...&#10;2. Financial Runway & Downside: Maintain 12+ months liquidity reserve...&#10;Bias profile: Risk-neutral, Evidence-weighted"
            />

            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Priorities</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Guidance / Status Note Card */}
      <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-200 bg-white/50 text-xs text-slate-500 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The reasoning system calculates expected utility by cross-referencing these priorities against known decision pitfalls (status quo bias, sunk cost fallacy).
        </p>
      </div>
    </aside>
  );
};
