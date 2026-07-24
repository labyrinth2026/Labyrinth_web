import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, ImageRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export interface EventReportData {
  id?: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  banner?: string;
  bannerUrl?: string;
  category?: string;
  vertical?: string;
  
  // Extended Activity Report Fields
  activityType?: string;
  collaboration?: string;
  participantsType?: string;
  participantCount?: string | number;
  highlights?: string[];
  keyTakeaways?: string[];
  summary?: string;
  followUpPlan?: string;
  rapporteurName?: string;
  rapporteurEmail?: string;
  rapporteurContact?: string;
  descriptiveReport?: string;
  participantList?: string[];
  geotaggedPhotos?: string[];
  posterUrl?: string;
}

const getArrayBufferFromUrl = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (e) {
    console.error(`Failed to fetch image from ${url}:`, e);
    return null;
  }
};

/**
 * Generates an Activity Report Word document populated STRICTLY with actual event data.
 * No hardcoded dummy/sample values are injected.
 */
export const generateEventWordReport = async (event: EventReportData, customFilename?: string) => {
  try {
    const [christLogoBuf, labLogoBuf] = await Promise.all([
      getArrayBufferFromUrl('/christ-logo.png'),
      getArrayBufferFromUrl('/labyrinth-logo.png')
    ]);

    // Format actual date or dash
    let formattedDate = '—';
    if (event.date) {
      try {
        const d = new Date(event.date);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } else {
          formattedDate = event.date;
        }
      } catch (e) {
        formattedDate = event.date;
      }
    }

    const title = event.title || 'Untitled Event';
    const formattedTime = event.time || '—';
    const venue = event.location || '—';
    const activityType = event.activityType || '—';
    const collaboration = event.collaboration || '—';
    const participantsType = event.participantsType || '—';
    const participantCount = (event.participantCount !== undefined && event.participantCount !== null && event.participantCount !== '') 
      ? String(event.participantCount) 
      : '—';

    const highlights = (event.highlights && event.highlights.length > 0 && event.highlights.some(h => h.trim()))
      ? event.highlights.filter(h => h.trim())
      : ['—'];

    const keyTakeaways = (event.keyTakeaways && event.keyTakeaways.length > 0 && event.keyTakeaways.some(k => k.trim()))
      ? event.keyTakeaways.filter(k => k.trim())
      : ['—'];

    const summary = event.summary || event.description || '—';
    const followUpPlan = event.followUpPlan || '—';

    const rapporteurName = event.rapporteurName || '—';
    const rapporteurEmail = event.rapporteurEmail || '';
    const rapporteurContact = event.rapporteurContact || '';
    const rapporteurContactInfo = [rapporteurEmail, rapporteurContact].filter(Boolean).join('\n') || '—';

    const descriptiveReport = event.descriptiveReport || event.description || '—';

    // Standard border setup
    const borderSingle = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
    const bordersAll = { top: borderSingle, bottom: borderSingle, left: borderSingle, right: borderSingle };

    // Header logos table
    const logoCells: TableCell[] = [];
    if (christLogoBuf) {
      logoCells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [new ImageRun({ data: christLogoBuf, transformation: { width: 140, height: 40 }, type: 'png' })]
            })
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.NONE, size: 0, color: "auto" }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } }
        })
      );
    } else {
      logoCells.push(
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "CHRIST (Deemed to be University)", bold: true, color: "002B49" })] })],
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.NONE, size: 0, color: "auto" }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } }
        })
      );
    }

    if (labLogoBuf) {
      logoCells.push(
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new ImageRun({ data: labLogoBuf, transformation: { width: 40, height: 40 }, type: 'png' })]
            })
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.NONE, size: 0, color: "auto" }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } }
        })
      );
    } else {
      logoCells.push(
        new TableCell({
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Labyrinth Club", bold: true, color: "CD0000" })] })],
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.NONE, size: 0, color: "auto" }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } }
        })
      );
    }

    const headerLogoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: logoCells })]
    });

    const createTableRow = (label: string, value: string | string[]) => {
      const valueParagraphs: Paragraph[] = Array.isArray(value)
        ? value.map(item => new Paragraph({
            children: [new TextRun({ text: item, size: 20, font: "Calibri" })],
            spacing: { after: 60 }
          }))
        : value.split('\n').map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 20, font: "Calibri" })],
            spacing: { after: 60 }
          }));

      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: "Calibri", color: "1E293B" })] })],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: "F8FAFC" },
            borders: bordersAll,
            margins: { top: 100, bottom: 100, left: 120, right: 120 }
          }),
          new TableCell({
            children: valueParagraphs,
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: bordersAll,
            margins: { top: 100, bottom: 100, left: 120, right: 120 }
          })
        ]
      });
    };

    const createHeaderRow = (titleText: string) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: titleText, bold: true, size: 22, color: "FFFFFF", font: "Calibri" })]
              })
            ],
            columnSpan: 2,
            shading: { fill: "800000" },
            borders: bordersAll,
            margins: { top: 120, bottom: 120, left: 140, right: 140 }
          })
        ]
      });
    };

    const mainReportTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createHeaderRow("General Information"),
        createTableRow("Type of Activity", activityType),
        createTableRow("Title of the Activity", title),
        createTableRow("Date/s", formattedDate),
        createTableRow("Time", formattedTime),
        createTableRow("Venue", venue),
        createTableRow("Collaboration/Sponsor (if any)", collaboration),

        createHeaderRow("Participants profile"),
        createTableRow("Type of Participants", participantsType),
        createTableRow("No. of Participants", participantCount),

        createHeaderRow("Synopsis of the Activity (Description)"),
        createTableRow("Highlights of the Activity", highlights),
        createTableRow("Key Takeaways", keyTakeaways),
        createTableRow("Summary of the Activity", summary),
        createTableRow("Follow-up Plan, if any", followUpPlan),

        createHeaderRow("Rapporteur"),
        createTableRow("Name of the Rapporteur", rapporteurName),
        createTableRow("Email and Contact No", rapporteurContactInfo)
      ]
    });

    const section1Title = new Paragraph({
      text: "1. Descriptive report of the event",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 120 }
    });

    const descriptiveParagraphs = descriptiveReport.split('\n\n').map(pText => 
      new Paragraph({
        children: [new TextRun({ text: pText, size: 22, font: "Calibri" })],
        spacing: { after: 160 },
        alignment: AlignmentType.JUSTIFIED
      })
    );

    const section2Title = new Paragraph({
      text: "2. Geotagged Photos of the Activity",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 120 }
    });

    const photoPlaceholder = new Paragraph({
      children: [
        new TextRun({ text: "[ Geotagged Event Photographs ]", italics: true, color: "64748B", size: 20 })
      ],
      spacing: { after: 200 }
    });

    const section3Title = new Paragraph({
      text: "3. List of Participants",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 120 }
    });

    const participantListParagraphs = (event.participantList && event.participantList.length > 0)
      ? event.participantList.map((p, idx) => new Paragraph({ children: [new TextRun({ text: `${idx + 1}. ${p}`, size: 20 })] }))
      : [new Paragraph({ children: [new TextRun({ text: "[ Attendance Register / Participant Roster Attached ]", italics: true, color: "64748B", size: 20 })], spacing: { after: 200 } })];

    const section4Title = new Paragraph({
      text: "4. Poster",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 120 }
    });

    const posterParagraphs: Paragraph[] = [
      new Paragraph({
        children: [new TextRun({ text: "[ Official Event Poster Attached ]", italics: true, color: "64748B", size: 20 })],
        spacing: { after: 200 }
      })
    ];

    const universityTitle = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "School of Sciences", bold: true, size: 26, font: "Calibri", color: "1E293B" })],
      spacing: { before: 100, after: 40 }
    });

    const departmentTitle = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Department of Computer Science", bold: true, size: 24, font: "Calibri", color: "800000" })],
      spacing: { after: 40 }
    });

    const christTitle = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "CHRIST (Deemed to be University), Bangalore", bold: true, size: 24, font: "Calibri", color: "002B49" })],
      spacing: { after: 200 }
    });

    const reportHeaderTitle = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Activity Report", bold: true, size: 28, font: "Calibri", color: "800000", underline: {} })],
      spacing: { after: 300 }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          headerLogoTable,
          new Paragraph({ text: "", spacing: { after: 150 } }),
          universityTitle,
          departmentTitle,
          christTitle,
          reportHeaderTitle,
          mainReportTable,
          new Paragraph({ text: "", spacing: { after: 200 } }),
          section1Title,
          ...descriptiveParagraphs,
          section2Title,
          photoPlaceholder,
          section3Title,
          ...participantListParagraphs,
          section4Title,
          ...posterParagraphs
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const fileNameToUse = customFilename || `Activity_Report_${sanitizedTitle}.docx`;
    saveAs(blob, fileNameToUse);
    return true;
  } catch (error) {
    console.error("Error generating Activity Report Word document:", error);
    throw error;
  }
};

