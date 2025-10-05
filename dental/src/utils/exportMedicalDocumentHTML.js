import html2pdf from 'html2pdf.js';

export const exportMedicalDocumentHTML = (appointmentData, clientData, doctorData) => {
  const appointmentDate = new Date(appointmentData.date_time);

  // Create HTML content with proper Cyrillic text
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Медицинская карта пациента</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 11px;
          line-height: 1.3;
          color: #000;
          background: white;
          margin: 0;
          padding: 15px;
        }

        .document {
          max-width: 190mm;
          margin: 0 auto;
          background: white;
          padding: 0;
        }

        .header {
          text-align: center;
          background: #f5f8ff;
          padding: 8px;
          border: 1px solid #ccc;
          margin-bottom: 8px;
        }

        .header h1 {
          font-size: 16px;
          font-weight: bold;
          color: #003366;
          margin-bottom: 3px;
        }

        .header h2 {
          font-size: 11px;
          font-weight: normal;
          margin: 0;
        }

        .doc-info {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          font-style: italic;
          margin-bottom: 8px;
        }

        .section {
          margin-bottom: 8px;
        }

        .section-header {
          background: #fafafa;
          padding: 3px 5px;
          font-weight: bold;
          font-size: 10px;
          border-left: 3px solid #0066cc;
          margin-bottom: 5px;
        }

        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }

        .info-table td {
          padding: 2px 5px;
          border-bottom: 1px solid #eee;
          font-size: 9px;
        }

        .info-table td:first-child {
          font-weight: bold;
          width: 35%;
        }

        .medical-info {
          margin-top: 8px;
        }

        .medical-item {
          margin-bottom: 5px;
        }

        .medical-label {
          font-weight: bold;
          color: #003366;
          margin-bottom: 2px;
        }

        .medical-text {
          padding-left: 10px;
          background: #fafafa;
          padding: 4px 8px;
          border-left: 2px solid #ccc;
          font-size: 9px;
          line-height: 1.4;
        }

        .footer {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #ccc;
        }

        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 10px;
        }

        .signature {
          width: 60%;
        }

        .signature-label {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .signature-name {
          font-style: italic;
          margin-bottom: 5px;
        }

        .signature-line {
          border-bottom: 1px solid #000;
          width: 120px;
          height: 1px;
          margin-bottom: 2px;
        }

        .signature-text {
          font-size: 8px;
          text-align: center;
          width: 120px;
        }

        .stamp {
          width: 60px;
          height: 40px;
          border: 1px solid #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #666;
        }

        .date-issue {
          font-size: 8px;
          margin-bottom: 5px;
        }

        .disclaimer {
          font-size: 7px;
          text-align: center;
          color: #666;
          font-style: italic;
        }

        @media print {
          body { margin: 0; padding: 10px; }
          .document { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="document">
        <!-- Header -->
        <div class="header">
          <h1>МЕДИЦИНСКАЯ КАРТА ПАЦИЕНТА</h1>
          <h2>Стоматологическая клиника "ШАНС"</h2>
        </div>

        <!-- Document Info -->
        <div class="doc-info">
          <span>№ ${appointmentData.id?.toString().slice(-8) || 'N/A'}</span>
          <span>от ${appointmentDate.toLocaleDateString('ru-RU')}</span>
        </div>

        <!-- Patient Information -->
        <div class="section">
          <div class="section-header">ДАННЫЕ ПАЦИЕНТА</div>
          <table class="info-table">
            <tr>
              <td>ФИО пациента:</td>
              <td>${clientData.full_name || 'Не указано'}</td>
            </tr>
            <tr>
              <td>Дата рождения:</td>
              <td>${clientData.birth_date ? new Date(clientData.birth_date).toLocaleDateString('ru-RU') : 'Не указано'}</td>
            </tr>
            <tr>
              <td>Пол:</td>
              <td>${clientData.gender === 'male' ? 'Мужской' : clientData.gender === 'female' ? 'Женский' : 'Не указано'}</td>
            </tr>
            <tr>
              <td>Телефон:</td>
              <td>${clientData.phone_number || 'Не указано'}</td>
            </tr>
            <tr>
              <td>Адрес:</td>
              <td>${clientData.address || 'Не указано'}</td>
            </tr>
          </table>
        </div>

        <!-- Appointment Information -->
        <div class="section">
          <div class="section-header">ИНФОРМАЦИЯ О ПРИЁМЕ</div>
          <table class="info-table">
            <tr>
              <td>Дата приёма:</td>
              <td>${appointmentDate.toLocaleDateString('ru-RU')}</td>
            </tr>
            <tr>
              <td>Время:</td>
              <td>${appointmentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
            <tr>
              <td>Длительность:</td>
              <td>${appointmentData.duration_minutes || 30} минут</td>
            </tr>
            <tr>
              <td>Лечащий врач:</td>
              <td>${doctorData.full_name || 'Не указано'}</td>
            </tr>
          </table>
        </div>

        <!-- Medical Information -->
        ${(appointmentData.completed_data || appointmentData.anamnesis || appointmentData.complaint || appointmentData.diagnosis || appointmentData.treatment) ? `
        <div class="section medical-info">
          <div class="section-header">МЕДИЦИНСКАЯ ИНФОРМАЦИЯ</div>

          ${(appointmentData.completed_data?.anamnesis || appointmentData.anamnesis) ? `
          <div class="medical-item">
            <div class="medical-label">Анамнез:</div>
            <div class="medical-text">${(appointmentData.completed_data?.anamnesis || appointmentData.anamnesis || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          ` : ''}

          <div class="medical-item">
            <div class="medical-label">Жалобы:</div>
            <div class="medical-text">${(appointmentData.completed_data?.custom_complaint || appointmentData.completed_data?.complaint?.title || appointmentData.complaint?.title || 'Не указано').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>

          ${(appointmentData.completed_data?.diagnosis || appointmentData.diagnosis) ? `
          <div class="medical-item">
            <div class="medical-label">Диагноз:</div>
            <div class="medical-text">${(() => {
              const diagnosis = appointmentData.completed_data?.diagnosis || appointmentData.diagnosis;
              const diagnosisText = diagnosis?.title ?
                `${diagnosis.title}${diagnosis.code ? ` (${diagnosis.code})` : ''}` :
                diagnosis || '';
              return diagnosisText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            })()}</div>
          </div>
          ` : ''}

          ${(appointmentData.completed_data?.treatment || appointmentData.treatment) ? `
          <div class="medical-item">
            <div class="medical-label">Лечение:</div>
            <div class="medical-text">${(() => {
              const treatment = appointmentData.completed_data?.treatment || appointmentData.treatment;
              const treatmentText = treatment?.title ?
                `${treatment.title}${treatment.code ? ` (${treatment.code})` : ''}` :
                treatment || '';
              return treatmentText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            })()}</div>
          </div>
          ` : ''}

          ${(appointmentData.completed_data?.comment || appointmentData.comment) ? `
          <div class="medical-item">
            <div class="medical-label">Комментарии:</div>
            <div class="medical-text">${(appointmentData.completed_data?.comment || appointmentData.comment || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div class="signature-section">
            <div class="signature">
              <div class="signature-label">Лечащий врач:</div>
              <div class="signature-name">${doctorData.full_name || 'Не указано'}</div>
              <div class="signature-line"></div>
              <div class="signature-text">(подпись)</div>
            </div>
            <div class="stamp">М.П.</div>
          </div>

          <div class="date-issue">
            Дата выдачи: ${new Date().toLocaleDateString('ru-RU')}
          </div>

          <div class="disclaimer">
            Документ выдан на основании медицинской карты пациента
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Configure html2pdf options for compact output
  const opt = {
    margin: [5, 5, 5, 5],
    filename: `Medical_Record_${clientData.full_name ? clientData.full_name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') : 'Patient'}_${appointmentDate.toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Create a temporary element to render HTML
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '-9999px';
  document.body.appendChild(element);

  // Generate PDF
  html2pdf().set(opt).from(element).save().then(() => {
    // Clean up
    document.body.removeChild(element);
  }).catch((error) => {
    console.error('Error generating PDF:', error);
    document.body.removeChild(element);
  });
};

export default exportMedicalDocumentHTML;