import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  HelpCircle,
  ThumbsUp,
  PlusCircle,
  Code,
  Play,
  Send
} from 'lucide-react';

export const DoubtBoard = () => {
  const { doubts, emitDoubtAdd, emitDoubtUpvote, emitDoubtResolve, emitDoubtReply } = useSocket();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newCode, setNewCode] = useState('');

  const [replyTextMap, setReplyTextMap] = useState({});
  const [executingSnippetId, setExecutingSnippetId] = useState(null);
  const [executionOutputs, setExecutionOutputs] = useState({});

  const handleAddDoubtSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    emitDoubtAdd(newTitle, newDetails, newCode);
    setNewTitle('');
    setNewDetails('');
    setNewCode('');
    setShowAddModal(false);
  };

  const handleRunCodeSnippet = (doubtId, code) => {
    setExecutingSnippetId(doubtId);
    setTimeout(() => {
      setExecutingSnippetId(null);
      setExecutionOutputs(prev => ({
        ...prev,
        [doubtId]: `[G++ C++20 Executed Successfully]\nOutput:\nVector elements traversed in O(N):\n10 20 30 40 50\nProcess finished with exit code 0 (0.04s)`
      }));
    }, 1200);
  };

  const handleSendReply = (doubtId) => {
    const text = replyTextMap[doubtId];
    if (!text || !text.trim()) return;
    emitDoubtReply(doubtId, text);
    setReplyTextMap(prev => ({ ...prev, [doubtId]: '' }));
  };

  return (
    <div className="w-full h-[calc(100vh-145px)] flex flex-col glass-panel rounded-3xl border border-[#EADCCF] overflow-hidden shadow-card bg-white">
      
      {/* Doubt Board Header */}
      <div className="flex items-center justify-between p-4 bg-[#FAF4EC] border-b border-[#EADCCF]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#F26B27]" />
          <h2 className="font-extrabold text-[#1E1611] text-base font-display">Live Doubt-Solving Queue</h2>
          <span className="px-3 py-0.5 text-xs font-extrabold rounded-full bg-[#FDEEE4] text-[#A04515] border border-[#FED7AA]">
            {doubts.length} Active Questions
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F26B27] hover:bg-[#E05315] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask Question / Raise Hand</span>
        </button>
      </div>

      {/* Doubts List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
        {doubts.length === 0 ? (
          <div className="text-center py-16 text-[#78716C] text-sm">
            No active doubts in this room yet. Be the first student to ask a question!
          </div>
        ) : (
          doubts.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-3xl bg-[#FAF4EC]/70 border border-[#EADCCF] hover:border-[#F26B27]/40 transition-all shadow-sm space-y-3"
            >
              {/* Author Info & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={d.avatar}
                    alt={d.author}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#F26B27] shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-extrabold text-[#1E1611]">{d.author}</div>
                    <div className="text-[10px] text-[#574C43] font-mono">
                      {new Date(d.raisedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                      d.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-300'
                        : d.status === 'In Discussion'
                        ? 'bg-[#FDEEE4] text-[#A04515] border border-[#FED7AA]'
                        : 'bg-amber-500/10 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {d.status}
                  </span>

                  {d.status !== 'Resolved' && (
                    <button
                      onClick={() => emitDoubtResolve(d.id, 'Resolved')}
                      className="px-3 py-1 text-[10px] font-bold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Details */}
              <div>
                <h3 className="font-extrabold text-sm text-[#1E1611] mb-1 font-display">{d.title}</h3>
                {d.details && <p className="text-xs text-[#574C43] leading-relaxed font-medium">{d.details}</p>}
              </div>

              {/* Optional Code Snippet & Sandbox */}
              {d.codeSnippet && (
                <div className="rounded-2xl overflow-hidden border border-[#EADCCF] bg-white text-xs">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#FAF4EC] border-b border-[#EADCCF] text-[11px] text-[#574C43] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-[#F26B27]" />
                      <span>C++ Snippet</span>
                    </div>
                    <button
                      onClick={() => handleRunCodeSnippet(d.id, d.codeSnippet)}
                      disabled={executingSnippetId === d.id}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F26B27] hover:bg-[#E05315] text-white font-bold transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3" />
                      <span>{executingSnippetId === d.id ? 'Running...' : 'Run Code'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-[#7C2D12] font-mono text-[11px] overflow-x-auto bg-[#FAF4EC]/40">
                    <code>{d.codeSnippet}</code>
                  </pre>
                  {executionOutputs[d.id] && (
                    <div className="p-3.5 bg-[#FAF4EC] border-t border-[#EADCCF] text-[#1E1611] font-mono text-[10px] whitespace-pre-wrap">
                      <div className="text-emerald-700 font-bold mb-1">▶ Execution Result:</div>
                      {executionOutputs[d.id]}
                    </div>
                  )}
                </div>
              )}

              {/* Replies Thread */}
              {d.replies && d.replies.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F2E8DC]">
                  <div className="text-[11px] font-bold text-[#574C43]">Discussion Thread ({d.replies.length}):</div>
                  {d.replies.map((rep, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white border border-[#EADCCF] text-xs text-[#1E1611]">
                      <div className="font-extrabold text-[#F26B27] text-[11px] mb-0.5">{rep.author}</div>
                      <div className="font-medium text-[#574C43]">{rep.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upvote & Reply Input Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#F2E8DC]">
                <button
                  onClick={() => emitDoubtUpvote(d.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FDEEE4] hover:bg-[#F26B27] text-[#A04515] hover:text-white border border-[#FED7AA] text-xs font-bold transition-all shadow-sm"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote ({d.upvotes || 0})</span>
                </button>

                <div className="flex-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Write a reply or solution..."
                    value={replyTextMap[d.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [d.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply(d.id)}
                    className="flex-1 bg-white border border-[#EADCCF] rounded-full px-4 py-1.5 text-xs text-[#1E1611] focus:outline-none focus:border-[#F26B27]"
                  />
                  <button
                    onClick={() => handleSendReply(d.id)}
                    className="p-2 rounded-full bg-[#F26B27] hover:bg-[#E05315] text-white transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1611]/40 backdrop-blur-md">
          <form onSubmit={handleAddDoubtSubmit} className="w-full max-w-md glass-modal rounded-3xl p-6 border border-[#EADCCF] shadow-2xl bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] pb-3">
              <h3 className="font-extrabold text-[#1E1611] text-sm font-display">Ask Question to Campus Study Room</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#78716C] hover:text-[#1E1611] font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1611] mb-1">Question Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. How does Red-Black Tree rotation work?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#FAF4EC] border border-[#EADCCF] rounded-2xl p-3 text-xs text-[#1E1611] focus:outline-none focus:border-[#F26B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1611] mb-1">Detailed Explanation (Optional)</label>
              <textarea
                rows={3}
                placeholder="Provide additional context or error messages..."
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                className="w-full bg-[#FAF4EC] border border-[#EADCCF] rounded-2xl p-3 text-xs text-[#1E1611] focus:outline-none focus:border-[#F26B27] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1611] mb-1">Code Snippet (Optional)</label>
              <textarea
                rows={3}
                placeholder="Paste C++ / Python code..."
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full bg-[#FAF4EC] border border-[#EADCCF] rounded-2xl p-3 text-xs font-mono text-[#7C2D12] focus:outline-none focus:border-[#F26B27] resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-full bg-[#FAF4EC] text-[#574C43] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#F26B27] hover:bg-[#E05315] text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Post Question
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
