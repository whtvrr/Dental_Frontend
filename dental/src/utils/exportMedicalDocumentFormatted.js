import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Complete Russian to ASCII transliteration - removes ALL non-ASCII characters
const transliterate = (text) => {
  if (!text) return '';

  const ruToLat = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  let result = String(text);

  // First convert Cyrillic to Latin
  result = result.replace(/[А-Яа-яЁё]/g, function(match) {
    return ruToLat[match] || match;
  });

  // Then remove any remaining non-ASCII characters (safety measure)
  result = result.replace(/[^\x00-\x7F]/g, '');

  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result;
};

export const exportMedicalDocumentFormatted = (appointmentData, clientData, doctorData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Main border - blue frame like in the example
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header section with gray background
  doc.setFillColor(240, 245, 250);
  doc.rect(margin, margin, pageWidth - 2 * margin, 35, 'F');

  // Main title - hardcoded ASCII to avoid any conversion issues
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102);
  doc.text('MEDITSINSKAYA KARTA PATSIENTA', pageWidth / 2, margin + 12, { align: 'center' });

  // Subtitle - hardcoded ASCII
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text('Stomatologicheskaya klinika "SHANS"', pageWidth / 2, margin + 20, { align: 'center' });

  // English subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Dental Medical Record', pageWidth / 2, margin + 28, { align: 'center' });

  // Blue separator line
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(1);
  doc.line(margin, margin + 35, pageWidth - margin, margin + 35);

  doc.setTextColor(0, 0, 0);
  let yPos = margin + 45;

  // Document number and date
  const appointmentDate = new Date(appointmentData.date_time);
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const docNumber = `No ${appointmentData.id?.toString().slice(-6) || '907999'}`;
  const docDate = `ot ${appointmentDate.toLocaleDateString('ru-RU')}`;

  doc.text(docNumber, margin, yPos);
  doc.text(docDate, pageWidth - margin - 30, yPos);
  yPos += 15;

  // PATIENT DATA section - hardcoded ASCII
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('DANNYE PATSIENTA', margin, yPos);
  yPos += 8;

  // Patient data table - all labels hardcoded in ASCII
  const patientTableData = [
    ['FIO patsienta:', transliterate(clientData.full_name) || 'Ne ukazano'],
    ['Data rozhdeniya:', clientData.birth_date ? new Date(clientData.birth_date).toLocaleDateString('ru-RU') : 'Ne ukazano'],
    ['Pol:', clientData.gender === 'male' ? 'Muzhskoy' : clientData.gender === 'female' ? 'Zhenskiy' : 'Ne ukazano'],
    ['Telefon:', transliterate(clientData.phone_number) || 'Ne ukazano'],
    ['Adres:', transliterate(clientData.address) || 'Ne ukazano']
  ];

  doc.autoTable({
    startY: yPos,
    head: [],
    body: patientTableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.5
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    theme: 'grid',
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // APPOINTMENT INFO section - hardcoded ASCII
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('INFORMATSIYA O PRIYOME', margin, yPos);
  yPos += 8;

  const appointmentTableData = [
    ['Data priyoma:', appointmentDate.toLocaleDateString('ru-RU')],
    ['Vremya:', appointmentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })],
    ['Dlitelnost:', `${appointmentData.duration_minutes || 90} minut`],
    ['Lechashchiy vrach:', transliterate(doctorData.full_name) || 'Test doctor']
  ];

  doc.autoTable({
    startY: yPos,
    head: [],
    body: appointmentTableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.5
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    theme: 'grid',
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // MEDICAL INFORMATION section
  if (appointmentData.completed_data || appointmentData.anamnesis ||
      appointmentData.complaint || appointmentData.diagnosis || appointmentData.treatment) {

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('MEDITSINSKAYA INFORMATSIYA', margin, yPos);
    yPos += 10;

    // Check for page break
    const checkPageBreak = (neededSpace = 30) => {
      if (yPos + neededSpace > pageHeight - 60) {
        doc.addPage();
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        yPos = margin + 10;
        return true;
      }
      return false;
    };

    doc.setFont('times', 'normal');
    doc.setFontSize(10);

    // Anamnesis
    const anamnesis = appointmentData.completed_data?.anamnesis || appointmentData.anamnesis;
    if (anamnesis) {
      checkPageBreak(25);

      doc.setFont('times', 'bold');
      doc.text('Anamnez:', margin, yPos);
      yPos += 6;

      // Text box for anamnesis
      const anamnesisText = transliterate(String(anamnesis).trim());
      const anamnesisLines = doc.splitTextToSize(anamnesisText, pageWidth - 2 * margin - 10);

      const textBoxHeight = Math.max(15, anamnesisLines.length * 4 + 6);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin + 10, yPos - 2, pageWidth - 2 * margin - 20, textBoxHeight, 'FD');

      doc.setFont('times', 'normal');
      let textY = yPos + 3;
      anamnesisLines.forEach(line => {
        doc.text(line, margin + 12, textY);
        textY += 4;
      });

      yPos += textBoxHeight + 8;
    }

    // Complaints
    const complaintText = appointmentData.completed_data?.custom_complaint ||
                         appointmentData.completed_data?.complaint?.title ||
                         appointmentData.complaint?.title ||
                         'Ne ukazano';

    checkPageBreak(25);
    doc.setFont('times', 'bold');
    doc.text('Zhaloby:', margin, yPos);
    yPos += 6;

    const complaintTranslated = transliterate(String(complaintText).trim());
    const complaintLines = doc.splitTextToSize(complaintTranslated, pageWidth - 2 * margin - 10);

    const complaintBoxHeight = Math.max(15, complaintLines.length * 4 + 6);
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin + 10, yPos - 2, pageWidth - 2 * margin - 20, complaintBoxHeight, 'FD');

    doc.setFont('times', 'normal');
    let complaintY = yPos + 3;
    complaintLines.forEach(line => {
      doc.text(line, margin + 12, complaintY);
      complaintY += 4;
    });

    yPos += complaintBoxHeight + 8;

    // Comments
    const comment = appointmentData.completed_data?.comment || appointmentData.comment;
    if (comment) {
      checkPageBreak(25);

      doc.setFont('times', 'bold');
      doc.text('Kommentarii:', margin, yPos);
      yPos += 6;

      const commentText = transliterate(String(comment).trim());
      const commentLines = doc.splitTextToSize(commentText, pageWidth - 2 * margin - 10);

      const commentBoxHeight = Math.max(15, commentLines.length * 4 + 6);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin + 10, yPos - 2, pageWidth - 2 * margin - 20, commentBoxHeight, 'FD');

      doc.setFont('times', 'normal');
      let commentY = yPos + 3;
      commentLines.forEach(line => {
        doc.text(line, margin + 12, commentY);
        commentY += 4;
      });

      yPos += commentBoxHeight + 8;
    }
  }

  // Footer section
  if (yPos > pageHeight - 80) {
    doc.addPage();
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    yPos = margin + 20;
  } else {
    yPos = Math.max(yPos + 20, pageHeight - 80);
  }

  // Blue separator line for footer
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Signature section
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.text('Lechashchiy vrach:', margin, yPos);

  // Doctor name in italics - ensure ASCII
  doc.setFont('times', 'italic');
  doc.text(transliterate(doctorData.full_name) || 'Test doctor', margin + 60, yPos - 4);

  // Signature line
  doc.setFont('times', 'normal');
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin + 60, yPos + 8, margin + 140, yPos + 8);
  doc.setFontSize(9);
  doc.text('(podpis)', margin + 90, yPos + 14);

  // Stamp box
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(1.5);
  doc.rect(pageWidth - margin - 60, yPos - 10, 50, 35);
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('M.P.', pageWidth - margin - 35, yPos + 8, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPos += 30;

  // Document issue date
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  const issueDate = `Data vydachi dokumenta: ${new Date().toLocaleDateString('ru-RU')}`;
  doc.text(issueDate, margin, yPos);

  // Footer disclaimer - hardcoded ASCII
  yPos += 8;
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Nastoyashchiy dokument vydan na osnovanii meditsinskoy karty patsienta', pageWidth / 2, yPos, { align: 'center' });
  doc.text('i podtverzhdaet fakt okazaniya meditsinskikh uslug', pageWidth / 2, yPos + 4, { align: 'center' });

  // Save PDF
  const clientName = clientData.full_name ?
    transliterate(String(clientData.full_name).trim()).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') :
    'Patient';
  const dateString = appointmentDate.toISOString().split('T')[0];
  const fileName = `Medical_Record_${clientName}_${dateString}.pdf`;

  doc.save(fileName);
};

export default exportMedicalDocumentFormatted;