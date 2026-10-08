export const exportToCSV = (data, filename = 'finance_data.csv') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Get keys from first object
  const headers = Object.keys(data[0]);
  
  const csvRows = [];
  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      if (Array.isArray(val)) val = val.join('; ');
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
