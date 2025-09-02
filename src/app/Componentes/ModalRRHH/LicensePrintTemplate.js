

export const generateLicensePrintTemplate = (license) => {
  const currentDate = new Date().toLocaleDateString('es-ES');
  const currentTime = new Date().toLocaleTimeString('es-ES');
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Comprobante de Licencia</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #333;
            padding: 40px;
            background: white;
          }
          
          .print-header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .print-subtitle {
            font-size: 14px;
            color: #6b7280;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-item {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 15px;
            background: #f9fafb;
          }
          
          .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 16px;
            font-weight: 500;
            color: #111827;
          }
          
          .status-approved {
            color: #059669;
            background: #d1fae5;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
          }
          
          .status-rejected {
            color: #dc2626;
            background: #fee2e2;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
          }
          
          .status-pending {
            color: #d97706;
            background: #fef3c7;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
          }
          
          .message-section {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .message-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
          }
          
          .message-content {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            font-style: italic;
            color: #4b5563;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          
          @media print {
            body { padding: 20px; }
            .info-grid { break-inside: avoid; }
            .message-section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="print-title">Comprobante de Licencia</h1>
          <p class="print-subtitle">Documento de respaldo oficial</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Tipo de Licencia</div>
            <div class="info-value">${license.type || 'N/A'}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Estado</div>
            <div class="info-value">
              <span class="status-${getStatusClass(license.status)}">
                ${license.status || 'N/A'}
              </span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Fecha de Inicio</div>
            <div class="info-value">${license.startDate || 'N/A'}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Fecha de Fin</div>
            <div class="info-value">${license.endDate || 'N/A'}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Duración</div>
            <div class="info-value">${license.duration || 0} días hábiles</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Fecha de Emisión</div>
            <div class="info-value">${currentDate}</div>
          </div>
        </div>
        
        ${license.originalMessage ? `
          <div class="message-section">
            <div class="message-title">Respaldo de Aprobación</div>
            <div class="message-content">
              ${license.originalMessage}
              ${license.startDate && license.endDate ? 
                `<br><br><strong>Fechas solicitadas:</strong> ${license.startDate} al ${license.endDate}` : 
                ''
              }
            </div>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Documento generado el ${currentDate} a las ${currentTime}</p>
          <p>Este documento es válido como comprobante oficial de licencia</p>
        </div>
      </body>
    </html>
  `;
};

// Función auxiliar para obtener la clase CSS del estado
const getStatusClass = (status) => {
  switch (status) {
    case 'Aprobada':
      return 'approved';
    case 'Rechazada':
      return 'rejected';
    default:
      return 'pending';
  }
};

// Función para manejar la impresión
export const printLicense = (license) => {
  if (!license) {
    console.error('No se proporcionó información de licencia para imprimir');
    return;
  }

  // Crear una nueva ventana para imprimir
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('No se pudo abrir la ventana de impresión. Verifica si los pop-ups están bloqueados.');
    return;
  }

  try {
    // Generar el contenido HTML
    const printContent = generateLicensePrintTemplate(license);

    // Escribir el contenido en la nueva ventana
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Esperar un poco y manejar la impresión
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Manejar el cierre después de la impresión
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
      
      // Fallback: cerrar después de 10 segundos si no se imprimió
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      }, 10000);
    }, 500);
  } catch (error) {
    console.error('Error al generar el documento de impresión:', error);
    printWindow.close();
  }
};