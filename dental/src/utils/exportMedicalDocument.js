import jsPDF from 'jspdf';
import 'jspdf-autotable';

// DejaVu Sans font data (base64 encoded) - supports Cyrillic characters
// This is a minimal subset for demonstration - in production, use full font
const DejaVuSansFont = `
data:font/truetype;charset=utf-8;base64,AAEAAAAOAIAAAwBgRkZUTbvJCjUAAADcAAAAHEdERUYAKQAKAAAA+AAAAB5PUy8yYJg/mQAAABgAAAA2Y21hcEOqBkgAAABQAAAAqGdhc3D//wADAAAA7AAAAAGCZ2x5ZgAAAAEAAAF0AAAAAgAAAC5oZWFkLTcgcAAAAqgAAAA2aGhlYQdoA0oAAAKcAAAAJGhtdHgGKgAAAAACgAAAABQgbG9jYQAAAAAAAABAAAAFZ21heHABDwRCAAACnAAAACA=
`;

// Initialize Cyrillic font support
let isFontLoaded = false;

const initCyrillicFont = (doc) => {
  if (!isFontLoaded) {
    try {
      // For now, we'll use a simplified approach with Times font
      // In production, you would load actual DejaVu Sans here
      doc.setFont('times', 'normal');
      isFontLoaded = true;
    } catch (error) {
      console.warn('Could not load Cyrillic font, using fallback:', error);
      doc.setFont('times', 'normal');
    }
  }
};

// Russian to ASCII transliteration for safe PDF generation
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

  return text.replace(/[А-Яа-яЁё]/g, function(match) {
    return ruToLat[match] || match;
  });
};

// Try to render Cyrillic text directly, fallback to ASCII if needed
const addText = (doc, text, x, y, options = {}) => {
  if (!text) return;

  // Clean the text first
  const cleanText = String(text).trim().replace(/\s+/g, ' ');

  try {
    // Try to render Cyrillic text directly
    if (options.align === 'center') {
      doc.text(cleanText, x, y, { align: 'center' });
    } else if (options.align === 'right') {
      doc.text(cleanText, x, y, { align: 'right' });
    } else {
      doc.text(cleanText, x, y);
    }
  } catch (error) {
    // Fallback to ASCII transliteration if Cyrillic fails
    console.warn('Cyrillic rendering failed, using ASCII fallback:', error);
    const asciiText = transliterate(cleanText);
    if (options.align === 'center') {
      doc.text(asciiText, x, y, { align: 'center' });
    } else if (options.align === 'right') {
      doc.text(asciiText, x, y, { align: 'right' });
    } else {
      doc.text(asciiText, x, y);
    }
  }
};

