import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import {
  Plus, Edit2, Trash2, Copy, Link as LinkIcon, RefreshCw, Check,
  Download, Eye, Save, Calendar, Settings, ArrowLeft, FileText,
  Search, ChevronUp, ChevronDown, Upload, Mail, Filter, Loader2
} from 'lucide-react';

import { DashboardStats } from '@/components/admin/recruitment/DashboardStats';
import { SearchAndFilters } from '@/components/admin/recruitment/SearchAndFilters';
import { BulkActionToolbar } from '@/components/admin/recruitment/BulkActionToolbar';
import { ApplicantTable, ApplicantRowData } from '@/components/admin/recruitment/ApplicantTable';
import { ReviewDrawer } from '@/components/admin/recruitment/ReviewDrawer';
import { EmailComposerModal } from '@/components/admin/recruitment/EmailComposerModal';
import { StatusNotifyModal } from '@/components/admin/recruitment/StatusNotifyModal';
import { CSVImportModal } from '@/components/admin/recruitment/CSVImportModal';

interface CustomForm {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomFormField {
  id: string;
  fieldType: string;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  validation?: string;
}

interface CustomResponse {
  id: string;
  formId: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'shortlisted' | 'selected' | 'rejected' | 'interview_scheduled' | 'completed';
  notes?: string;
  submittedAt: string;
  answers: Record<string, any>;
}

export default function FormsManager() {
  const { user } = useAuth();

  // Views: 'list' | 'build' | 'responses'
  const [view, setView] = useState<'list' | 'build' | 'responses'>('list');
  const [loading, setLoading] = useState(true);

  const [origin, setOrigin] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Lists
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);

  // Builder state
  const [builderFields, setBuilderFields] = useState<CustomFormField[]>([]);
  const [formMeta, setFormMeta] = useState<Partial<CustomForm>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

