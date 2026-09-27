import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  Pencil,
  Square,
  Circle,
  Type,
  Eraser,
  StickyNote,
  Trash2,
  Download,
  MousePointer,
  Minus
} from 'lucide-react';

const COLORS = [
  '#EA580C', // Terracotta Orange
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#1E1611'  // Warm Dark Charcoal
];

export const Whiteboard = () => {
  const {
    whiteboardShapes,
    emitWhiteboardAdd,
    emitWhiteboardUpdate,
    emitWhiteboardClear,
    remoteCursors,
    emitCursorMove
  } = useSocket();

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#EA580C');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [dragStart, setDragStart] = useState(null);

  // Local optimistic shape cache
  const [localShapes, setLocalShapes] = useState([]);

  // Sync server shapes with local shapes
  useEffect(() => {
    if (whiteboardShapes && whiteboardShapes.length > 0) {
      setLocalShapes(whiteboardShapes);
    }
  }, [whiteboardShapes]);

  // Handle Canvas Resize ONLY when container dimensions change (Prevents erasing canvas on re-render!)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Redraw Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Warm paper-white canvas background
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Warm subtle grid dots
    ctx.fillStyle = 'rgba(160, 69, 21, 0.08)';
    for (let x = 15; x < canvas.width; x += 30) {
      for (let y = 15; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render stored whiteboard shapes (local + server)
    const allShapes = localShapes.length > 0 ? localShapes : whiteboardShapes;
    allShapes.forEach((shape) => {
      drawShapeOnCtx(ctx, shape);
    });

    // Render current active stroke preview
    if (isDrawing && currentStroke.length > 0) {
      if (tool === 'pencil' || tool === 'eraser') {
        drawShapeOnCtx(ctx, {
          type: tool === 'eraser' ? 'eraser' : 'pencil',
          points: currentStroke,
          color: tool === 'eraser' ? '#FAF7F2' : color,
          strokeWidth: tool === 'eraser' ? strokeWidth * 4 : strokeWidth
        });
      } else if (dragStart && (tool === 'rect' || tool === 'circle' || tool === 'line')) {
        const last = currentStroke[currentStroke.length - 1];
        drawShapeOnCtx(ctx, {
          type: tool,
          x: dragStart.x,
          y: dragStart.y,
          width: last.x - dragStart.x,
          height: last.y - dragStart.y,
          color,
          strokeWidth
        });
      }
    }
  }, [localShapes, whiteboardShapes, isDrawing, currentStroke, dragStart, tool, color, strokeWidth]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const drawShapeOnCtx = (ctx, shape) => {
    ctx.save();
    ctx.strokeStyle = shape.color || '#EA580C';
    ctx.lineWidth = shape.strokeWidth || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (shape.type === 'pencil' || shape.type === 'eraser') {
      if (shape.points && shape.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      }
    } else if (shape.type === 'rect') {
      ctx.beginPath();
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      if (shape.fill) {
        ctx.fillStyle = shape.fill;
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
    } else if (shape.type === 'circle') {
      const radius = Math.sqrt(shape.width * shape.width + shape.height * shape.height) / 2;
      ctx.beginPath();
      ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.max(5, radius), 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shape.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
      ctx.stroke();
    } else if (shape.type === 'text') {
      ctx.font = `600 ${shape.fontSize || 18}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = shape.color || '#1E1611';
      ctx.fillText(shape.text || '', shape.x, shape.y);
    } else if (shape.type === 'sticky') {
      ctx.fillStyle = shape.color || '#FED7AA';
      ctx.beginPath();
      ctx.roundRect(shape.x, shape.y, shape.width || 180, shape.height || 140, 16);
      ctx.fill();
      ctx.fillStyle = '#7C2D12';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      
      const lines = (shape.text || '').split('\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line, shape.x + 14, shape.y + 28 + idx * 18);
      });
    }
    ctx.restore();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDragStart(coords);
    setCurrentStroke([coords]);

    if (tool === 'text') {
      const textPrompt = prompt('Enter text for whiteboard note:', 'Key Concept');
      if (textPrompt) {
        const newShape = {
          id: `shape-${Date.now()}`,
          type: 'text',
          x: coords.x,
          y: coords.y,
          text: textPrompt,
          color,
          fontSize: 18
        };
        setLocalShapes(prev => [...prev, newShape]);
        emitWhiteboardAdd(newShape);
      }
      setIsDrawing(false);
    } else if (tool === 'sticky') {
      const noteText = prompt('Enter Sticky Note Content:', '📌 Study Group Note');
      if (noteText) {
        const newShape = {
          id: `shape-${Date.now()}`,
          type: 'sticky',
          x: coords.x,
          y: coords.y,
          width: 200,
          height: 140,
          text: noteText,
          color: '#FED7AA'
        };
        setLocalShapes(prev => [...prev, newShape]);
        emitWhiteboardAdd(newShape);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    emitCursorMove(coords.x, coords.y);
    if (!isDrawing) return;
    setCurrentStroke(prev => [...prev, coords]);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const coords = getCanvasCoords(e);
    let newShape = null;

    if (tool === 'pencil' || tool === 'eraser') {
      if (currentStroke.length > 1) {
        newShape = {
          id: `shape-${Date.now()}`,
          type: tool === 'eraser' ? 'eraser' : 'pencil',
          points: currentStroke,
          color: tool === 'eraser' ? '#FAF7F2' : color,
          strokeWidth: tool === 'eraser' ? strokeWidth * 4 : strokeWidth
        };
      }
    } else if (dragStart && (tool === 'rect' || tool === 'circle' || tool === 'line')) {
      newShape = {
        id: `shape-${Date.now()}`,
        type: tool,
        x: dragStart.x,
        y: dragStart.y,
        width: coords.x - dragStart.x,
        height: coords.y - dragStart.y,
        color,
        strokeWidth
      };
    }

    if (newShape) {
      setLocalShapes(prev => [...prev, newShape]);
      emitWhiteboardAdd(newShape);
    }

    setCurrentStroke([]);
    setDragStart(null);
  };

  const handleClear = () => {
    setLocalShapes([]);
    emitWhiteboardClear();
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `nith-whiteboard-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="relative w-full h-[calc(100vh-145px)] flex flex-col glass-panel rounded-3xl border border-[#EADCCF] overflow-hidden shadow-card bg-white/95" ref={containerRef}>
      
      {/* Floating Kheelona Toolbar (Pill Container) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-2 rounded-full bg-white/95 border border-[#EADCCF] shadow-warm">
        
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 border-r border-[#EADCCF] pr-2">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded-full transition-all ${tool === 'pencil' ? 'bg-[#F26B27] text-white shadow-md' : 'text-[#574C43] hover:bg-[#FAF4EC] hover:text-[#1E1611]'}`}
            title="Pencil (Freehand)"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-full transition-all ${tool === 'rect' ? 'bg-[#F26B27] text-white shadow-md' : 'text-[#574C43] hover:bg-[#FAF4EC] hover:text-[#1E1611]'}`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-full transition-all ${tool === 'circle' ? 'bg-[#F26B27] text-white shadow-md' : 'text-[#574C43] hover:bg-[#FAF4EC] hover:text-[#1E1611]'}`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-full transition-all ${tool === 'line' ? 'bg-[#F26B27] text-white shadow-md' : 'text-[#574C43] hover:bg-[#FAF4EC] hover:text-[#1E1611]'}`}
            title="Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-full transition-all ${tool === 'text' ? 'bg-[#F26B27] text-white shadow-md' : 'text-[#574C43] hover:bg-[#FAF4EC] hover:text-[#1E1611]'}`}
            title="Text Note"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('sticky')}
            className={`p-2 rounded-full transition-all ${tool === 'sticky' ? 'bg-amber-500 text-white shadow-md' : 'text-[#574C43] hover:bg-[#FAF4EC] hover:text-[#1E1611]'}`}
            title="Sticky Note"
          >
            <StickyNote className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-full transition-all ${tool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'text-[#574C43] hover:bg-[#FAF4EC] hover:text-[#1E1611]'}`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 border-r border-[#EADCCF] pr-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full transition-all border ${color === c ? 'scale-125 ring-2 ring-[#F26B27] border-white' : 'border-slate-300 hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 border-r border-[#EADCCF] pr-2">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`px-2.5 py-0.5 text-xs rounded-full font-bold transition-all ${strokeWidth === w ? 'bg-[#F2E8DC] text-[#1E1611]' : 'text-[#574C43] hover:text-[#1E1611]'}`}
            >
              {w}px
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportPNG}
            className="p-2 text-emerald-600 hover:bg-emerald-500/10 rounded-full transition-all"
            title="Export PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-crosshair"
      />

      {/* Live Remote Cursors Overlay */}
      {Object.entries(remoteCursors).map(([sockId, c]) => {
        if (Date.now() - c.lastSeen > 10000) return null;
        return (
          <div
            key={sockId}
            className="absolute pointer-events-none transition-all duration-75 z-40 flex items-center gap-1"
            style={{ left: `${c.x}px`, top: `${c.y}px` }}
          >
            <MousePointer className="w-4 h-4 drop-shadow-md" style={{ color: c.color }} />
            <span
              className="px-2.5 py-0.5 text-[10px] font-extrabold text-white rounded-full shadow-md opacity-95 truncate max-w-[120px]"
              style={{ backgroundColor: c.color }}
            >
              {c.name}
            </span>
          </div>
        );
      })}

    </div>
  );
};
