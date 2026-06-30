import ExcelJS from 'exceljs';

export async function downloadExcel(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  const headers = Object.keys(data[0]);
  
  // Add headers
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF107C41' } // Excel Green
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data
  for (const row of data) {
    const rowValues = headers.map(h => row[h]);
    const addedRow = worksheet.addRow(rowValues);
    addedRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
    });
  }

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLen = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const colLen = cell.value ? cell.value.toString().length : 10;
      if (colLen > maxLen) {
        maxLen = colLen;
      }
    });
    column.width = maxLen + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
