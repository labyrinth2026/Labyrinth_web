import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { ApplicantRowData } from './ApplicantTable';

interface CSVImportModalProps {
  existingApplicants: ApplicantRowData[];
  onClose: () => void;
  onImportSuccess: () => void;
  onUpdateStatusAndNotes: (responseId: string, newStatus: string, newNotes?: string) => Promise<void>;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  existingApplicants,
  onClose,
  onImportSuccess,
  onUpdateStatusAndNotes,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [parsedRows, setParsedRows] = useState<Array<{ id: string; name: string; email: string; status: string; notes?: string; matched: boolean }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length <= 1) return;

    // Simple split helper handling quotes
    const parseRow = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const regIdx = headers.findIndex((h) => h.includes('reg') || h.includes('register'));
    const statusIdx = headers.findIndex((h) => h.includes('status'));
    const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('evaluation'));

    if (statusIdx === -1 && notesIdx === -1) {
      alert('CSV must contain a "Status" or "Notes" column.');
      return;
    }

    const matches: Array<{ id: string; name: string; email: string; status: string; notes?: string; matched: boolean }> = [];

    lines.slice(1).forEach((line) => {
      const row = parseRow(line);
      const email = emailIdx !== -1 ? row[emailIdx] : '';
      const reg = regIdx !== -1 ? row[regIdx] : '';
      const statusVal = statusIdx !== -1 ? row[statusIdx].toLowerCase().trim() : '';
      const notesVal = notesIdx !== -1 ? row[notesIdx] : undefined;

      // Find matching applicant by email or regNo
      const match = existingApplicants.find(
        (a) =>
          (email && a.applicantEmail.toLowerCase() === email.toLowerCase()) ||
          (reg && a.regNo && a.regNo.toLowerCase() === reg.toLowerCase())
      );

      if (match) {
        matches.push({
          id: match.id,
          name: match.applicantName,
          email: match.applicantEmail,
          status: statusVal || match.status,
          notes: notesVal !== undefined ? notesVal : match.notes,
          matched: true,
        });
      }
    });

    setParsedRows(matches);
  };

  const handleApplyImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    let count = 0;

    for (const row of parsedRows) {
      if (row.matched) {
        await onUpdateStatusAndNotes(row.id, row.status, row.notes);
        count++;
        setProgress(Math.round((count / parsedRows.length) * 100));
      }
    }

    setIsProcessing(false);
    onImportSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CD0000]/10 text-[#CD0000]">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-grotesk">CSV Import Status & Notes</h3>
              <p className="text-xs text-slate-500 font-medium">Bulk update candidate status and evaluation notes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-[#CD0000] rounded-2xl p-6 text-center space-y-2 transition-colors bg-slate-50/50">
          <Upload size={28} className="mx-auto text-slate-400" />
          <p className="text-xs font-bold text-slate-700">Upload CSV File</p>
          <p className="text-[11px] text-slate-400">CSV should include headers: Applicant Email (or Register No), Status, Internal Notes</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#CD0000] file:text-white hover:file:bg-[#A30000] cursor-pointer pt-2"
          />
        </div>

        {/* Preview Parsed */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Matched Candidates ({parsedRows.length})</span>
              <span className="text-emerald-600 text-[11px]">Ready to update</span>
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs font-medium bg-slate-50/50 p-2">
              {parsedRows.map((r, i) => (
                <div key={i} className="py-2 px-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{r.name}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({r.email})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            Cancel
          </button>

          <button
            onClick={handleApplyImport}
            disabled={parsedRows.length === 0 || isProcessing}
            className="px-5 py-2.5 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 disabled:opacity-40"
          >
            {isProcessing && <RefreshCw size={14} className="animate-spin" />}
            {isProcessing ? `Updating (${progress}%)` : `Apply CSV Updates (${parsedRows.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
