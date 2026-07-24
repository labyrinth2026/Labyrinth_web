import React, { useState, useEffect } from 'react';
import { fetchFromSheet } from '@/services/api';
import { FileText, Download, FileDown, RefreshCw, FileCode, CheckCircle2, Layers, Users, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, ImageRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { generateEventWordReport, generateSampleReportTemplate } from '@/utils/generateEventWordReport';

const ReportsManager: React.FC = () => {
  const [reportType, setReportType] = useState<'events' | 'team' | 'verticals'>('events');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingEventId, setExportingEventId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let action = 'getEvents';
      if (reportType === 'team') action = 'getTeam';
      if (reportType === 'verticals') action = 'getVerticals';

      const result: any = await fetchFromSheet(action);
      
      // Normalize data to array
      if (reportType === 'team' && !Array.isArray(result)) {
        const teamMembers = [
          ...(result.facultyCoordinators || []).map((m: any) => ({ ...m, role: 'Faculty' })),
          ...(result.mentors || []).map((m: any) => ({ ...m, role: 'Mentor' })),
          ...(result.coreCommittee || []).map((m: any) => ({ ...m, role: 'Core Committee' })),
          ...(result.verticalHeads || []).map((m: any) => ({ ...m, role: 'Vertical Head' })),
          ...(result.subHeads || []).map((m: any) => ({ ...m, role: 'Sub-Head' })),
        ];
        setData(teamMembers);
      } else {
        setData(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [reportType]);

  const getCleanTableData = () => {
    let head: string[] = [];
    let body: string[][] = [];

    if (reportType === 'events') {
      head = ['Title', 'Date', 'Status', 'Location'];
      body = data.map(e => [
        e.title || '',
        e.date ? new Date(e.date).toLocaleDateString('en-GB') : '',
        e.status || 'upcoming',
        e.location || '—'
      ]);
    } else if (reportType === 'team') {
      head = ['Name', 'Role', 'Email', 'Position'];
      body = data.map(m => [
        m.name || '',
        m.role || '',
        m.email || '',
        m.position || m.designation || ''
      ]);
    } else if (reportType === 'verticals') {
      head = ['Name', 'Category', 'Description'];
      body = data.map(v => [
        v.name || '',
        v.category || '',
        (v.description || '').replace(/\n/g, ' ')
      ]);
    }
    
    return { head, body };
  };

  const getLogoBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error(`Failed to load logo base64: ${url}`, e);
      return null;
    }
  };

  const getLogoArrayBuffer = async (url: string): Promise<ArrayBuffer | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.arrayBuffer();
    } catch (e) {
      console.error(`Failed to load logo buffer: ${url}`, e);
      return null;
    }
  };

  const generatePDF = async () => {
    if (data.length === 0) return;
    setIsExporting(true);
    try {
      const [labLogo, christLogo] = await Promise.all([
        getLogoBase64('/labyrinth-logo.png'),
        getLogoBase64('/christ-logo.png')
      ]);

      const doc = new jsPDF();
      const title = `Labyrinth ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      const { head, body } = getCleanTableData();

      autoTable(doc, {
        head: [head],
        body: body,
        startY: 40,
        margin: { top: 28, bottom: 20, left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 3.5, font: 'helvetica' },
        headStyles: { fillColor: [205, 0, 0], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        didDrawPage: (data: any) => {
          if (labLogo) doc.addImage(labLogo, 'PNG', 14, 8, 10, 10);
          if (christLogo) doc.addImage(christLogo, 'PNG', 161, 8, 35, 10);
          
          doc.setFontSize(8);
          doc.setTextColor(102, 112, 133);
          doc.setFont("helvetica", "bold");
          doc.text(`LABYRINTH COMPUTER ACADEMY | CHRIST UNIVERSITY`, 28, 14.5);
          
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.5);
          doc.line(14, 22, 196, 22);
          
          const pageCount = doc.getNumberOfPages();
          const str = `Page ${pageCount}`;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.setFont("helvetica", "normal");
          doc.text(str, 196 - doc.getTextWidth(str), 287);
          doc.text("Official Report Extraction | Labyrinth Computer Science Club", 14, 287);
        }
      });

      doc.setPage(1);
      doc.setFontSize(14);
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, 32);

      doc.save(`labyrinth_${reportType}_report.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF');
    }
    setIsExporting(false);
  };

  const generateWord = async () => {
    if (data.length === 0) return;
    setIsExporting(true);
    try {
      const [labLogoBuffer, christLogoBuffer] = await Promise.all([
        getLogoArrayBuffer('/labyrinth-logo.png'),
        getLogoArrayBuffer('/christ-logo.png')
      ]);

      const { head, body } = getCleanTableData();

      const labCellChildren: any[] = [];
      if (labLogoBuffer) {
        labCellChildren.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: labLogoBuffer,
                transformation: { width: 40, height: 40 },
                type: 'png'
              })
            ]
          })
        );
      } else {
        labCellChildren.push(new Paragraph({ text: "Labyrinth Club" }));
      }

      const christCellChildren: any[] = [];
      if (christLogoBuffer) {
        christCellChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new ImageRun({
                data: christLogoBuffer,
                transformation: { width: 140, height: 40 },
                type: 'png'
              })
            ]
          })
        );
      } else {
        christCellChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            text: "Christ University"
          })
        );
      }

      const borderNone = { style: BorderStyle.NONE, size: 0, color: "auto" };

      const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: borderNone, bottom: borderNone, left: borderNone, right: borderNone,
          insideHorizontal: borderNone, insideVertical: borderNone,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: labCellChildren, width: { size: 50, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: christCellChildren, width: { size: 50, type: WidthType.PERCENTAGE } })
            ]
          })
        ]
      });

      const docxTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: head.map(h => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })] })],
              shading: { fill: "CD0000" }
            }))
          }),
          ...body.map(row => new TableRow({
            children: row.map(cell => new TableCell({
              children: [new Paragraph({ text: cell })]
            }))
          }))
        ]
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            headerTable,
            new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
            new Paragraph({
              text: `Labyrinth ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 }
            }),
            docxTable
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `labyrinth_${reportType}_report.docx`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate Word document');
    }
    setIsExporting(false);
  };

  const generateExcel = () => {
    if (data.length === 0) return;
    setIsExporting(true);
    try {
      const { head, body } = getCleanTableData();

      const titleRow1 = ["LABYRINTH - COMPUTER SCIENCE CLUB"];
      const titleRow2 = ["CHRIST (Deemed to be University), Bengaluru"];
      const titleRow3 = [`Official ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`];
      const titleRow4 = [`Generated: ${new Date().toLocaleString()}`];
      const titleRow5: string[] = [];

      const wsData = [titleRow1, titleRow2, titleRow3, titleRow4, titleRow5, head, ...body];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      const colCount = head.length;
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(colCount - 1, 2) } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(colCount - 1, 2) } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: Math.max(colCount - 1, 2) } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: Math.max(colCount - 1, 2) } }
      ];

      const wscols = head.map((h, i) => {
        let maxLen = h.length;
        body.forEach(row => {
          if (row[i]) maxLen = Math.max(maxLen, row[i].length);
        });
        return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
      });
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `labyrinth_${reportType}_report.xlsx`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate Excel');
    }
    setIsExporting(false);
  };

  const handleSingleEventReport = async (eventItem: any) => {
    setExportingEventId(eventItem.id || 'current');
    try {
      await generateEventWordReport(eventItem);
    } catch (e) {
      alert('Failed to generate event report');
    } finally {
      setExportingEventId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Reports & Document Extraction</h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate official CHRIST Department of Computer Science Activity Reports and data extracts.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
          <button 
            onClick={() => generateSampleReportTemplate()}
            className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-xs font-semibold rounded-xl hover:bg-[#A30000] transition-colors shadow-sm"
          >
            <FileDown size={14} /> Download Sample Report Structure (.docx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Source Selector & Export Options */}
        <div className="space-y-6">
          {/* Data Source Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Select Data Source</h2>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'events', label: 'Events Database', icon: Calendar, count: data.length },
                { id: 'team', label: 'Team Members', icon: Users },
                { id: 'verticals', label: 'Verticals & Domains', icon: Layers }
              ].map(opt => {
                const Icon = opt.icon;
                const isActive = reportType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setReportType(opt.id as any)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold transition-all border text-left ${
                      isActive
                        ? 'bg-red-50/60 border-[#CD0000] text-[#CD0000] shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-[#CD0000]' : 'text-slate-400'} />
                      <span>{opt.label}</span>
                    </div>
                    {isActive && <CheckCircle2 size={15} className="text-[#CD0000]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official CHRIST Activity Report Options (If Events is selected) */}
          {reportType === 'events' && (
            <div className="bg-gradient-to-br from-blue-50/80 to-slate-50 border border-blue-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div>
                <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileDown size={14} className="text-blue-600" /> Official CHRIST Activity Reports
                </h2>
                <p className="text-[11px] text-blue-700 mt-1">Export formatted Word (.docx) documents following the official CHRIST Department format.</p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => generateSampleReportTemplate()}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-blue-200 text-blue-800 rounded-xl hover:bg-blue-100/60 transition-colors text-xs font-bold shadow-xs group"
                >
                  <span className="flex items-center gap-2">
                    <FileDown size={14} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    Download Sample Structure (.docx)
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-mono">Template</span>
                </button>

                <button
                  onClick={async () => {
                    setIsExporting(true);
                    for (const evt of data) {
                      await generateEventWordReport(evt);
                    }
                    setIsExporting(false);
                  }}
                  disabled={isExporting || isLoading || data.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs font-bold shadow-sm"
                >
                  {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <FileDown size={14} />}
                  Batch Download All Event Word Reports ({data.length})
                </button>
              </div>
            </div>
          )}

          {/* Raw Table Export Options */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Table Data Extracts</h2>
            <div className="space-y-2">
              <button
                onClick={generatePDF}
                disabled={isExporting || isLoading || data.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100/60 transition-colors disabled:opacity-50 font-bold text-xs"
              >
                <FileText size={14} /> Export Table to PDF
              </button>

              <button
                onClick={generateWord}
                disabled={isExporting || isLoading || data.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 font-bold text-xs"
              >
                <FileText size={14} /> Export Table to Word (.docx)
              </button>

              <button
                onClick={generateExcel}
                disabled={isExporting || isLoading || data.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100/60 transition-colors disabled:opacity-50 font-bold text-xs"
              >
                <FileDown size={14} /> Export Table to Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Data Preview & Individual Event Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[520px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Data Preview</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                  {data.length} records
                </span>
              </div>
              <button 
                onClick={loadData} 
                className="p-1.5 text-slate-400 hover:text-[#CD0000] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                title="Refresh Data"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 bg-white">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <RefreshCw size={24} className="animate-spin text-[#CD0000] mb-2" />
                  <span className="text-xs font-medium">Fetching dataset records...</span>
                </div>
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs font-medium">
                  No records found in this dataset.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                    {reportType === 'events' ? (
                      <tr>
                        <th className="p-3.5 pl-4">Event Title</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Venue / Location</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-4 text-right">CHRIST Activity Report</th>
                      </tr>
                    ) : reportType === 'team' ? (
                      <tr>
                        <th className="p-3.5 pl-4">Name</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5 pr-4">Designation</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-3.5 pl-4">Vertical Name</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5 pr-4">Description</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportType === 'events' && data.map((item, i) => (
                      <tr key={item.id || i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-bold text-slate-900 max-w-[220px] truncate">{item.title || 'Untitled'}</td>
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">{item.date ? new Date(item.date).toLocaleDateString('en-GB') : '—'}</td>
                        <td className="p-3.5 text-slate-500 max-w-[150px] truncate">{item.location || '—'}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            item.status === 'upcoming' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {item.status || 'upcoming'}
                          </span>
                        </td>
                        <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleSingleEventReport(item)}
                            disabled={exportingEventId === item.id}
                            className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                            title="Download official Word Activity Report (.docx)"
                          >
                            {exportingEventId === item.id ? (
                              <RefreshCw size={13} className="animate-spin text-blue-600" />
                            ) : (
                              <FileDown size={13} className="text-blue-600" />
                            )}
                            <span>Report (.docx)</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {reportType === 'team' && data.map((item, i) => (
                      <tr key={item.id || i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-bold text-slate-900">{item.name || '—'}</td>
                        <td className="p-3.5 text-slate-600">{item.role || '—'}</td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{item.email || '—'}</td>
                        <td className="p-3.5 pr-4 text-slate-500">{item.position || item.designation || '—'}</td>
                      </tr>
                    ))}

                    {reportType === 'verticals' && data.map((item, i) => (
                      <tr key={item.id || i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-bold text-slate-900">{item.name || '—'}</td>
                        <td className="p-3.5 text-slate-600 uppercase font-semibold text-[10px]">{item.category || '—'}</td>
                        <td className="p-3.5 pr-4 text-slate-500 max-w-[300px] truncate">{item.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
