import React, { useState, useEffect } from 'react';
import { fetchFromSheet } from '@/services/api';
import { FileText, Download, FileDown, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, ImageRun, AlignmentType, BorderStyle } from 'docx';
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
          // Draw header logos and lines on every page
          if (labLogo) {
            doc.addImage(labLogo, 'PNG', 14, 8, 10, 10);
          }
          if (christLogo) {
            doc.addImage(christLogo, 'PNG', 161, 8, 35, 10);
          }
          
          // Header text
          doc.setFontSize(8);
          doc.setTextColor(102, 112, 133);
          doc.setFont("helvetica", "bold");
          doc.text(`LABYRINTH COMPUTER ACADEMY | CHRIST UNIVERSITY`, 28, 14.5);
          
          // Divider line
          doc.setDrawColor(229, 231, 235); // Border gray
          doc.setLineWidth(0.5);
          doc.line(14, 22, 196, 22);
          
          // Footer
          const pageCount = doc.getNumberOfPages();
          const str = `Page ${pageCount}`;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.setFont("helvetica", "normal");
          doc.text(str, 196 - doc.getTextWidth(str), 287);
          doc.text("Official Report Extraction | Labyrinth Computer Science Club", 14, 287);
        }
      });

      // Draw title on page 1 above the table
      doc.setPage(1);
      doc.setFontSize(14);
      doc.setTextColor(51, 65, 85); // Slate 700
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

      const borderNone = {
        style: BorderStyle.NONE,
        size: 0,
        color: "auto",
      };

      const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: borderNone,
          bottom: borderNone,
          left: borderNone,
          right: borderNone,
          insideHorizontal: borderNone,
          insideVertical: borderNone,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: labCellChildren,
                width: { size: 50, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: christCellChildren,
                width: { size: 50, type: WidthType.PERCENTAGE }
              })
            ]
          })
        ]
      });

      const docxTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: head.map(h => new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })]
                })
              ],
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

      // Top title and metadata rows
      const titleRow1 = ["LABYRINTH - COMPUTER SCIENCE CLUB"];
      const titleRow2 = ["CHRIST (Deemed to be University), Bengaluru"];
      const titleRow3 = [`Official ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`];
      const titleRow4 = [`Generated: ${new Date().toLocaleString()}`];
      const titleRow5: string[] = []; // Empty separator

      // Build worksheet data array
      const wsData = [
        titleRow1,
        titleRow2,
        titleRow3,
        titleRow4,
        titleRow5,
        head,
        ...body
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      // Merge titles across table column width
      const colCount = head.length;
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(colCount - 1, 2) } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(colCount - 1, 2) } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: Math.max(colCount - 1, 2) } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: Math.max(colCount - 1, 2) } }
      ];

      // Auto-adjust column widths based on table content
      const wscols = head.map((h, i) => {
        let maxLen = h.length;
        body.forEach(row => {
          if (row[i]) maxLen = Math.max(maxLen, row[i].length);
        });
        return { wch: Math.min(Math.max(maxLen + 2, 12), 40) }; // cap between 12 and 40 characters wide
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
