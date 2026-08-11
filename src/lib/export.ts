import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportSection {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export function exportExcel(fileName: string, sections: ExportSection[]) {
  const wb = XLSX.utils.book_new();
  sections.forEach((section, i) => {
    const ws = XLSX.utils.aoa_to_sheet([section.columns, ...section.rows]);
    ws["!cols"] = section.columns.map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      (section.title || `Sheet ${i + 1}`).slice(0, 28),
    );
  });
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportPdf(
  fileName: string,
  title: string,
  subtitle: string,
  sections: ExportSection[],
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFillColor(30, 41, 66);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(`DEMO — ${title}`, 40, 26);
  doc.setFontSize(9);
  doc.text(subtitle, 40, 43);

  let y = 78;
  sections.forEach((section) => {
    doc.setTextColor(30, 41, 66);
    doc.setFontSize(11);
    doc.text(section.title, 40, y);
    autoTable(doc, {
      head: [section.columns],
      body: section.rows.map((r) => r.map((c) => String(c))),
      startY: y + 8,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [45, 63, 96], textColor: 255 },
      alternateRowStyles: { fillColor: [244, 246, 250] },
      margin: { left: 40, right: 40 },
    });
    const last = (doc as unknown as { lastAutoTable?: { finalY: number } })
      .lastAutoTable;
    y = (last?.finalY ?? y) + 34;
    if (y > doc.internal.pageSize.getHeight() - 90) {
      doc.addPage();
      y = 60;
    }
  });

  doc.save(`${fileName}.pdf`);
}
