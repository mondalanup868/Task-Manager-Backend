import PDFDocument from "pdfkit";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const generatePDF = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To dates are required" });
    }

    // ✅ Fetch user
    const user = await User.findById(req.user.id);

    // ✅ Fetch tasks
    const records = await Task.find({
      userId: req.user.id,
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 });

    // ✅ Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${from}_to_${to}.pdf`
    );

    // ✅ Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    // -------------------------
    // TITLE
    // -------------------------
    doc.fontSize(20).text("Work Report", { align: "center" });
    doc.moveDown(1);

    // -------------------------
    // META INFO
    // -------------------------
    doc.fontSize(12);
    doc.text(`Employee Name: ${user?.name || "N/A"}`);
    doc.text(`Employee ID: ${user?.empid || "N/A"}`);
    doc.text(`Team: ${user?.team || "N/A"}`);
    doc.text(`From: ${from}    To: ${to}`);
    doc.moveDown(1);

    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // -------------------------
    // RECORDS
    // -------------------------
    if (!records || records.length === 0) {
      doc
        .fontSize(13)
        .fillColor("gray")
        .text("No tasks found in this date range.", { align: "center" });

      doc.end();
      return;
    }

    records.forEach((r) => {
      doc.fillColor("black").fontSize(14).text(`📅 Date: ${r.date}`, {
        underline: true,
      });

      doc.moveDown(0.5);

      if (!r.tasks || r.tasks.length === 0) {
        doc.fontSize(12).fillColor("gray").text("No tasks for this day.");
        doc.moveDown(1);
        return;
      }

      r.tasks.forEach((t, index) => {
        doc.fillColor("black").fontSize(12).text(`${index + 1}. ${t.title}`);

        if (t.description) {
          doc
            .fillColor("gray")
            .fontSize(11)
            .text(`   - ${t.description}`);
        }

        doc.moveDown(0.3);
      });

      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);
    });

    // -------------------------
    // FOOTER
    // -------------------------
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("Generated Automatically by Employee Task Manager", {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.log("PDF generation error:", error);
    return res.status(500).json({ message: "PDF generation failed" });
  }
};
