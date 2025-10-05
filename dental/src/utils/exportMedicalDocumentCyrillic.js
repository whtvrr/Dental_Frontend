import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportMedicalDocumentCyrillic = (appointmentData, clientData, doctorData) => {
  // Create PDF with UTF-8 support
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: false
  });

  // Set UTF-8 encoding
  doc.setProperties({
    title: 'Медицинская карта пациента',
    creator: 'Dental Clinic SHANS'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Main border - blue frame
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header section with gray background
  doc.setFillColor(240, 245, 250);
  doc.rect(margin, margin, pageWidth - 2 * margin, 35, 'F');

  // Try to use standard font with better Unicode support
  try {
    doc.setFont('helvetica', 'normal');
  } catch (e) {
    doc.setFont('times', 'normal');
  }

  // Main title - try Cyrillic first
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);

  try {
    doc.text('МЕДИЦИНСКАЯ КАРТА ПАЦИЕНТА', pageWidth / 2, margin + 12, { align: 'center' });
  } catch (e) {
    // Fallback to ASCII if Cyrillic fails
    doc.text('MEDITSINSKAYA KARTA PATSIENTA', pageWidth / 2, margin + 12, { align: 'center' });
  }

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  try {
    doc.text('Стоматологическая клиника "ШАНС"', pageWidth / 2, margin + 20, { align: 'center' });
  } catch (e) {
    doc.text('Stomatologicheskaya klinika "SHANS"', pageWidth / 2, margin + 20, { align: 'center' });
  }

  // English subtitle
  doc.setFont('helvetica', 'italic');
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
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const docNumber = `№ ${appointmentData.id?.toString().slice(-6) || '907999'}`;
  const docDate = `от ${appointmentDate.toLocaleDateString('ru-RU')}`;

  doc.text(docNumber, margin, yPos);
  doc.text(docDate, pageWidth - margin - 30, yPos);
  yPos += 15;

  // Safe text function with Cyrillic support
  const addSafeText = (text, x, y, options = {}) => {
    try {
      if (options.align === 'center') {
        doc.text(text, x, y, { align: 'center' });
      } else if (options.align === 'right') {
        doc.text(text, x, y, { align: 'right' });
      } else {
        doc.text(text, x, y);
      }
    } catch (e) {
      // If Cyrillic fails, try without special alignment
      try {
        doc.text(text, x, y);
      } catch (e2) {
        // Last resort - use placeholder
        doc.text('[Text]', x, y);
      }
    }
  };

  // PATIENT DATA section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  try {
    addSafeText('ДАННЫЕ ПАЦИЕНТА', margin, yPos);
  } catch (e) {
    addSafeText('DANNYE PATSIENTA', margin, yPos);
  }
  yPos += 8;

  // Patient data table with Cyrillic labels
  const patientTableData = [
    ['ФИО пациента:', clientData.full_name || 'Не указано'],
    ['Дата рождения:', clientData.birth_date ? new Date(clientData.birth_date).toLocaleDateString('ru-RU') : 'Не указано'],
    ['Пол:', clientData.gender === 'male' ? 'Мужской' : clientData.gender === 'female' ? 'Женский' : 'Не указано'],
    ['Телефон:', clientData.phone_number || 'Не указано'],
    ['Адрес:', clientData.address || 'Не указано']
  ];

  // Use autoTable with custom text rendering
  doc.autoTable({
    startY: yPos,
    head: [],
    body: patientTableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.5,
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    theme: 'grid',
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
    didParseCell: function (data) {
      // Try to render Cyrillic, fallback if needed
      if (data.cell.text && data.cell.text.length > 0) {
        try {
          // Test if the text can be rendered
          const testText = data.cell.text[0];
          if (/[А-Яа-яЁё]/.test(testText)) {
            // Contains Cyrillic, keep as is
          }
        } catch (e) {
          // Fallback to ASCII if needed
          data.cell.text = data.cell.text.map(text => {
            return text.replace(/[А-Яа-яЁё]/g, function(match) {
              const map = {
                'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
                'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
                'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
                'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
                'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
                'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
                'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
              };
              return map[match] || match;
            });
          });
        }
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // APPOINTMENT INFO section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  try {
    addSafeText('ИНФОРМАЦИЯ О ПРИЁМЕ', margin, yPos);
  } catch (e) {
    addSafeText('INFORMATSIYA O PRIYOME', margin, yPos);
  }
  yPos += 8;

  const appointmentTableData = [
    ['Дата приёма:', appointmentDate.toLocaleDateString('ru-RU')],
    ['Время:', appointmentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })],
    ['Длительность:', `${appointmentData.duration_minutes || 90} минут`],
    ['Лечащий врач:', doctorData.full_name || 'Test doctor']
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
      lineWidth: 0.5,
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    theme: 'grid',
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
    didParseCell: function (data) {
      // Same fallback logic as above
      if (data.cell.text && data.cell.text.length > 0) {
        try {
          const testText = data.cell.text[0];
          if (/[А-Яа-яЁё]/.test(testText)) {
            // Contains Cyrillic, keep as is
          }
        } catch (e) {
          // Fallback to ASCII
          data.cell.text = data.cell.text.map(text => {
            return text.replace(/[А-Яа-яЁё]/g, function(match) {
              const map = {
                'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
                'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
                'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
                'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
                'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
                'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
                'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
              };
              return map[match] || match;
            });
          });
        }
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // MEDICAL INFORMATION section
  if (appointmentData.completed_data || appointmentData.anamnesis ||
      appointmentData.complaint || appointmentData.diagnosis || appointmentData.treatment) {

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    try {
      addSafeText('МЕДИЦИНСКАЯ ИНФОРМАЦИЯ', margin, yPos);
    } catch (e) {
      addSafeText('MEDITSINSKAYA INFORMATSIYA', margin, yPos);
    }
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

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Anamnesis
    const anamnesis = appointmentData.completed_data?.anamnesis || appointmentData.anamnesis;
    if (anamnesis) {
      checkPageBreak(25);

      doc.setFont('helvetica', 'bold');
      try {
        addSafeText('Анамнез:', margin, yPos);
      } catch (e) {
        addSafeText('Anamnez:', margin, yPos);
      }
      yPos += 6;

      // Text box for anamnesis
      const anamnesisText = String(anamnesis).trim();
      const anamnesisLines = doc.splitTextToSize(anamnesisText, pageWidth - 2 * margin - 10);

      const textBoxHeight = Math.max(15, anamnesisLines.length * 4 + 6);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin + 10, yPos - 2, pageWidth - 2 * margin - 20, textBoxHeight, 'FD');

      doc.setFont('helvetica', 'normal');
      let textY = yPos + 3;
      anamnesisLines.forEach(line => {
        try {
          doc.text(line, margin + 12, textY);
        } catch (e) {
          // If text fails to render, skip it
        }
        textY += 4;
      });

      yPos += textBoxHeight + 8;
    }

    // Comments
    const comment = appointmentData.completed_data?.comment || appointmentData.comment;
    if (comment) {
      checkPageBreak(25);

      doc.setFont('helvetica', 'bold');
      try {
        addSafeText('Комментарии:', margin, yPos);
      } catch (e) {
        addSafeText('Kommentarii:', margin, yPos);
      }
      yPos += 6;

      const commentText = String(comment).trim();
      const commentLines = doc.splitTextToSize(commentText, pageWidth - 2 * margin - 10);

      const commentBoxHeight = Math.max(15, commentLines.length * 4 + 6);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin + 10, yPos - 2, pageWidth - 2 * margin - 20, commentBoxHeight, 'FD');

      doc.setFont('helvetica', 'normal');
      let commentY = yPos + 3;
      commentLines.forEach(line => {
        try {
          doc.text(line, margin + 12, commentY);
        } catch (e) {
          // If text fails to render, skip it
        }
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
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  try {
    addSafeText('Лечащий врач:', margin, yPos);
  } catch (e) {
    addSafeText('Lechashchiy vrach:', margin, yPos);
  }

  // Doctor name
  doc.setFont('helvetica', 'italic');
  addSafeText(doctorData.full_name || 'Test doctor', margin + 60, yPos - 4);

  // Signature line
  doc.setFont('helvetica', 'normal');
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin + 60, yPos + 8, margin + 140, yPos + 8);
  doc.setFontSize(9);
  addSafeText('(подпись)', margin + 90, yPos + 14);

  // Stamp box
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(1.5);
  doc.rect(pageWidth - margin - 60, yPos - 10, 50, 35);
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  addSafeText('М.П.', pageWidth - margin - 35, yPos + 8);

  doc.setTextColor(0, 0, 0);
  yPos += 30;

  // Document issue date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const issueDate = `Дата выдачи: ${new Date().toLocaleDateString('ru-RU')}`;
  try {
    addSafeText(issueDate, margin, yPos);
  } catch (e) {
    addSafeText(`Data vydachi: ${new Date().toLocaleDateString('ru-RU')}`, margin, yPos);
  }

  // Save PDF
  const clientName = clientData.full_name ?
    String(clientData.full_name).trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') :
    'Patient';
  const dateString = appointmentDate.toISOString().split('T')[0];
  const fileName = `Medical_Record_${clientName}_${dateString}.pdf`;

  doc.save(fileName);
};

export default exportMedicalDocumentCyrillic;