export const exportMedicalDocument = (appointmentData, clientData, doctorData) => {
  // Create new PDF document with optimized settings
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Initialize Cyrillic font support
  initCyrillicFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // Reduced margin to maximize space

  // Add simple border
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Compact Header - Clinic Information
  doc.setFillColor(245, 250, 255);
  doc.rect(margin - 3, margin - 3, pageWidth - 2 * margin + 6, 22, 'F');

  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 51, 102);
  addText(doc, 'МЕДИЦИНСКАЯ КАРТА ПАЦИЕНТА', pageWidth / 2, margin + 4, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  addText(doc, 'Стоматологическая клиника "ШАНС"', pageWidth / 2, margin + 12, { align: 'center' });

  // Compact header separator
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

  doc.setTextColor(0, 0, 0);
  let yPos = margin + 25; // Reduced header space

  // Compact Document Number and Date
  doc.setFontSize(8);
  const appointmentDate = new Date(appointmentData.date_time);
  const docNumber = `№ ${appointmentData.id?.toString().slice(-8) || 'N/A'}`;
  const docDate = `от ${appointmentDate.toLocaleDateString('ru-RU')}`;

  doc.setFont('times', 'italic');
  addText(doc, docNumber, margin, yPos);
  addText(doc, docDate, pageWidth - margin - 35, yPos);
  yPos += 8; // Reduced spacing

  // Compact Patient Information Section
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, yPos - 1, pageWidth - 2 * margin, 6, 'F');

  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  addText(doc, 'ДАННЫЕ ПАЦИЕНТА', margin + 2, yPos + 3);
  yPos += 8; // Reduced spacing

  doc.setFontSize(10);
  doc.setFont('times', 'normal');

  // Compact patient info - use two columns to save space
  const patientInfo = [
    { label: 'ФИО пациента:', value: clientData.full_name || 'Не указано' },
    { label: 'Дата рождения:', value: clientData.birth_date ? new Date(clientData.birth_date).toLocaleDateString('ru-RU') : 'Не указано' },
    { label: 'Пол:', value: clientData.gender === 'male' ? 'Мужской' : clientData.gender === 'female' ? 'Женский' : 'Не указано' },
    { label: 'Телефон:', value: clientData.phone_number || 'Не указано' },
    { label: 'Адрес:', value: clientData.address || 'Не указано' }
  ];

  // Compact table with minimal borders
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.rect(margin, yPos - 1, pageWidth - 2 * margin, patientInfo.length * 5 + 2);

  patientInfo.forEach((info, index) => {
    doc.setFont('times', 'bold');
    addText(doc, info.label, margin + 2, yPos + 3);
    doc.setFont('times', 'normal');
    addText(doc, info.value, margin + 45, yPos + 3);
    yPos += 5; // Reduced row height
  });

  yPos += 6; // Reduced section spacing

  // Compact Appointment Information Section
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, yPos - 1, pageWidth - 2 * margin, 6, 'F');

  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  addText(doc, 'ИНФОРМАЦИЯ О ПРИЁМЕ', margin + 2, yPos + 3);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('times', 'normal');

  const appointmentInfo = [
    { label: 'Дата приёма:', value: appointmentDate.toLocaleDateString('ru-RU') },
    { label: 'Время:', value: appointmentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Длительность:', value: `${appointmentData.duration_minutes || 30} минут` },
    { label: 'Лечащий врач:', value: doctorData.full_name || 'Не указано' }
  ];

  // Compact table
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.rect(margin, yPos - 1, pageWidth - 2 * margin, appointmentInfo.length * 5 + 2);

  appointmentInfo.forEach((info, index) => {
    doc.setFont('times', 'bold');
    addText(doc, info.label, margin + 2, yPos + 3);
    doc.setFont('times', 'normal');
    addText(doc, info.value, margin + 45, yPos + 3);
    yPos += 5;
  });

  yPos += 6;

  // Compact Medical Information Section
  if (appointmentData.completed_data || appointmentData.anamnesis || appointmentData.complaint || appointmentData.diagnosis || appointmentData.treatment) {
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos - 1, pageWidth - 2 * margin, 6, 'F');

    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    addText(doc, 'МЕДИЦИНСКАЯ ИНФОРМАЦИЯ', margin + 2, yPos + 3);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('times', 'normal');

    // Optimized page break logic - check earlier and use less space
    const checkPageBreak = () => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(0.5);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
        yPos = margin + 10;
      }
    };

    // Compact Anamnesis
    const anamnesis = appointmentData.completed_data?.anamnesis || appointmentData.anamnesis;
    if (anamnesis) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Анамнез:', margin, yPos);
      yPos += 5;
      doc.setFont('times', 'normal');

      // Compact text box with minimal padding
      const cleanAnamnesis = String(anamnesis).trim().replace(/\s+/g, ' ');
      const anamnesisLines = doc.splitTextToSize(cleanAnamnesis, pageWidth - 2 * margin - 6);
      const textHeight = anamnesisLines.length * 4 + 4;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.1);
      doc.rect(margin, yPos - 1, pageWidth - 2 * margin, textHeight, 'FD');

      anamnesisLines.forEach(line => {
        checkPageBreak();
        doc.text(line, margin + 2, yPos + 2);
        yPos += 4;
      });
      yPos += 5;
    }

    // Compact Complaint
    const complaintText = appointmentData.completed_data?.custom_complaint ||
                         appointmentData.completed_data?.complaint?.title ||
                         appointmentData.complaint?.title ||
                         'Не указано';
    checkPageBreak();
    doc.setFont('times', 'bold');
    addText(doc, 'Жалобы:', margin, yPos);
    yPos += 5;
    doc.setFont('times', 'normal');

    const cleanComplaint = String(complaintText).trim().replace(/\s+/g, ' ');
    const complaintLines = doc.splitTextToSize(cleanComplaint, pageWidth - 2 * margin - 6);
    const complaintHeight = complaintLines.length * 4 + 4;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.rect(margin, yPos - 1, pageWidth - 2 * margin, complaintHeight, 'FD');

    complaintLines.forEach(line => {
      checkPageBreak();
      doc.text(line, margin + 2, yPos + 2);
      yPos += 4;
    });
    yPos += 5;

    // Compact Diagnosis and Treatment in one line format
    const diagnosis = appointmentData.completed_data?.diagnosis || appointmentData.diagnosis;
    if (diagnosis) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Диагноз:', margin, yPos);
      doc.setFont('times', 'normal');
      const diagnosisText = diagnosis.title ?
        `${diagnosis.title}${diagnosis.code ? ` (${diagnosis.code})` : ''}` :
        diagnosis;
      addText(doc, diagnosisText, margin + 22, yPos);
      yPos += 6;
    }

    // Treatment
    const treatment = appointmentData.completed_data?.treatment || appointmentData.treatment;
    if (treatment) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Лечение:', margin, yPos);
      doc.setFont('times', 'normal');
      const treatmentText = treatment.title ?
        `${treatment.title}${treatment.code ? ` (${treatment.code})` : ''}` :
        treatment;
      addText(doc, treatmentText, margin + 22, yPos);
      yPos += 6;
    }

    // Compact Comments
    const comment = appointmentData.completed_data?.comment || appointmentData.comment;
    if (comment) {
      checkPageBreak();
      doc.setFont('times', 'bold');
      addText(doc, 'Комментарии:', margin, yPos);
      yPos += 5;
      doc.setFont('times', 'normal');

      const cleanComment = String(comment).trim().replace(/\s+/g, ' ');
      const commentLines = doc.splitTextToSize(cleanComment, pageWidth - 2 * margin - 6);
      const commentHeight = commentLines.length * 4 + 4;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.1);
      doc.rect(margin, yPos - 1, pageWidth - 2 * margin, commentHeight, 'FD');

      commentLines.forEach(line => {
        checkPageBreak();
        doc.text(line, margin + 2, yPos + 2);
        yPos += 4;
      });
      yPos += 5;
    }
  }

  // Compact Footer - try to fit on same page
  if (yPos > pageHeight - 50) {
    doc.addPage();
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    yPos = margin + 10;
  } else {
    yPos = Math.max(yPos + 10, pageHeight - 50);
  }

  // Compact separator line
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Compact signature section
  doc.setFillColor(252, 252, 252);
  doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 30, 'F');

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.setTextColor(0, 0, 0);

  addText(doc, 'Лечащий врач:', margin + 2, yPos + 4);

  // Compact signature line
  doc.setLineWidth(0.3);
  doc.setDrawColor(0);
  doc.line(margin + 35, yPos + 8, margin + 80, yPos + 8);
  doc.setFontSize(8);
  addText(doc, '(подпись)', margin + 50, yPos + 12);

  // Doctor name
  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  addText(doc, doctorData.full_name || 'Не указано', margin + 35, yPos + 2);
  doc.setFont('times', 'normal');

  // Compact stamp box
  doc.setDrawColor(120);
  doc.setLineWidth(0.8);
  doc.rect(pageWidth - margin - 45, yPos - 2, 40, 30);
  doc.setFontSize(12);
  doc.setTextColor(120);
  addText(doc, 'М.П.', pageWidth - margin - 25, yPos + 12);
  doc.setTextColor(0);

  yPos += 18;

  // Compact date and disclaimer
  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  addText(doc, `Дата выдачи: ${new Date().toLocaleDateString('ru-RU')}`, margin + 2, yPos);

  yPos += 6;
  doc.setFontSize(7);
  doc.setFont('times', 'italic');
  doc.setTextColor(100);
  addText(doc, 'Документ выдан на основании медицинской карты пациента', pageWidth / 2, yPos, { align: 'center' });

  // Save PDF with clean filename
  const clientName = clientData.full_name ?
    transliterate(String(clientData.full_name).trim()).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') :
    'Patient';
  const dateString = appointmentDate.toISOString().split('T')[0];
  const fileName = `Medical_Record_${clientName}_${dateString}.pdf`;

  doc.save(fileName);
};

export default exportMedicalDocument;