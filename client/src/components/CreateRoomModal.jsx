import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { PlusCircle, Building, Sparkles, BookOpen } from 'lucide-react';

export const CreateRoomModal = ({ onClose, onRoomCreated }) => {
  const { createNewRoom } = useSocket();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Department Course');
  const [building, setBuilding] = useState('LHC-102');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = await createNewRoom({
      name,
      category,
      building,
      description
    });

    if (created) {
      onRoomCreated(created.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1611]/40 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="w-full max-w-md glass-modal rounded-3xl p-6 border border-[#EADCCF] shadow-2xl bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2E8DC] pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#F26B27]" />
            <h3 className="font-extrabold text-[#1E1611] text-sm font-display">Create New Study Room</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1E1611] font-bold"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1E1611] mb-1">Room Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. CS-401: Distributed Systems Group"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#FAF4EC] border border-[#EADCCF] rounded-2xl p-3 text-xs text-[#1E1611] focus:outline-none focus:border-[#F26B27]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#1E1611] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FAF4EC] border border-[#EADCCF] rounded-2xl p-3 text-xs text-[#1E1611] focus:outline-none focus:border-[#F26B27]"
            >
              <option value="Department Course">Department Course</option>
              <option value="Hostel Group Study">Hostel Group Study</option>
              <option value="Project Work">Project Work</option>
              <option value="Interview Prep">Interview Prep</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1611] mb-1">Building / Location</label>
            <input
              type="text"
              placeholder="e.g. LHC-102 / Online"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full bg-[#FAF4EC] border border-[#EADCCF] rounded-2xl p-3 text-xs text-[#1E1611] focus:outline-none focus:border-[#F26B27]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1E1611] mb-1">Description (Optional)</label>
          <textarea
            rows={3}
            placeholder="What will students discuss or work on in this room?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#FAF4EC] border border-[#EADCCF] rounded-2xl p-3 text-xs text-[#1E1611] focus:outline-none focus:border-[#F26B27] resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#FAF4EC] text-[#574C43] text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-[#F26B27] hover:bg-[#E05315] text-white text-xs font-bold shadow-md shadow-orange-500/20"
          >
            Create & Join Room
          </button>
        </div>
      </form>
    </div>
  );
};
