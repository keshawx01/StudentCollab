import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  Cpu,
  Share2,
  Zap,
  Activity,
  Server,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  Database
} from 'lucide-react';

export const SystemInspector = ({ onClose }) => {
  const { systemLogs, systemStats, latency } = useSocket();

  const [inspectorTab, setInspectorTab] = useState('events');
  const [otSimStep, setOtSimStep] = useState(0);

  const otSteps = [
    {
      title: 'Initial State',
      desc: 'Document text: "NITH Collab". Both User A and User B start at Version 10.',
      userA: 'Inserts "Live" at index 5 -> "NITH Live Collab"',
      userB: 'Deletes "Collab" at index 5 -> "NITH "',
      result: 'Pending concurrent operations transmitted via WebSockets'
    },
    {
      title: 'Concurrent Conflict Detection',
      desc: 'Server receives User A delta (op1) and User B delta (op2) simultaneously.',
      userA: 'op1: insert("Live", pos=5)',
      userB: 'op2: delete(length=6, pos=5)',
      result: 'Operational Transformation engine transforms T(op1, op2) & T(op2, op1)'
    },
    {
      title: 'OT Transformation Applied',
      desc: 'User B position shifted by length of User A insertion (+4 chars).',
      userA: 'Transformed op1\' = insert("Live", pos=5)',
      userB: 'Transformed op2\' = delete(length=6, pos=9)',
      result: 'Final State: "NITH Live " — Zero document divergence across clients!'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E1611]/40 backdrop-blur-xl">
      <div className="w-full max-w-5xl h-[85vh] glass-modal rounded-3xl border border-[#EADCCF] shadow-2xl bg-white flex flex-col overflow-hidden">
        
        {/* Inspector Header */}
        <div className="flex items-center justify-between p-4 bg-[#FAF4EC] border-b border-[#EADCCF]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FDEEE4] border border-[#FED7AA] text-[#F26B27]">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-[#1E1611] tracking-tight font-display">
                  System Architecture & Technical Inspector
                </h2>
                <span className="px-3 py-0.5 text-[10px] font-mono font-extrabold rounded-full bg-[#FDEEE4] text-[#A04515] border border-[#FED7AA]">
                  REAL-TIME MONITOR
                </span>
              </div>
              <p className="text-xs text-[#574C43] font-medium">
                Inspect WebSocket frames, Redis Pub/Sub scaling relay, and Operational Transformation (OT)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2E8DC] hover:bg-[#EADCCF] text-[#1E1611] flex items-center justify-center font-bold text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Inspector Navigation Tabs (Pill Buttons) */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FAF4EC]/60 border-b border-[#EADCCF] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setInspectorTab('events')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
              inspectorTab === 'events' ? 'bg-[#F26B27] text-white shadow-md shadow-orange-500/20' : 'text-[#574C43] hover:text-[#1E1611]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>WebSocket Event Stream</span>
          </button>

          <button
            onClick={() => setInspectorTab('redis')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
              inspectorTab === 'redis' ? 'bg-[#F26B27] text-white shadow-md shadow-orange-500/20' : 'text-[#574C43] hover:text-[#1E1611]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Redis Pub/Sub Multi-Instance Relay</span>
          </button>

          <button
            onClick={() => setInspectorTab('ot')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
              inspectorTab === 'ot' ? 'bg-[#F26B27] text-white shadow-md shadow-orange-500/20' : 'text-[#574C43] hover:text-[#1E1611]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Operational Transformation (OT) Demo</span>
          </button>

          <button
            onClick={() => setInspectorTab('throttling')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
              inspectorTab === 'throttling' ? 'bg-[#F26B27] text-white shadow-md shadow-orange-500/20' : 'text-[#574C43] hover:text-[#1E1611]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Throttling & Performance</span>
          </button>
        </div>

        {/* Tab 1: Live WebSocket Event Logs */}
        {inspectorTab === 'events' && (
          <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-3 bg-white">
            <div className="flex items-center justify-between text-[11px] text-[#574C43] mb-2 font-sans font-bold">
              <span>Live Socket Inbound/Outbound Packets</span>
              <span>Total Processed: <strong className="text-[#F26B27]">{systemStats?.totalMessagesProcessed || systemLogs.length}</strong></span>
            </div>

            <div className="space-y-2">
              {systemLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-[#FAF4EC] border border-[#EADCCF] flex items-start justify-between gap-3 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        log.direction === 'SENT'
                          ? 'bg-[#FDEEE4] text-[#A04515] border border-[#FED7AA]'
                          : 'bg-emerald-500/10 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {log.direction}
                    </span>
                    <span className="font-extrabold text-[#1E1611] font-sans">{log.eventName}</span>
                  </div>

                  <div className="text-[#574C43] truncate max-w-md">
                    {log.payloadSummary}
                  </div>

                  <span className="text-[#78716C] text-[10px] shrink-0 font-sans">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Redis Pub/Sub Scaling Simulator */}
        {inspectorTab === 'redis' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-white text-xs">
            
            <div className="p-5 rounded-3xl bg-[#FAF4EC] border border-[#EADCCF] space-y-3">
              <div className="font-extrabold text-[#1E1611] text-sm flex items-center gap-2 font-display">
                <Database className="w-4 h-4 text-[#F26B27]" />
                <span>Multi-Instance Socket.io Cluster Architecture</span>
              </div>
              <p className="text-[#574C43] leading-relaxed text-xs font-medium">
                To scale WebSockets across multiple server instances (Node Alpha & Node Beta behind a load balancer), events publish to a central Redis Pub/Sub bus (`nith:channel`). Subscribed nodes relay events to locally attached WebSocket clients.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-[#EADCCF] text-center space-y-1 shadow-sm">
                  <Server className="w-5 h-5 text-[#F26B27] mx-auto" />
                  <div className="font-extrabold text-[#1E1611]">Server Node Alpha</div>
                  <div className="text-[10px] text-[#574C43]">Port 5000 • Active Clients: 1</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FDEEE4] border border-[#FED7AA] text-center space-y-1 shadow-sm">
                  <Share2 className="w-5 h-5 text-[#A04515] mx-auto animate-pulse" />
                  <div className="font-extrabold text-[#A04515]">Redis Pub/Sub Channel</div>
                  <div className="text-[10px] text-[#A04515]">nith:cs-302 (Latency ~2ms)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#EADCCF] text-center space-y-1 shadow-sm">
                  <Server className="w-5 h-5 text-emerald-600 mx-auto" />
                  <div className="font-extrabold text-[#1E1611]">Server Node Beta</div>
                  <div className="text-[10px] text-[#574C43]">Port 5001 • Active Clients: 1</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-extrabold text-[#1E1611] text-xs font-display">Recent Redis Inter-Node Pub/Sub Relays:</div>
              {systemStats?.redis?.logs?.map((rLog) => (
                <div key={rLog.id} className="p-3 rounded-2xl bg-[#FAF4EC] border border-[#EADCCF] flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FDEEE4] text-[#A04515] font-extrabold">{rLog.channel}</span>
                    <span className="text-[#1E1611] font-bold">{rLog.eventName}</span>
                  </div>
                  <div className="text-[#574C43]">
                    {rLog.sourceNode} ➔ <strong className="text-[#F26B27]">Redis</strong> ➔ {rLog.targetNode}
                  </div>
                  <span className="text-emerald-700 font-bold">{rLog.latencyMs}ms</span>
                </div>
              )) || (
                <div className="text-[#78716C]">Listening to inter-node messages...</div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Operational Transformation Visualizer */}
        {inspectorTab === 'ot' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-white text-xs">
            <div className="p-5 rounded-3xl bg-[#FAF4EC] border border-[#EADCCF] space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-[#1E1611] text-sm flex items-center gap-2 font-display">
                  <GitBranch className="w-4 h-4 text-[#F26B27]" />
                  <span>Operational Transformation (OT) Conflict Resolution Simulation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setOtSimStep((otSimStep + 1) % otSteps.length)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F26B27] hover:bg-[#E05315] text-white font-bold text-xs shadow-md shadow-orange-500/20"
                  >
                    <span>Next Step ({otSimStep + 1}/3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EADCCF] space-y-2 shadow-sm">
                <div className="text-[#F26B27] font-extrabold text-sm font-display">
                  Step {otSimStep + 1}: {otSteps[otSimStep].title}
                </div>
                <p className="text-[#574C43] text-xs font-medium">{otSteps[otSimStep].desc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-[#FAF4EC] border border-[#EADCCF]">
                    <div className="font-extrabold text-[#A04515] mb-1 font-sans">Student A (Local Site 1):</div>
                    <div className="text-[#1E1611]">{otSteps[otSimStep].userA}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF4EC] border border-[#EADCCF]">
                    <div className="font-extrabold text-[#F26B27] mb-1 font-sans">Student B (Local Site 2):</div>
                    <div className="text-[#1E1611]">{otSteps[otSimStep].userB}</div>
                  </div>
                </div>

                <div className="pt-2 text-emerald-700 font-extrabold font-sans text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Result: {otSteps[otSimStep].result}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Throttling & Performance */}
        {inspectorTab === 'throttling' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white text-xs">
            <div className="p-5 rounded-3xl bg-[#FAF4EC] border border-[#EADCCF] space-y-3">
              <div className="font-extrabold text-[#1E1611] text-sm flex items-center gap-2 font-display">
                <Zap className="w-4 h-4 text-[#F26B27]" />
                <span>Multiplayer Cursor Throttling & Delta Compression</span>
              </div>
              <p className="text-[#574C43] text-xs leading-relaxed font-medium">
                Raw `mousemove` events fire up to 120 times per second per user. Transmitting raw events over WebSockets would flood network sockets. We implement a **50ms Trailing Edge Throttle** combined with **Vector Point Decimation**, reducing WebSocket payload frequency by ~85%.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono pt-2">
                <div className="p-4 rounded-2xl bg-white border border-[#EADCCF] text-center shadow-sm">
                  <div className="text-[#574C43] text-[10px] font-sans font-bold">Unthrottled Raw Events</div>
                  <div className="text-rose-600 font-extrabold text-lg">120 ev/sec</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EADCCF] text-center shadow-sm">
                  <div className="text-[#574C43] text-[10px] font-sans font-bold">Throttled Socket Output</div>
                  <div className="text-emerald-700 font-extrabold text-lg">20 ev/sec</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EADCCF] text-center shadow-sm">
                  <div className="text-[#574C43] text-[10px] font-sans font-bold">Bandwidth Saved</div>
                  <div className="text-[#F26B27] font-extrabold text-lg">83.3% Saved</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-[#FAF4EC] border-t border-[#EADCCF] flex items-center justify-between text-[11px] text-[#574C43] font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F26B27]" />
            <span>NITH CollabHub Technical System Inspector</span>
          </div>
          <span>Status: Operational (WebSocket RTT {latency}ms)</span>
        </div>

      </div>
    </div>
  );
};