/**
 * Downloads a generalized sample/template Activity Report Word document (.docx) named "Sample_Report_Structure.docx".
 */
export const generateSampleReportTemplate = async () => {
  const sampleEvent: EventReportData = {
    title: "[ Title of the Activity / Event Name ]",
    date: "[ DD/MM/YYYY ]",
    time: "[ HH:MM AM/PM - HH:MM AM/PM ]",
    location: "[ Venue / Room / Hall / Campus Location ]",
    activityType: "1. Student Participation and Activities (5.3):\n ● 5.3.2: Activities organized for students to demonstrate leadership skills, social responsibility, and participative management.\n ● 5.3.3 Sports and Cultural Event\n2. Alumni Engagement (5.4)",
    collaboration: "[ Collaborating Organization / Industry Sponsor / Partner (if any) ]",
    participantsType: "[ Faculty, Students, Alumni, External Experts ]",
    participantCount: "[ Number of Participants ]",
    highlights: [
      "1. [ Key highlight or event milestone 1 ]",
      "2. [ Key highlight or event milestone 2 ]"
    ],
    keyTakeaways: [
      "1. [ Main learning outcome or key takeaway 1 ]",
      "2. [ Main learning outcome or key takeaway 2 ]"
    ],
    summary: "[ Executive summary detailing the purpose, execution, and outcomes of the activity. ]",
    followUpPlan: "1. [ Actionable follow-up plan item 1 ]\n2. [ Actionable follow-up plan item 2 ]",
    rapporteurName: "[ Name of the Rapporteur ]",
    rapporteurEmail: "[ rapporteur.email@christuniversity.in ]",
    rapporteurContact: "[ +91 XXXXXXXXXX ]",
    descriptiveReport: `[ Detailed Descriptive Report of the Event ]

Paragraph 1: Introduction, welcome address, inaugural remarks, dignitaries present, and objective of the event.

Paragraph 2: Detailed flow of activities, key speeches, technical presentations, hands-on sessions, or interactive discussions.

Paragraph 3: Audience engagement, feedback, networking, vote of thanks, and overall event conclusion.`
  };

  await generateEventWordReport(sampleEvent, "Sample_Report_Structure.docx");
};
