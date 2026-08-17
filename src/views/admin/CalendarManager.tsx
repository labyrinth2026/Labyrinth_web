"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import {
  Plus, X, RefreshCw, CalendarDays, Upload,
  Trash2, Edit2, Clock, Tag, Users, Sparkles, Check
} from 'lucide-react';

// ─── Vertical colour map ────────────────────────────────────────────────
const VERTICAL_COLORS: Record<string, string> = {
  'AIHub':       '#5ec8d8',
  'DevZen':      '#9b8cf2',
  'Synapse':     '#d8c34b',
  'InterVerse':  '#f2789b',
  'Startovate':  '#7fd99a',
  'Research':    '#6e9bf2',
  'FieldOps':    '#f0824a',
  'Debate Club': '#d97bd9',
  'InsightX':    '#b5e04b',
};
const ALL_VERTICALS = Object.keys(VERTICAL_COLORS);

function getVerticalColor(v?: string | null) {
  return v ? (VERTICAL_COLORS[v] || '#CD0000') : '#CD0000';
}

// ─── date-fns localizer ─────────────────────────────────────────────────
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const BigCalendar = dynamic(
  () => import('react-big-calendar').then(m => m.Calendar),
  { ssr: false }
);

// ─── Calendar events from the HTML calendar (for bulk import) ──────────
const CALENDAR_SEED = [
  { id: 'cal-ai-quiz-firstyear', title: 'AI Quiz for First-Year Students', date: '2026-08-22', vertical: 'AIHub', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'An introductory quiz for first-year students covering fundamental AI concepts, designed to build early interest in the field.', highlights: ['Entry point event targeting first-years', 'Builds early interest in AI before deeper vertical events'], type: 'confirmed' },
  { id: 'cal-vibe-coding-workshop', title: 'Vibe Coding Workshop', date: '2026-09-05', vertical: 'DevZen', category: 'workshop', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A practical workshop introducing AI-assisted software development using modern tools.', highlights: ['Cursor', 'GitHub Copilot', 'Claude Code', 'ChatGPT', 'AI debugging', 'Rapid prototyping'], type: 'confirmed' },
  { id: 'cal-robotics-iot-sep', title: 'Robotics & IoT Learning Workshops', date: '2026-09-12', vertical: 'Synapse', category: 'workshop', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Hands-on workshops covering Arduino, ESP32, sensors, motors, wireless communication, and rapid prototyping.', highlights: ['Arduino & ESP32', 'Sensors & motors', 'Wireless communication', 'Rapid prototyping'], type: 'confirmed' },
  { id: 'cal-portfolio-wars', title: 'Portfolio Wars', date: '2026-09-16', vertical: 'Startovate', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Each team gets a fixed amount of virtual funds to invest across trending products, sectors, or markets.', highlights: ['Virtual seed fund', 'Live rebalancing rounds', 'Final presentation'], type: 'confirmed' },
  { id: 'cal-campusquest', title: 'CampusQuest', date: '2026-09-25', endDate: '2026-09-26', vertical: 'InterVerse', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A campus-wide collaborative event solving logic, strategy, and puzzle-based challenges.', highlights: ['Inter-department participation', 'Grand finale'], type: 'confirmed' },
  { id: 'cal-forensic-hypothesis', title: 'The Forensic Hypothesis', date: '2026-10-03', vertical: 'Research', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A high-energy analytical challenge: solve a simulated crime scene using research frameworks.', highlights: ['Case files', 'Witness statements', 'Psychological profiles'], type: 'confirmed' },
  { id: 'cal-ultimate-funathlon', title: 'Ultimate Funathlon', date: '2026-10-24', vertical: 'FieldOps', category: 'social', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A team-based sports festival inspired by The Amazing Race and Survivor.', highlights: ['Multi-zone competition', 'Crowns Labyrinth Champions'], type: 'confirmed' },
  { id: 'cal-robotics-iot-oct', title: 'Robotics & IoT Workshops (Round 2)', date: '2026-10-26', vertical: 'Synapse', category: 'workshop', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Further hands-on workshops covering Arduino, ESP32, sensors, motors, and wireless communication.', highlights: ['Arduino & ESP32', 'Expert talks'], type: 'confirmed' },
  { id: 'cal-asian-parliamentary', title: 'Asian Parliamentary Conference: Diplomacy & Deliberation', date: '2026-11-07', vertical: 'Debate Club', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A one-day Model United Nations (PreMUN) conference on diplomacy, international relations, and policy-making.', highlights: ['Diplomacy', 'Policy-making', 'Leadership skills'], type: 'confirmed' },
  { id: 'cal-xai-workshop', title: 'Workshop on Explainable AI (XAI)', date: '2026-11-14', vertical: 'AIHub', category: 'workshop', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Hands-on session on interpretable and trustworthy AI models.', highlights: ['SHAP & LIME tools'], type: 'confirmed' },
  { id: 'cal-datathon', title: 'Datathon', date: '2026-11-21', vertical: 'InsightX', category: 'hackathon', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A 24-48 hour challenge: turn a raw dataset into insights and a compelling dashboard.', highlights: ['Focus on right questions', 'Sponsor opportunity'], type: 'confirmed' },
  { id: 'cal-ai-mini-hackathon', title: 'AI-Based Mini Hackathon', date: '2026-12-05', vertical: 'AIHub', category: 'hackathon', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Teams build AI-based solutions to a real-world problem statement in a fixed time window.', highlights: ['Most visible AIHub event', 'Team-based'], type: 'confirmed' },
  { id: 'cal-mlops-workshop', title: 'Workshop on MLOps', date: '2026-12-14', vertical: 'AIHub', category: 'workshop', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Covers model deployment, monitoring, and versioning — bridging build vs ship.', highlights: ['Model deployment', 'Monitoring & versioning'], type: 'confirmed' },
  { id: 'cal-upsc-training', title: 'UPSC Training Session', date: '2026-12-19', vertical: 'InterVerse', category: 'talk', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Insights into UPSC preparation, examination strategy, and public service opportunities.', highlights: ['UPSC structure', 'Answer writing', 'Career paths'], type: 'confirmed' },
  { id: 'cal-project-showcase', title: 'Project Showcase', date: '2026-12-26', vertical: 'AIHub', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Students present AI and ML projects to faculty and peers.', collab: 'DevZen', highlights: ['Capstone projects', 'Judging panel', 'Certificates'], type: 'confirmed' },
  { id: 'cal-codesprint-a', title: 'CODESPRINT-A: Five-Day Build, One Hour at a Time', date: '2026-09-01', vertical: 'DevZen', category: 'hackathon', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A 5-day sprint: 1 hour per day, one shipped project.', highlights: ['Leaderboard', 'Live demos'], type: 'ytd', dateLabel: 'September 2026 - exact date TBD' },
  { id: 'cal-digital-literacy-outreach', title: 'Digital Literacy Outreach Program', date: '2026-09-01', vertical: 'InterVerse', category: 'social', status: 'upcoming', location: 'Government School / Outreach Venue', description: 'Basic computer skills, internet awareness, and online safety for underprivileged students.', collab: 'CSA', highlights: ['Computer literacy', 'Online safety'], type: 'ytd', dateLabel: 'September 2026 - date TBD' },
  { id: 'cal-roundtable', title: 'RoundTable', date: '2027-01-01', vertical: 'Debate Club', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'A 2-day MUN conference: Indian Committee + UN Committee.', highlights: ['Diplomacy', 'Conflict resolution'], type: 'ytd', dateLabel: 'January 2027 - date TBD' },
  { id: 'cal-impact-analytics-challenge', title: 'Impact Analytics Challenge', date: '2027-01-01', vertical: 'InsightX', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Work with real stakeholders to deliver practical insights.', collab: 'All tech verticals', highlights: ['Partner organizations', 'Real datasets', 'Impact-driven'], type: 'ytd', dateLabel: 'January 2027 - date TBD' },
  { id: 'cal-ai-short-film', title: 'AI Short Film Challenge', date: '2027-01-01', vertical: 'DevZen', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Teams produce a short film using AI-powered tools.', highlights: ['Script generation', 'AI voiceover', 'Video generation'], type: 'ytd', dateLabel: 'January 2027 - date TBD' },
  { id: 'cal-code-vs-ai', title: 'Code vs AI Challenge', date: '2027-02-01', vertical: 'DevZen', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Webapp building: manual vs AI-assisted development.', collab: 'AIHub', highlights: ['Coding fundamentals', 'Responsible AI'], type: 'ytd', dateLabel: 'February 2027 - date TBD' },
  { id: 'cal-line-gate', title: 'Line Gate', date: '2027-02-01', vertical: 'Synapse', category: 'competition', status: 'upcoming', location: 'Christ University, Bangalore Central Campus', description: 'Design, build, and program an autonomous line-following robot.', collab: 'AIHub', highlights: ['Sensor calibration', 'Motor control', 'Embedded programming'], type: 'ytd', dateLabel: 'February 2027 - date TBD' },
];

// ─── Blank form template ─────────────────────────────────────────────────
const blankForm = () => ({
  title: '',
  description: '',
  date: '',
  endDate: '',
  dateLabel: '',
  time: '',
  location: 'Christ University, Bangalore Central Campus',
  vertical: '',
  category: 'competition',
  status: 'upcoming',
  featured: false,
  highlights: [] as string[],
  collab: '',
  type: 'confirmed' as 'confirmed' | 'ytd',
  image: '',
});

type FormState = ReturnType<typeof blankForm>;

const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 text-slate-800 placeholder:text-slate-400 bg-white";
const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5";

// ─── Event Form Modal ────────────────────────────────────────────────────
function EventModal({
  form,
  setForm,
  onSave,
  onClose,
  isSaving,
  isEdit,
  onDelete,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
  isEdit: boolean;
  onDelete?: () => void;
}) {
  const [newHighlight, setNewHighlight] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res: any = await fetchFromSheet('uploadAvatar', { base64, userId: `event-${Date.now()}` });
          const url = res?.url || res?.data?.url || base64;
          setForm(f => ({ ...f, image: url }));
        } catch {
          setForm(f => ({ ...f, image: base64 }));
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    setForm(f => ({ ...f, highlights: [...f.highlights, newHighlight.trim()] }));
    setNewHighlight('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/80"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-[#CD0000]">
              {isEdit ? 'Edit Event' : 'Add Event'}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Fill in the event details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type toggle */}
          <div>
            <label className={labelClass}>Event Type</label>
            <div className="flex bg-slate-100 rounded-xl p-1 w-fit gap-1">
              {(['confirmed', 'ytd'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    form.type === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'confirmed' ? 'Fixed Date' : 'Date TBD'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelClass}>Event Title *</label>
            <input
              type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={inputClass} placeholder="Event name..."
            />
          </div>

          {/* Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{form.type === 'ytd' ? 'Pinned Date (1st of month)' : 'Date *'}</label>
              <input
                type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className={inputClass}
              />
            </div>
            {form.type === 'confirmed' ? (
              <div>
                <label className={labelClass}>End Date (for multi-day)</label>
                <input
                  type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ) : (
              <div>
                <label className={labelClass}>Date Label (displayed on site)</label>
                <input
                  type="text" value={form.dateLabel}
                  onChange={e => setForm(f => ({ ...f, dateLabel: e.target.value }))}
                  className={inputClass} placeholder="e.g. January 2027 - date TBD"
                />
              </div>
            )}
          </div>

          {/* Time + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Time</label>
              <input
                type="text" value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className={inputClass} placeholder="e.g. 9:30 AM – 12:00 PM"
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Vertical + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vertical</label>
              <select
                value={form.vertical}
                onChange={e => setForm(f => ({ ...f, vertical: e.target.value }))}
                className={inputClass}
              >
                <option value="">None / General</option>
                {ALL_VERTICALS.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={inputClass}
              >
                {['competition', 'hackathon', 'workshop', 'talk', 'social', 'ceremony'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status + Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${form.featured ? 'bg-[#CD0000]' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Featured</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={inputClass} placeholder="Full event description..."
            />
          </div>

          {/* Collab */}
          <div>
            <label className={labelClass}>Collaboration / Partner Vertical</label>
            <input
              type="text" value={form.collab}
              onChange={e => setForm(f => ({ ...f, collab: e.target.value }))}
              className={inputClass} placeholder="e.g. DevZen, or All tech verticals"
            />
          </div>

          {/* Image URL / Upload */}
          <div>
            <label className={labelClass}>Image / Banner (URL or Upload)</label>
            <div className="flex gap-2 items-center">
              <input
                type="text" value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className={inputClass} placeholder="https://... or click Upload to select image"
              />
              <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors flex-shrink-0 border border-slate-200 shadow-xs">
                {isUploading ? <RefreshCw size={14} className="animate-spin text-[#CD0000]" /> : <Upload size={14} />}
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
              </label>
            </div>
            {form.image && (
              <div className="mt-2.5 relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={form.image}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>

          {/* Highlights */}
          <div>
            <label className={labelClass}>Highlights</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
                className={inputClass}
                placeholder="Add highlight and press Enter..."
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            {form.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700"
                  >
                    {h}
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, highlights: f.highlights.filter((_, j) => j !== i) }))}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || !form.title}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#A30000] transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              {isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main CalendarManager ─────────────────────────────────────────────────
export default function CalendarManager() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verticalFilter, setVerticalFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [isSaving, setIsSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Controlled navigation state — keeps current month in state so NEXT/BACK/TODAY work
  const [calDate, setCalDate] = useState(() => new Date(2026, 7, 1));

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFromSheet('getEvents');
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const filtered = verticalFilter === 'all'
    ? events
    : events.filter((e: any) => e.vertical === verticalFilter);

  const parseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 9, 0, 0);
    }
    return new Date(dStr);
  };

  const calEvents = filtered.filter((e: any) => e.date).map((e: any) => {
    const startDate = parseDate(e.date);
    const endDate = e.endDate ? parseDate(e.endDate) : new Date(startDate.getTime() + 4 * 3600 * 1000);
    return {
      id: e.id,
      title: e.title,
      start: startDate,
      end: endDate,
      allDay: true,
      resource: e,
      isTBD: e.type === 'ytd',
    };
  });

  const tbdEvents = filtered.filter((e: any) => e.type === 'ytd');

  const eventStyleGetter = (event: any) => {
    const color = getVerticalColor(event.resource?.vertical);
    return {
      style: {
        backgroundColor: event.isTBD ? 'transparent' : color,
        border: event.isTBD ? `1.5px dashed ${color}` : 'none',
        color: event.isTBD ? color : '#fff',
        borderRadius: '6px',
        fontSize: '10.5px',
        fontWeight: 700,
        opacity: 0.92,
      }
    };
  };

  // Click date → add event pre-filled with that date
  const handleSelectSlot = ({ start }: { start: Date }) => {
    const iso = format(start, 'yyyy-MM-dd');
    setForm({ ...blankForm(), date: iso });
    setEditingId(null);
    setShowModal(true);
  };

  // Click event → open edit modal
  const handleSelectEvent = (ev: any) => {
    const e = ev.resource;
    setForm({
      title: e.title || '',
      description: e.description || '',
      date: e.date ? e.date.substring(0, 10) : '',
      endDate: e.endDate ? e.endDate.substring(0, 10) : '',
      dateLabel: e.dateLabel || '',
      time: e.time || '',
      location: e.location || '',
      vertical: e.vertical || '',
      category: e.category || 'competition',
      status: e.status || 'upcoming',
      featured: !!e.featured,
      highlights: Array.isArray(e.highlights) ? [...e.highlights] : [],
      collab: e.collab || '',
      type: (e.type as 'confirmed' | 'ytd') || 'confirmed',
      image: e.image || '',
    });
    setEditingId(e.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        date: form.date || null,
        endDate: form.endDate || null,
        dateLabel: form.dateLabel || null,
        collab: form.collab || null,
        image: form.image || null,
      };
      if (editingId) {
        await fetchFromSheet('updateEvent', { id: editingId, data: payload });
      } else {
        await fetchFromSheet('addEvent', { data: payload });
      }
      setShowModal(false);
      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to save event.');
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await fetchFromSheet('deleteEvent', { id: editingId });
      setShowModal(false);
      setDeleteConfirm(null);
      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event.');
    }
    setIsSaving(false);
  };

  // Bulk import from the seed data
  const handleImport = async () => {
    if (!confirm(`This will import ${CALENDAR_SEED.length} Labyrinth 2026-27 calendar events. Existing events with the same IDs will be updated. Continue?`)) return;
    setImporting(true);
    setImportStatus('Importing...');
    let ok = 0;
    for (const ev of CALENDAR_SEED) {
      try {
        // Try update first, then add
        const existing = events.find(e => e.id === ev.id);
        if (existing) {
          await fetchFromSheet('updateEvent', { id: ev.id, data: ev });
        } else {
          await fetchFromSheet('addEvent', { data: ev });
        }
        ok++;
        setImportStatus(`Imported ${ok}/${CALENDAR_SEED.length}…`);
      } catch (e) { /* skip */ }
    }
    await loadEvents();
    setImporting(false);
    setImportStatus(`✓ Done — ${ok} events imported`);
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Calendar Scheduler</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Schedule events, view by month, click a date to add, click an event to edit.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {importStatus && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              {importStatus}
            </span>
          )}
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {importing ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
            Import Calendar
          </button>
          <button
            onClick={() => { setForm(blankForm()); setEditingId(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#A30000] transition-colors shadow-sm"
          >
            <Plus size={13} /> Add Event
          </button>
          <button
            onClick={loadEvents}
            className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Vertical Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Tag size={10} /> Filter by Vertical
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setVerticalFilter('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
              verticalFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Sparkles size={9} /> All
          </button>
          {ALL_VERTICALS.map(v => {
            const color = VERTICAL_COLORS[v];
            const isActive = verticalFilter === v;
            return (
              <button
                key={v}
                onClick={() => setVerticalFilter(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border"
                style={isActive
                  ? { background: color, color: '#fff', borderColor: color }
                  : { background: '#fff', color: '#52525B', borderColor: '#E4E4E7' }
                }
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length, color: '#CD0000' },
          { label: 'Confirmed Dates', value: events.filter(e => e.type === 'confirmed' || (e.date && e.type !== 'ytd')).length, color: '#16a34a' },
          { label: 'Date TBD', value: events.filter(e => e.type === 'ytd').length, color: '#d97706' },
          { label: 'Verticals', value: new Set(events.map(e => e.vertical).filter(Boolean)).size, color: '#7c3aed' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="h-[620px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <BigCalendar
            localizer={localizer}
            events={calEvents}
            defaultView="month"
            views={['month', 'agenda']}
            date={calDate}
            onNavigate={(newDate: Date) => setCalDate(newDate)}
            style={{ height: 620 }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            tooltipAccessor={(ev: any) => `${ev.resource?.vertical || ''}: ${ev.title}`}
          />
        )}
      </div>

      {/* TBD Events */}
      {tbdEvents.length > 0 && (
        <div className="bg-white border border-amber-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={13} className="text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Unscheduled / TBD · {tbdEvents.length} events
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tbdEvents.map((ev: any) => {
              const color = getVerticalColor(ev.vertical);
              return (
                <button
                  key={ev.id}
                  onClick={() => {
                    setForm({
                      title: ev.title || '',
                      description: ev.description || '',
                      date: ev.date ? ev.date.substring(0, 10) : '',
                      endDate: ev.endDate ? ev.endDate.substring(0, 10) : '',
                      dateLabel: ev.dateLabel || '',
                      time: ev.time || '',
                      location: ev.location || '',
                      vertical: ev.vertical || '',
                      category: ev.category || 'competition',
                      status: ev.status || 'upcoming',
                      featured: !!ev.featured,
                      highlights: Array.isArray(ev.highlights) ? [...ev.highlights] : [],
                      collab: ev.collab || '',
                      type: 'ytd',
                      image: ev.image || '',
                    });
                    setEditingId(ev.id);
                    setShowModal(true);
                  }}
                  className="shrink-0 w-52 bg-slate-50 border rounded-xl p-4 text-left hover:border-slate-300 transition-all group"
                  style={{ borderLeftColor: color, borderLeftWidth: 3, borderTopColor: '#E4E4E7', borderRightColor: '#E4E4E7', borderBottomColor: '#E4E4E7' }}
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-1 block" style={{ color }}>
                    {ev.vertical}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 mb-1.5">
                    {ev.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Edit2 size={9} /> Click to assign date
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <EventModal
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isSaving={isSaving}
          isEdit={!!editingId}
          onDelete={editingId ? () => { if (confirm('Delete this event permanently?')) handleDelete(); } : undefined}
        />
      )}
    </div>
  );
}
