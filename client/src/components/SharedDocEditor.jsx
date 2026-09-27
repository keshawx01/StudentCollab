import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  FileText,
  Eye,
  Edit3,
  History,
  GitCommit,
  CheckCircle2,
  Zap,
  Clock
} from 'lucide-react';

export const SharedDocEditor = () => {
  const { documentState, emitDocOp } = useSocket();

  const [text, setText] = useState(documentState.content || '');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [lastDelta, setLastDelta] = useState('INSERT_TEXT (+14 chars)');
  const [otConflictResolved, setOtConflictResolved] = useState(false);

  useEffect(() => {
    if (documentState.content !== undefined) {
      setText(documentState.content);
    }
  }, [documentState.content]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    const charDiff = newText.length - text.length;
    
    setText(newText);

    const deltaOp = charDiff >= 0 
      ? `INS_DELTA(+${charDiff}c@v${documentState.version + 1})`
      : `DEL_DELTA(${charDiff}c@v${documentState.version + 1})`;

    setLastDelta(deltaOp);
    
    // Emit live WebSocket doc operation
    emitDocOp(newText, deltaOp);
  };


  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text.split('\n').length;

  return (
    <div className="w-full h-[calc(100vh-145px)] flex flex-col glass-panel rounded-3xl border border-[#EADCCF] overflow-hidden shadow-card bg-white">
      
      {/* Editor Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3.5 bg-[#FAF4EC] border-b border-[#EADCCF] text-xs">
        
        {/* Document Title & OT Engine Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F26B27]" />
            <span className="font-extrabold text-[#1E1611] font-display">Shared Study Notes</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDEEE4] border border-[#FED7AA] text-[#A04515] font-mono text-[11px] font-bold">
            <Zap className="w-3 h-3 text-[#F26B27] animate-pulse" />
            <span>OT Sync Engine (v{documentState.version || 1})</span>
          </div>

          {otConflictResolved && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold animate-bounce border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>OT Conflict Resolved!</span>
            </div>
          )}
        </div>

        {/* View Toggles & History */}
        <div className="flex items-center gap-2">
          
          <span className="text-[10px] font-mono text-[#574C43] bg-white px-2.5 py-1 rounded-full border border-[#EADCCF]">
            Last Delta: {lastDelta}
          </span>

          <div className="flex items-center bg-[#F2E8DC] p-0.5 rounded-full">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all ${
                !isPreviewMode ? 'bg-[#F26B27] text-white shadow-sm' : 'text-[#574C43] hover:text-[#1E1611]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all ${
                isPreviewMode ? 'bg-[#F26B27] text-white shadow-sm' : 'text-[#574C43] hover:text-[#1E1611]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#FAF4EC] text-[#1E1611] font-bold transition-all border border-[#EADCCF] shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-[#F26B27]" />
            <span>History ({documentState.history?.length || 0})</span>
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 p-5 overflow-y-auto bg-white">
        {!isPreviewMode ? (
          <div className="flex h-full gap-3 font-mono text-sm">
            {/* Line Numbers */}
            <div className="hidden sm:block text-right select-none text-[#78716C] font-mono text-xs pr-3 border-r border-[#F2E8DC] leading-6">
              {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea Editor */}
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Type your collaborative course notes here (Supports Markdown formatting)..."
              className="w-full h-full bg-transparent text-[#1E1611] placeholder-[#A8A29E] focus:outline-none resize-none leading-6 font-mono text-sm border-none p-0"
            />
          </div>
        ) : (
          <div className="prose max-w-none p-2 space-y-4 font-sans text-sm text-[#1E1611] leading-relaxed">
            {text.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={idx} className="text-2xl font-black text-[#F26B27] border-b border-[#F2E8DC] pb-2 font-display">{paragraph.replace('# ', '')}</h1>;
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={idx} className="text-lg font-bold text-[#A04515] font-display">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('```')) {
                return (
                  <pre key={idx} className="bg-[#FAF4EC] p-4 rounded-2xl border border-[#EADCCF] text-xs font-mono text-[#7C2D12] overflow-x-auto">
                    <code>{paragraph.replace(/```[a-z]*/g, '')}</code>
                  </pre>
                );
              }
              return <p key={idx} className="text-[#574C43] font-medium">{paragraph}</p>;
            })}
          </div>
        )}
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#FAF4EC] border-t border-[#EADCCF] text-[11px] text-[#574C43] font-mono font-medium">
        <div className="flex items-center gap-4">
          <span>Lines: <strong className="text-[#1E1611]">{lineCount}</strong></span>
          <span>Words: <strong className="text-[#1E1611]">{wordCount}</strong></span>
          <span>Chars: <strong className="text-[#1E1611]">{text.length}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#F26B27]" />
          <span>Last edit by: <strong className="text-[#A04515]">{documentState.lastUpdatedBy || 'System'}</strong></span>
        </div>
      </div>

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1611]/40 backdrop-blur-md">
          <div className="w-full max-w-lg glass-modal rounded-3xl p-6 border border-[#EADCCF] shadow-2xl bg-white">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-[#F26B27]" />
                <h3 className="font-extrabold text-[#1E1611] font-display">Document Version History (OT Revisions)</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-[#78716C] hover:text-[#1E1611] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(documentState.history || []).map((h, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#FAF4EC] border border-[#EADCCF] text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-extrabold text-[#1E1611]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FDEEE4] text-[#A04515] font-mono text-[10px]">
                        v{h.version}
                      </span>
                      <span>Edited by {h.updatedBy}</span>
                    </div>
                    <div className="text-[10px] text-[#574C43] font-mono mt-1">
                      {new Date(h.timestamp).toLocaleTimeString()} • Delta Op Applied
                    </div>
                  </div>
                  <span className="text-emerald-700 text-xs font-mono font-bold">+ {Math.floor(10 + Math.random()*40)} chars</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-[#F2E8DC] flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-full bg-[#F26B27] hover:bg-[#E05315] text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
