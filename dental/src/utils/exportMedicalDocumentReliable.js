import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Enhanced Russian to ASCII transliteration with improved readability
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

  return String(text).replace(/[А-Яа-яЁё]/g, function(match) {
    return ruToLat[match] || match;
  });
};

// Clean and safe text rendering
const addText = (doc, text, x, y, options = {}) => {
  if (!text) return;

  const cleanText = transliterate(String(text).trim().replace(/\s+/g, ' '));

  if (options.align === 'center') {
    doc.text(cleanText, x, y, { align: 'center' });
  } else if (options.align === 'right') {
    doc.text(cleanText, x, y, { align: 'right' });
  } else {
    doc.text(cleanText, x, y);
  }
};

export const exportMedicalDocumentReliable = (appointmentData, clientData, doctorData) => {
  // Create PDF with optimized settings
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Use standard font
  doc.setFont('times', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12; // Compact margins

  // Simple border
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  // Compact header
  doc.setFillColor(245, 250, 255);
  doc.rect(margin - 2, margin - 2, pageWidth - 2 * margin + 4, 18, 'F');

  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 51, 102);
  addText(doc, 'MEDITSINSKAYA KARTA PATSIENTA', pageWidth / 2, margin + 5, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  addText(doc, 'Stomatologicheskaya klinika "SHANS"', pageWidth / 2, margin + 10, { align: 'center' });

  // Header separator
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.3);
  doc.line(margin, margin + 16, pageWidth - margin, margin + 16);

  doc.setTextColor(0, 0, 0);
  let yPos = margin + 22;

  // Document info
  const appointmentDate = new Date(appointmentData.date_time);
  doc.setFontSize(7);
  doc.setFont('times', 'italic');
  addText(doc, `No ${appointmentData.id?.toString().slice(-8) || 'N/A'}`, margin, yPos);
  addText(doc, `ot ${appointmentDate.toLocaleDateString('ru-RU')}`, pageWidth - margin - 30, yPos);
  yPos += 6;

  // Patient section
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 5, 'F');

  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  addText(doc, 'DANNYE PATSIENTA', margin + 1, yPos + 3);
  yPos += 7;

  // Compact patient info
  doc.setFontSize(8);
  doc.setFont('times', 'normal');

  const patientInfo = [
    ['FIO:', clientData.full_name || 'Ne ukazano'],
    ['Data rozhdeniya:', clientData.birth_date ? new Date(clientData.birth_date).toLocaleDateString('ru-RU') : 'Ne ukazano'],
    ['Pol:', clientData.gender === 'male' ? 'Muzhskoy' : clientData.gender === 'female' ? 'Zhenskiy' : 'Ne ukazano'],
    ['Telefon:', clientData.phone_number || 'Ne ukazano'],
    ['Adres:', clientData.address || 'Ne ukazano']
  ];

  patientInfo.forEach((info, index) => {
    doc.setFont('times', 'bold');
    addText(doc, info[0], margin + 1, yPos);
    doc.setFont('times', 'normal');
    addText(doc, info[1], margin + 35, yPos);
    yPos += 4;
  });

  yPos += 4;

  // Appointment section
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 5, 'F');

  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  addText(doc, 'INFORMATSIYA O PRIYOME', margin + 1, yPos + 3);
  yPos += 7;

  doc.setFontSize(8);
  doc.setFont('times', 'normal');

  const appointmentInfo = [
    ['Data priyoma:', appointmentDate.toLocaleDateString('ru-RU')],
    ['Vremya:', appointmentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })],
    ['Dlitelnost:', `${appointmentData.duration_minutes || 30} minut`],
    ['Lechashchiy vrach:', doctorData.full_name || 'Ne ukazano']
  ];

  appointmentInfo.forEach((info, index) => {
    doc.setFont('times', 'bold');
    addText(doc, info[0], margin + 1, yPos);
    doc.setFont('times', 'normal');
    addText(doc, info[1], margin + 35, yPos);
    yPos += 4;
  });

  yPos += 4;

  // Medical information
  if (appointmentData.completed_data || appointmentData.anamnesis ||
      appointmentData.complaint || appointmentData.diagnosis || appointmentData.treatment) {

    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 5, 'F');

    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    addText(doc, 'MEDITSINSKAYA INFORMATSIYA', margin + 1, yPos + 3);
    yPos += 8;

    doc.setFontSize(8);
    doc.setFont('times', 'normal');

    // Page break check
    const checkPageBreak = () => {
      if (yPos > pageHeight - 35) {
        doc.addPage();
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
        yPos = margin + 8;
      }
    };

    // Anamnesis
    const anamnesis = appointmentData.completed_data?.anamnesis || appointmentData.anamnesis;
    if (anamnesis) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Anamnez:', margin, yPos);
      yPos += 4;
      doc.setFont('times', 'normal');

      const anamnesisText = transliterate(String(anamnesis).trim());
      const anamnesisLines = doc.splitTextToSize(anamnesisText, pageWidth - 2 * margin - 4);

      anamnesisLines.forEach(line => {
        checkPageBreak();
        doc.text(line, margin + 1, yPos);
        yPos += 3.5;
      });
      yPos += 3;
    }

    // Complaint
    const complaintText = appointmentData.completed_data?.custom_complaint ||
                         appointmentData.completed_data?.complaint?.title ||
                         appointmentData.complaint?.title ||
                         'Ne ukazano';
    checkPageBreak();
    doc.setFont('times', 'bold');
    addText(doc, 'Zhaloby:', margin, yPos);
    yPos += 4;
    doc.setFont('times', 'normal');

    const complaintTranslated = transliterate(String(complaintText).trim());
    const complaintLines = doc.splitTextToSize(complaintTranslated, pageWidth - 2 * margin - 4);

    complaintLines.forEach(line => {
      checkPageBreak();
      doc.text(line, margin + 1, yPos);
      yPos += 3.5;
    });
    yPos += 3;

    // Diagnosis
    const diagnosis = appointmentData.completed_data?.diagnosis || appointmentData.diagnosis;
    if (diagnosis) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Diagnoz:', margin, yPos);
      doc.setFont('times', 'normal');
      const diagnosisText = diagnosis.title ?
        `${diagnosis.title}${diagnosis.code ? ` (${diagnosis.code})` : ''}` :
        diagnosis;
      addText(doc, diagnosisText, margin + 20, yPos);
      yPos += 5;
    }

    // Treatment
    const treatment = appointmentData.completed_data?.treatment || appointmentData.treatment;
    if (treatment) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Lechenie:', margin, yPos);
      doc.setFont('times', 'normal');
      const treatmentText = treatment.title ?
        `${treatment.title}${treatment.code ? ` (${treatment.code})` : ''}` :
        treatment;
      addText(doc, treatmentText, margin + 20, yPos);
      yPos += 5;
    }

    // Comments
    const comment = appointmentData.completed_data?.comment || appointmentData.comment;
    if (comment) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Kommentarii:', margin, yPos);
      yPos += 4;
      doc.setFont('times', 'normal');

      const commentText = transliterate(String(comment).trim());
      const commentLines = doc.splitTextToSize(commentText, pageWidth - 2 * margin - 4);

      commentLines.forEach(line => {
        checkPageBreak();
        doc.text(line, margin + 1, yPos);
        yPos += 3.5;
      });
      yPos += 3;
    }
  }

  // Compact footer
  if (yPos > pageHeight - 30) {
    doc.addPage();
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    yPos = margin + 8;
  } else {
    yPos = Math.max(yPos + 8, pageHeight - 30);
  }

  // Separator
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Signature
  doc.setFillColor(252, 252, 252);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');

  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  addText(doc, 'Lechashchiy vrach:', margin + 1, yPos + 4);

  doc.setLineWidth(0.2);
  doc.setDrawColor(0);
  doc.line(margin + 30, yPos + 8, margin + 70, yPos + 8);
  doc.setFontSize(6);
  addText(doc, '(podpis)', margin + 45, yPos + 11);

  doc.setFontSize(7);
  doc.setFont('times', 'italic');
  addText(doc, doctorData.full_name || 'Ne ukazano', margin + 30, yPos + 2);

  // Stamp
  doc.setDrawColor(120);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - margin - 30, yPos, 25, 20);
  doc.setFontSize(10);
  doc.setTextColor(120);
  addText(doc, 'M.P.', pageWidth - margin - 17, yPos + 12);
  doc.setTextColor(0);

  yPos += 15;

  // Date
  doc.setFontSize(7);
  doc.setFont('times', 'normal');
  addText(doc, `Data vydachi: ${new Date().toLocaleDateString('ru-RU')}`, margin + 1, yPos);

  yPos += 4;
  doc.setFontSize(6);
  doc.setFont('times', 'italic');
  doc.setTextColor(100);
  addText(doc, 'Dokument vydan na osnovanii meditsinskoy karty patsienta', pageWidth / 2, yPos, { align: 'center' });

  // Save PDF
  const clientName = clientData.full_name ?
    transliterate(String(clientData.full_name).trim()).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') :
    'Patient';
  const dateString = appointmentDate.toISOString().split('T')[0];
  const fileName = `Medical_Record_${clientName}_${dateString}.pdf`;

  doc.save(fileName);
};

export default exportMedicalDocumentReliable;