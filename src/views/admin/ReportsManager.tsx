import React, { useState, useEffect } from 'react';
import { fetchFromSheet } from '../../services/api';
import { FileText, Download, FileDown, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const ReportsManager: React.FC = () => {
  const [reportType, setReportType] = useState<'events' | 'team' | 'verticals'>('events');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
          ...(result.coreCommittee || []).map((m: any) => ({ ...m, role: 'Core' })),
          ...(result.verticalHeads || []).map((m: any) => ({ ...m, role: 'Head' })),
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
      head = ['Title', 'Date', 'Status', 'Category'];
      body = data.map(e => [
        e.title || '',
        e.date ? new Date(e.date).toLocaleDateString() : '',
        e.status || '',
        e.category || ''
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

  const generatePDF = () => {
    if (data.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const title = `Labyrinth ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      const { head, body } = getCleanTableData();

      (doc as any).autoTable({
        head: [head],
        body: body,
        startY: 30,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 91, 172], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

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
      const { head, body } = getCleanTableData();
      
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: head.map(h => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
              shading: { fill: "EAF4FF" }
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
            new Paragraph({
              text: `Labyrinth ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 }
            }),
            table
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
      
      // Map body and head to an array of objects for clean Excel export
      const excelData = body.map(row => {
        const rowObj: any = {};
        head.forEach((colName, idx) => {
          rowObj[colName] = row[idx];
        });
        return rowObj;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-adjust column widths
      const wscols = head.map(h => ({ wch: Math.max(h.length, 15) }));
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

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Reports & Exports</h1>
          <p className="text-[#667085] text-sm mt-0.5">Generate and download data reports in PDF, Excel, or Word.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 space-y-4">
            <h2 className="text-sm font-bold text-[#CD0000]">Select Data Source</h2>
            <div className="flex flex-col gap-2">
              {[
                { id: 'events', label: 'Events Database' },
                { id: 'team', label: 'Team Members' },
                { id: 'verticals', label: 'Verticals & Domains' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setReportType(opt.id as any)}
                  className={`px-4 py-3 text-left rounded-xl text-sm font-semibold transition-colors border ${
                    reportType === opt.id
                      ? 'bg-[rgba(205, 0, 0, 0.03)] border-[#CD0000] text-[#CD0000]'
                      : 'bg-white border-[#E5E7EB] text-[#667085] hover:border-[#CD0000]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3 mt-4">
               <h2 className="text-sm font-bold text-[#CD0000]">Export As</h2>
               <button onClick={generatePDF} disabled={isExporting || isLoading || data.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 font-semibold text-sm">
                  <FileText size={16} /> Export to PDF
               </button>
               <button onClick={generateWord} disabled={isExporting || isLoading || data.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[rgba(205, 0, 0, 0.03)] text-blue-600 border border-[#E5E7EB] rounded-xl hover:bg-[rgba(205, 0, 0, 0.05)] transition-colors disabled:opacity-50 font-semibold text-sm">
                  <FileText size={16} /> Export to Word (.docx)
               </button>
               <button onClick={generateExcel} disabled={isExporting || isLoading || data.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 border border-green-200 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 font-semibold text-sm">
                  <FileDown size={16} /> Export to Excel
               </button>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#CD0000]">Data Preview ({data.length} records)</h2>
              <button onClick={loadData} className="text-[#8c97a8] hover:text-[#CD0000]"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /></button>
            </div>
            
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-gray-50 h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-[#8c97a8]">
                   <RefreshCw size={24} className="animate-spin text-[#CD0000] mb-2" />
                   <span className="text-sm">Loading data...</span>
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#8c97a8] text-sm">
                   No data available.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[rgba(205, 0, 0, 0.03)] sticky top-0">
                    <tr>
                      {Object.keys(data[0]).slice(0, 4).map(key => (
                         <th key={key} className="p-3 font-semibold text-[#CD0000] capitalize">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] bg-white">
                    {data.map((item, i) => (
                      <tr key={i} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30">
                        {Object.keys(data[0]).slice(0, 4).map(key => (
                           <td key={key} className="p-3 text-[#667085] truncate max-w-[150px]">
                              {typeof item[key] === 'string' ? item[key] : JSON.stringify(item[key])}
                           </td>
                        ))}
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
