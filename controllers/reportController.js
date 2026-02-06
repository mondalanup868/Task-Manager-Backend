import puppeteer from "puppeteer";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { generateHTML } from "../utils/pdfTemplate.js";

export const generatePDF = async (req, res) => {
  const { from, to } = req.query;

  const user = await User.findById(req.user.id);

  const records = await Task.find({
    userId: req.user.id,
    date: { $gte: from, $lte: to },
  }).sort({ date: 1 });

const html = generateHTML(user.name, user.empid, user.team, from, to, records);



  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=report_${from}_to_${to}.pdf`,
  });

  res.send(pdfBuffer);
};