  // Responses ATS state
  const [responses, setResponses] = useState<CustomResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerApplicant, setActiveDrawerApplicant] = useState<ApplicantRowData | null>(null);

  // Modal states
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<ApplicantRowData[]>([]);

  const [statusNotifyModalOpen, setStatusNotifyModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ applicant: ApplicantRowData; newStatus: string } | null>(null);

  const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);

  // Filter & Search controls
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    vertical: 'all',
    class: 'all',
    dateRange: 'all',
    sortBy: 'newest' as 'newest' | 'oldest' | 'alphabetical' | 'recently_updated',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadAllForms();
  }, []);

  const loadAllForms = async () => {
    setLoading(true);
    try {
      const res: any = await fetchFromSheet('getCustomForms');
      setForms(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract fields like Reg No, Class, Preferred Vertical from answer objects dynamically
  const formatResponsesForATS = useCallback(
    (rawResponses: CustomResponse[]): ApplicantRowData[] => {
      return rawResponses.map((r) => {
        let regNo = '';
        let className = '';
        let preferredVertical = '';

        // Iterate answers to match headers
        Object.entries(r.answers || {}).forEach(([fieldId, val]) => {
          const fieldDef = builderFields.find((f) => f.id === fieldId);
          const labelLower = (fieldDef?.label || '').toLowerCase();

          const valStr =
            typeof val === 'object' && val !== null
              ? Array.isArray(val)
                ? val.join(', ')
                : JSON.stringify(val)
              : String(val || '');

          if (labelLower.includes('reg') || labelLower.includes('register') || labelLower.includes('roll')) {
            regNo = valStr;
          } else if (labelLower.includes('class') || labelLower.includes('course') || labelLower.includes('section') || labelLower.includes('year')) {
            className = valStr;
          } else if (labelLower.includes('vertical') || labelLower.includes('domain') || labelLower.includes('department')) {
            preferredVertical = valStr;
          }
        });

        return {
          id: r.id,
          formId: r.formId,
          applicantName: r.applicantName,
          applicantEmail: r.applicantEmail,
          regNo: regNo || '—',
          className: className || '—',
          preferredVertical: preferredVertical || '—',
          status: r.status,
          notes: r.notes || '',
          submittedAt: r.submittedAt,
          answers: r.answers || {},
        };
      });
    },
    [builderFields]
  );

  const formattedApplicants = useMemo(() => {
    return formatResponsesForATS(responses);
  }, [responses, formatResponsesForATS]);

  // Derived filter lists
  const verticalsList = useMemo(() => {
    const set = new Set<string>();
    formattedApplicants.forEach((a) => {
      if (a.preferredVertical && a.preferredVertical !== '—') set.add(a.preferredVertical);
    });
    return Array.from(set).sort();
  }, [formattedApplicants]);

  const classList = useMemo(() => {
    const set = new Set<string>();
    formattedApplicants.forEach((a) => {
      if (a.className && a.className !== '—') set.add(a.className);
    });
    return Array.from(set).sort();
  }, [formattedApplicants]);

  // Filtered & Sorted Applicant List
  const filteredApplicants = useMemo(() => {
    let result = [...formattedApplicants];

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.applicantName.toLowerCase().includes(q) ||
          a.applicantEmail.toLowerCase().includes(q) ||
          a.regNo.toLowerCase().includes(q) ||
          a.className.toLowerCase().includes(q) ||
          a.preferredVertical.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q) ||
          (a.notes || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((a) => a.status === filters.status);
    }

    // Vertical filter
    if (filters.vertical !== 'all') {
      result = result.filter((a) => a.preferredVertical === filters.vertical);
    }

    // Class filter
    if (filters.class !== 'all') {
      result = result.filter((a) => a.className === filters.class);
    }

    // Submission Date filter
    if (filters.dateRange !== 'all') {
      const now = new Date().getTime();
      result = result.filter((a) => {
        const subTime = new Date(a.submittedAt).getTime();
        const diffDays = (now - subTime) / (1000 * 3600 * 24);
        if (filters.dateRange === 'today') return diffDays <= 1;
        if (filters.dateRange === '7days') return diffDays <= 7;
        if (filters.dateRange === '30days') return diffDays <= 30;
        return true;
      });
    }

    // Sort By
    result.sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (filters.sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (filters.sortBy === 'alphabetical') {
        return a.applicantName.localeCompare(b.applicantName);
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return result;
  }, [formattedApplicants, filters]);

  // Dashboard Stats Counts
  const statsCounts = useMemo(() => {
    return {
      total: responses.length,
      pending: responses.filter((r) => r.status === 'pending').length,
      shortlisted: responses.filter((r) => r.status === 'shortlisted').length,
      selected: responses.filter((r) => r.status === 'selected').length,
      rejected: responses.filter((r) => r.status === 'rejected').length,
    };
  }, [responses]);

  // --- ACTIONS & HANDLERS ---

  const handleOpenBuilder = async (formItem: CustomForm | null) => {
    if (formItem) {
      setSelectedForm(formItem);
      setFormMeta({ ...formItem });
      try {
        const res: any = await fetchFromSheet('getFormBySlug', { slug: formItem.slug });
        if (res && res.fields) {
          setBuilderFields(
            res.fields.map((f: any) => ({
              ...f,
              options: Array.isArray(f.options) ? f.options : f.options ? JSON.parse(f.options) : [],
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSelectedForm(null);
      setFormMeta({
        title: 'New Custom Form',
        description: 'Please describe the purpose of this form.',
        slug: `form-${Date.now()}`,
        status: 'draft',
        coverImage: '',
        startDate: '',
        endDate: '',
      });
      setBuilderFields([
        {
          id: `field_${Date.now()}_1`,
          fieldType: 'short_text',
          label: 'Applicant Full Name',
          placeholder: 'Enter your name',
          required: true,
        },
        {
          id: `field_${Date.now()}_2`,
          fieldType: 'email',
          label: 'University Email Address',
          placeholder: 'name@cs.christuniversity.in',
          required: true,
        },
      ]);
    }
    setView('build');
  };

  const handleOpenResponses = async (formItem: CustomForm) => {
    setSelectedForm(formItem);
    setLoading(true);
    try {
      const [fieldsRes, responsesRes]: [any, any] = await Promise.all([
        fetchFromSheet('getFormBySlug', { slug: formItem.slug }),
        fetchFromSheet('getFormResponses', { formId: formItem.id }),
      ]);

      if (fieldsRes && fieldsRes.fields) {
        setBuilderFields(
          fieldsRes.fields.map((f: any) => ({
            ...f,
            options: Array.isArray(f.options) ? f.options : f.options ? JSON.parse(f.options) : [],
          }))
        );
      }
      setResponses(responsesRes || []);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    setView('responses');
  };

  const handleAddField = (type: string) => {
    const newField: CustomFormField = {
      id: `field_${Date.now()}`,
      fieldType: type,
      label: type === 'section_divider' ? 'Section Header' : 'New Question',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    };
    setBuilderFields([...builderFields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<CustomFormField>) => {
    setBuilderFields(builderFields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleRemoveField = (id: string) => {
    setBuilderFields(builderFields.filter((f) => f.id !== id));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= builderFields.length) return;
    const nextFields = [...builderFields];
    const temp = nextFields[index];
    nextFields[index] = nextFields[nextIdx];
    nextFields[nextIdx] = temp;
    setBuilderFields(nextFields);
  };

  const handleSaveForm = async () => {
    if (!formMeta.title || !formMeta.slug) {
      alert('Title and Slug are required.');
      return;
    }
    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(formMeta.slug)) {
      alert('Slug must contain only lowercase letters, numbers, hyphens, and underscores.');
      return;
    }

    setIsSaving(true);
    setSaveProgress(15);
    setSaveStatus('Validating form structure...');

    // Progress timer to advance progress smoothly
    const progressTimer = setInterval(() => {
      setSaveProgress((prev) => {
        if (prev < 40) return prev + 10;
        if (prev < 70) return prev + 5;
        if (prev < 90) return prev + 2;
        return prev;
      });
    }, 120);

    try {
      setSaveStatus(selectedForm ? 'Preparing form updates...' : 'Creating new form definition...');
      setSaveProgress(40);

      const payloadFields = builderFields.map((f, i) => ({
        ...f,
        order: i,
        options: f.options ? f.options : null,
      }));

      setSaveStatus('Syncing fields and question schema...');
      setSaveProgress(65);

      if (selectedForm) {
        await fetchFromSheet('updateForm', {
          id: selectedForm.id,
          form: formMeta,
          fields: payloadFields,
        });
      } else {
        await fetchFromSheet('addForm', {
          form: {
            ...formMeta,
            createdBy: user?.id,
          },
          fields: payloadFields,
        });
      }

      setSaveStatus('Finalizing & publishing...');
      setSaveProgress(100);
      clearInterval(progressTimer);

      // Brief delay so the user clearly sees 100% completion
      await new Promise((resolve) => setTimeout(resolve, 400));

      setView('list');
      loadAllForms();
    } catch (err: any) {
      clearInterval(progressTimer);
      alert(err.message || 'Failed to save form.');
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
      setSaveStatus('');
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form and all its responses?')) return;
    setLoading(true);
    try {
      await fetchFromSheet('deleteForm', { id });
      loadAllForms();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDuplicateForm = async (id: string) => {
    setLoading(true);
    try {
      await fetchFromSheet('duplicateForm', { id });
      loadAllForms();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin || ''}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  // --- OPTIMISTIC STATUS & NOTES UPDATES ---

  const performStatusUpdate = async (responseId: string, newStatus: string, newNotes?: string) => {
    // Optimistically update React state immediately (0ms UI delay)
    setResponses((prev) =>
      prev.map((r) =>
        r.id === responseId
          ? { ...r, status: newStatus as any, notes: newNotes !== undefined ? newNotes : r.notes }
          : r
      )
    );

    if (activeDrawerApplicant && activeDrawerApplicant.id === responseId) {
      setActiveDrawerApplicant((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              notes: newNotes !== undefined ? newNotes : prev.notes,
            }
          : null
      );
    }

    // Background async sync to server API
    try {
      await fetchFromSheet('updateResponseStatus', {
        id: responseId,
        status: newStatus,
        notes: newNotes,
      });
    } catch (err) {
      console.error('Failed to sync response status with server:', err);
      // Refetch if error occurs
      if (selectedForm) {
        const res: any = await fetchFromSheet('getFormResponses', { formId: selectedForm.id });
        setResponses(res || []);
      }
    }
  };

  // Status Change Dialog Trigger
  const handleQuickStatusChange = (applicant: ApplicantRowData, newStatus: string) => {
    if (applicant.status === newStatus) return;
    setPendingStatusUpdate({ applicant, newStatus });
    setStatusNotifyModalOpen(true);
  };

  const handleConfirmNotify = () => {
    if (!pendingStatusUpdate) return;
    const { applicant, newStatus } = pendingStatusUpdate;
    performStatusUpdate(applicant.id, newStatus);
    setStatusNotifyModalOpen(false);
    setPendingStatusUpdate(null);

    // Open email composer prefilled
    setEmailRecipients([applicant]);
    setEmailModalOpen(true);
  };

  const handleConfirmSilent = () => {
    if (!pendingStatusUpdate) return;
    const { applicant, newStatus } = pendingStatusUpdate;
    performStatusUpdate(applicant.id, newStatus);
    setStatusNotifyModalOpen(false);
    setPendingStatusUpdate(null);
  };

  // Bulk Operations
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredApplicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplicants.map((a) => a.id));
    }
  };

  const handleChangeStatusBulk = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    // Optimistic bulk update
    setResponses((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: newStatus as any } : r))
    );

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetchFromSheet('updateResponseStatus', { id, status: newStatus })
        )
      );
    } catch (err) {
      console.error('Bulk status update error:', err);
    }
  };

  const handleSendEmailBulk = () => {
    const selectedList = formattedApplicants.filter((a) => selectedIds.includes(a.id));
    if (selectedList.length === 0) return;
    setEmailRecipients(selectedList);
    setEmailModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to remove ${selectedIds.length} candidate response(s)?`)) return;
    // Optimistic update
    const previousResponses = responses;
    setResponses((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    const deletedIds = [...selectedIds];
    setSelectedIds([]);
    try {
      await fetchFromSheet('deleteFormResponses', { ids: deletedIds });
    } catch (err) {
      console.error('Failed to delete form responses:', err);
      // Roll back optimistic update on failure
      setResponses(previousResponses);
      alert('Failed to delete the selected responses. Please try again.');
    }
  };

  // Email Sending Handler — opens Gmail compose in a new browser tab for each recipient
  const handleSendEmail = async (subject: string, body: string, recipients: ApplicantRowData[]) => {
    const resolveVariables = (template: string, candidate: ApplicantRowData) =>
      template
        .replace(/{{name}}/g, candidate.applicantName || 'Applicant')
        .replace(/{{email}}/g, candidate.applicantEmail || '')
        .replace(/{{register}}/g, candidate.regNo || 'N/A')
        .replace(/{{class}}/g, candidate.className || 'N/A')
        .replace(/{{vertical}}/g, candidate.preferredVertical || 'Club Domain');

    recipients.forEach((recipient, index) => {
      const resolvedSubject = resolveVariables(subject, recipient);
      const resolvedBody = resolveVariables(body, recipient);

      // Build Gmail compose URL — opens in the browser (same session / logged-in Gmail tab)
      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(recipient.applicantEmail)}` +
        `&su=${encodeURIComponent(resolvedSubject)}` +
        `&body=${encodeURIComponent(resolvedBody)}`;

      // Small stagger for bulk sends so the browser doesn't block multiple pop-ups
      setTimeout(() => {
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      }, index * 300);
    });
  };

  // Redesigned CSV Exporter with distinct readable question columns & UTF-8 BOM
  const handleExportCSV = (targetRows?: ApplicantRowData[]) => {
    const rowsToExport = targetRows || filteredApplicants;
    if (!selectedForm || rowsToExport.length === 0) return;

    // Readable Headers
    const headers = [
      'Submission Date',
      'Applicant Name',
      'Register Number',
      'Class',
      'Applicant Email',
      'Preferred Vertical',
      'Status',
      'Internal Notes',
    ];

    // Every form question becomes its own readable header
    builderFields.forEach((f) => {
      if (f.fieldType !== 'section_divider') {
        headers.push(f.label);
      }
    });

    const csvLines = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',')];

    rowsToExport.forEach((r) => {
      const row = [
        `"${new Date(r.submittedAt).toLocaleString()}"`,
        `"${r.applicantName.replace(/"/g, '""')}"`,
        `"${(r.regNo || '').replace(/"/g, '""')}"`,
        `"${(r.className || '').replace(/"/g, '""')}"`,
        `"${r.applicantEmail.replace(/"/g, '""')}"`,
        `"${(r.preferredVertical || '').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ];

      builderFields.forEach((f) => {
        if (f.fieldType !== 'section_divider') {
          const ans = r.answers[f.id];
          const ansString = ans
            ? typeof ans === 'object'
              ? ans.dataUrl
                ? ans.name
                : Array.isArray(ans)
                ? ans.join('; ')
                : JSON.stringify(ans)
              : ans
            : '';
          row.push(`"${String(ansString).replace(/"/g, '""')}"`);
        }
      });

      csvLines.push(row.join(','));
    });

    // Add UTF-8 Byte Order Mark (\uFEFF) for perfect Excel compatibility
    const csvContent = '\uFEFF' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedForm.slug}_recruitment_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      closed: 'bg-red-50 text-red-500 border-red-100',
      archived: 'bg-slate-100 text-slate-400 border-slate-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const inputClass =
    'w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400 bg-white disabled:opacity-50';

  return (
    <div className="space-y-6 font-inter">
      {/* 1. LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-xs">
            <div>
              <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Forms Management</h1>
              <p className="text-[#667085] text-sm mt-0.5">Build custom forms, manage ATS recruitment pipelines, and export candidate data.</p>
            </div>
            <button
              onClick={() => handleOpenBuilder(null)}
              className="px-4 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus size={15} /> Create Form
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-500">
              <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
              Fetching forms directory...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-extrabold text-slate-800 text-base">{form.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{form.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-medium w-full">
                      <LinkIcon size={12} className="shrink-0" />
                      <a
                        href={`/forms/${form.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:underline text-[#CD0000] font-bold max-w-[80%]"
                      >
                        {origin ? `${origin}/forms/${form.slug}` : `/forms/${form.slug}`}
                      </a>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopyLink(form.slug);
                        }}
                        className="p-1 hover:text-[#CD0000] transition-colors rounded-md flex items-center justify-center shrink-0"
                        title="Copy Link"
                      >
                        {copiedSlug === form.slug ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-2">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenBuilder(form)}
                        className="p-2 text-slate-500 hover:text-[#CD0000] hover:bg-slate-50 rounded-xl transition-all"
                        title="Edit Form fields"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicateForm(form.id)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                        title="Duplicate Form"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Form"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenResponses(form)}
                      className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <FileText size={12} className="text-[#CD0000]" />
                      Manage ATS Responses
                    </button>
                  </div>
                </div>
              ))}
              {forms.length === 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center text-slate-400 col-span-2">
                  No custom forms created yet. Click "Create Form" to start.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 2. BUILDER VIEW */}
      {view === 'build' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs relative overflow-hidden">
            {/* Top edge animated progress bar when saving */}
            {isSaving && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-100 overflow-hidden">
                <div 
                  className="h-full bg-[#CD0000] transition-all duration-300 ease-out"
                  style={{ width: `${saveProgress}%` }}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('list')}
                  disabled={isSaving}
                  className="p-2 text-slate-500 hover:text-[#CD0000] hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">
                    {selectedForm ? 'Edit Custom Form' : 'Create Custom Form'}
                  </h1>
                  <p className="text-[#667085] text-sm mt-0.5">Configure form settings and design input fields.</p>
                </div>
              </div>
              <button
                onClick={handleSaveForm}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-white" />
                    <span>Saving... ({saveProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save Form</span>
                  </>
                )}
              </button>
            </div>

            {/* Detailed progress indicator bar inside header */}
            {isSaving && (
              <div className="mt-4 pt-3 border-t border-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-[#CD0000]" />
                    {saveStatus || 'Saving form...'}
                  </span>
                  <span className="font-mono font-bold text-[#CD0000]">{saveProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#CD0000] to-[#E02424] rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${saveProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Form Settings */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4 self-start">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Settings size={14} className="text-[#CD0000]" />
                Form Settings
              </h3>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Form Title *</label>
                <input
                  type="text"
                  required
                  value={formMeta.title || ''}
                  onChange={(e) => setFormMeta({ ...formMeta, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Club Recruitment 2026"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formMeta.description || ''}
                  onChange={(e) => setFormMeta({ ...formMeta, description: e.target.value })}
                  className={inputClass}
                  placeholder="Provide instructions for applicants..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Public Slug *</label>
                  <input
                    type="text"
                    required
                    value={formMeta.slug || ''}
                    onChange={(e) => setFormMeta({ ...formMeta, slug: e.target.value })}
                    className={inputClass}
                    placeholder="recruitment-2026"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                  <select
                    value={formMeta.status || 'draft'}
                    onChange={(e) => setFormMeta({ ...formMeta, status: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Cover Image / Banner Upload & URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Form Cover Banner (Optional)
                  </label>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Rec: 1200 × 400 px (3:1)
                  </span>
                </div>

                {/* Banner Preview */}
                {formMeta.coverImage ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-xs group/banner">
                    <img
                      src={formMeta.coverImage}
                      alt="Form banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormMeta({ ...formMeta, coverImage: '' })}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all"
                      >
                        Remove Banner
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors text-center">
                    <Upload size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Click to upload cover banner</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Recommended size: 1200 × 400 px (PNG, JPG, WebP — max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size exceeds 5MB limit.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormMeta({ ...formMeta, coverImage: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}

                {/* Direct Image URL input */}
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Or paste Image URL
                  </span>
                  <input
                    type="url"
                    value={formMeta.coverImage || ''}
                    onChange={(e) => setFormMeta({ ...formMeta, coverImage: e.target.value })}
                    className={inputClass}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formMeta.startDate ? formMeta.startDate.substring(0, 16) : ''}
                    onChange={(e) => setFormMeta({ ...formMeta, startDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={formMeta.endDate ? formMeta.endDate.substring(0, 16) : ''}
                    onChange={(e) => setFormMeta({ ...formMeta, endDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Right Col: Fields Designer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex justify-between items-center gap-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Form Questions &amp; Fields</h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Short Text', type: 'short_text' },
                    { label: 'Paragraph', type: 'long_text' },
                    { label: 'Dropdown', type: 'dropdown' },
                    { label: 'Radio Buttons', type: 'radio_buttons' },
                    { label: 'Checkboxes', type: 'checkboxes' },
                    { label: 'File Upload', type: 'file_upload' },
                    { label: 'Section Divider', type: 'section_divider' },
                  ].map((btn) => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => handleAddField(btn.type)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-bold uppercase rounded-lg transition-all"
                    >
                      + {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {builderFields.map((field, index) => (
                <div key={field.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs relative group space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#CD0000]">
                      Question #{index + 1} &mdash; {field.fieldType.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => handleMoveField(index, 'up')} className="p-1 hover:text-[#CD0000] rounded">
                        <ChevronUp size={14} />
                      </button>
                      <button type="button" onClick={() => handleMoveField(index, 'down')} className="p-1 hover:text-[#CD0000] rounded">
                        <ChevronDown size={14} />
                      </button>
                      <button type="button" onClick={() => handleRemoveField(field.id)} className="p-1 text-red-400 hover:text-red-600 rounded ml-2">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Field Label / Question Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. What is your preferred Vertical Domain?"
                      />
                    </div>

                    {field.fieldType !== 'section_divider' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                          className={inputClass}
                          placeholder="Short helper placeholder..."
                        />
                      </div>
                    )}
                  </div>

                  {field.fieldType !== 'section_divider' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Question Description
                        </label>
                        <input
                          type="text"
                          value={field.description || ''}
                          onChange={(e) => handleUpdateField(field.id, { description: e.target.value })}
                          className={inputClass}
                          placeholder="Context instructions below question..."
                        />
                      </div>

                      <div className="flex items-center gap-6 pt-5">
                        <label className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 text-[#CD0000] border-slate-300 rounded focus:ring-[#CD0000]/15"
                          />
                          Response Required
                        </label>
                      </div>
                    </div>
                  )}

                  {['dropdown', 'radio_buttons', 'checkboxes'].includes(field.fieldType) && (
                    <div className="pt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                        Choices Options List (One per line) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={field.options?.join('\n') || ''}
                        onChange={(e) => handleUpdateField(field.id, { options: e.target.value.split('\n') })}
                        className={inputClass}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}
                </div>
              ))}
              {builderFields.length === 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-400">
                  Form has no questions yet. Click any field type button above to add.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. REDESIGNED RECRUITMENT ATS DASHBOARD VIEW */}
      {view === 'responses' && selectedForm && (
        <div className="space-y-5">
          {/* ATS Top Header */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('list')}
                className="p-2 text-slate-500 hover:text-[#CD0000] hover:bg-slate-50 rounded-xl transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#CD0000] block mb-0.5">
                  Applicant Tracking System (ATS)
                </span>
                <h1 className="text-xl font-bold font-grotesk text-slate-900">{selectedForm.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCsvImportModalOpen(true)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Upload size={14} className="text-blue-600" /> Import CSV
              </button>

              <button
                onClick={() => handleExportCSV()}
                disabled={responses.length === 0}
                className="px-4 py-2 bg-[#CD0000] text-white hover:bg-[#A30000] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Section 1: Dashboard Statistics Cards */}
          <DashboardStats
            total={statsCounts.total}
            pending={statsCounts.pending}
            shortlisted={statsCounts.shortlisted}
            selected={statsCounts.selected}
            rejected={statsCounts.rejected}
            activeStatusFilter={filters.status}
            onSelectFilter={(st) => setFilters((prev) => ({ ...prev, status: st }))}
          />

          {/* Section 2 & 3: Search & Filters Bar */}
          <SearchAndFilters
            filters={filters}
            onFilterChange={(updates) => {
              setFilters((prev) => ({ ...prev, ...updates }));
              setCurrentPage(1);
            }}
            onClearFilters={() => {
              setFilters({
                search: '',
                status: 'all',
                vertical: 'all',
                class: 'all',
                dateRange: 'all',
                sortBy: 'newest',
              });
              setCurrentPage(1);
            }}
            verticalsList={verticalsList}
            classList={classList}
            totalResults={filteredApplicants.length}
          />

          {/* Section 5 & 6: Applicant Table */}
          {loading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-500">
              <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
              Loading applicant pool...
            </div>
          ) : (
            <ApplicantTable
              applicants={filteredApplicants}
              selectedIds={selectedIds}
              onToggleSelectRow={handleToggleSelectRow}
              onToggleSelectAll={handleToggleSelectAll}
              onOpenDrawer={(app) => setActiveDrawerApplicant(app)}
              onOpenEmailComposer={(app) => {
                setEmailRecipients([app]);
                setEmailModalOpen(true);
              }}
              onChangeStatusQuick={handleQuickStatusChange}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          )}

          {/* Section 4: Floating Bulk Action Toolbar */}
          <BulkActionToolbar
            selectedCount={selectedIds.length}
            totalCount={filteredApplicants.length}
            onSelectAll={() => setSelectedIds(filteredApplicants.map((a) => a.id))}
            onClearSelection={() => setSelectedIds([])}
            onChangeStatusBulk={handleChangeStatusBulk}
            onSendEmailBulk={handleSendEmailBulk}
            onExportSelected={() => {
              const selectedList = formattedApplicants.filter((a) => selectedIds.includes(a.id));
              handleExportCSV(selectedList);
            }}
            onDeleteSelected={handleDeleteSelected}
          />

          {/* Section 7: Review Drawer */}
          <ReviewDrawer
            applicant={activeDrawerApplicant}
            builderFields={builderFields}
            onClose={() => setActiveDrawerApplicant(null)}
            onSaveNotes={performStatusUpdate}
            onOpenEmailComposer={(app) => {
              setEmailRecipients([app]);
              setEmailModalOpen(true);
            }}
          />

          {/* Section 8 & 9: Email Composer Modal */}
          {emailModalOpen && (
            <EmailComposerModal
              recipients={emailRecipients}
              onClose={() => setEmailModalOpen(false)}
              onSend={handleSendEmail}
            />
          )}

          {/* Section 16: Status Notification Prompt Modal */}
          {statusNotifyModalOpen && pendingStatusUpdate && (
            <StatusNotifyModal
              applicant={pendingStatusUpdate.applicant}
              newStatus={pendingStatusUpdate.newStatus}
              onConfirmNotify={handleConfirmNotify}
              onConfirmSilent={handleConfirmSilent}
              onCancel={() => {
                setStatusNotifyModalOpen(false);
                setPendingStatusUpdate(null);
              }}
            />
          )}

          {/* Section 11: CSV Import Modal */}
          {csvImportModalOpen && (
            <CSVImportModal
              existingApplicants={formattedApplicants}
              onClose={() => setCsvImportModalOpen(false)}
              onImportSuccess={() => {
                if (selectedForm) {
                  fetchFromSheet('getFormResponses', { formId: selectedForm.id }).then((res: any) => {
                    setResponses(res || []);
                  });
                }
              }}
              onUpdateStatusAndNotes={performStatusUpdate}
            />
          )}
        </div>
      )}
    </div>
  );
}
