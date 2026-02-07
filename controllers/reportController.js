import PDFDocument from "pdfkit";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const generatePDF = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To dates are required" });
    }

    // ✅ Date format: DD/MM/YY
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;

      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(-2);

      return `${dd}/${mm}/${yy}`;
    };

    // ✅ Fetch user
    const user = await User.findById(req.user.id);

    // ✅ Fetch tasks
    const records = await Task.find({
      userId: req.user.id,
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 });

    // ✅ Unique file name (prevents browser cache issue)
    const fileName = `WorkReport_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    // ✅ Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // -------------------------
    // TITLE
    // -------------------------
    doc.fontSize(18).fillColor("black").text("Work Report", {
      align: "center",
    });

    doc.moveDown(0.3);


    doc.moveDown(1);

    // -------------------------
    // META INFO
    // -------------------------
    doc.fillColor("black").fontSize(12);

    doc.text(`Employee Name : ${user?.name || "N/A"}`);
    doc.text(`Employee ID   : ${user?.empid || "N/A"}`);
    doc.text(`Team          : ${user?.team || "N/A"}`);
    doc.text(`Report Period : ${formatDate(from)}  to  ${formatDate(to)}`);

    doc.moveDown(1); // ✅ spacing only (no line)

    // -------------------------
    // NO RECORDS
    // -------------------------
doc.text("", { underline: true });

    if (!records || records.length === 0) {
      doc
        .fontSize(12)
        .fillColor("gray")
        .text("No tasks found in this date range.", { align: "center" });

      doc.end();
      return;
    }

    // -------------------------
    // TASKS DAY WISE
    // -------------------------
    records.forEach((r) => {
      // Page break
      if (doc.y > 740) doc.addPage();

      // Date heading
      doc.fillColor("black").fontSize(13).text(`Date: ${formatDate(r.date)}`, {
        underline: true,
      });

      doc.moveDown(0.5);

      if (!r.tasks || r.tasks.length === 0) {
        doc.fontSize(11).fillColor("gray").text("No tasks for this day.");
        doc.moveDown(1);
        return;
      }

      r.tasks.forEach((t, index) => {
        if (doc.y > 760) doc.addPage();

        doc.fillColor("black").fontSize(12).text(`${index + 1}. ${t.title}`);

        if (t.description) {
          doc
            .fillColor("gray")
            .fontSize(11)
            .text(`   - ${t.description}`);
        }

        doc.moveDown(0.3);
      });

      doc.moveDown(0.8);
    });

    // -------------------------
    // FOOTER (Removed line)
    // -------------------------
    doc.moveDown(1);

    doc.end();
  } catch (error) {
    console.log("PDF generation error:", error);
    return res.status(500).json({ message: "PDF generation failed" });
  }
};
