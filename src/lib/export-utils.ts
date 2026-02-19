// CSV and PDF export utilities

export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const escapeCell = (cell: string) => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map(row => row.map(escapeCell).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPDF(title: string, headers: string[], rows: string[][], filename: string) {
  // Generate a printable HTML table and trigger print dialog
  const tableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @media print { @page { margin: 0.5in; size: landscape; } }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #1a1a2e; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .subtitle { font-size: 11px; color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f1f5f9; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600; }
        td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: center; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • EOM Platform</div>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
      <div class="footer">Environmental Obligation Management Platform — Confidential</div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(tableHtml);
    printWindow.document.close();
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
