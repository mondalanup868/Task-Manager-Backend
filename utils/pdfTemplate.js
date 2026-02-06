export const generateHTML = (userName, empid, team, from, to, records) => {
  const rows = records
    .map((r) => {
      const list = r.tasks
        .map(
          (t, i) =>
            `<li><b>${i + 1}.</b> ${t.title}${
              t.description ? ` - ${t.description}` : ""
            }</li>`
        )
        .join("");

      return `
        <div class="day">
          <h3>📅 Date: ${r.date}</h3>
          <ul>${list}</ul>
        </div>
      `;
    })
    .join("");

  return `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          color: #111;
        }

        h1 {
          text-align: center;
          margin-bottom: 10px;
        }

        .meta {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: #f9f9f9;
        }

        .meta p {
          margin: 6px 0;
          font-size: 14px;
        }

        .day {
          margin-bottom: 15px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: #fff;
        }

        .day h3 {
          margin: 0 0 10px;
          font-size: 16px;
        }

        ul {
          padding-left: 20px;
          margin: 0;
        }

        li {
          margin-bottom: 6px;
          font-size: 14px;
        }

        hr {
          margin-top: 30px;
          border: none;
          border-top: 1px solid #ddd;
        }

        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
      </style>
    </head>

    <body>
      <h1>Work Report</h1>

      <div class="meta">
        <p><b>Employee Name:</b> ${userName}</p>
        <p><b>Employee ID:</b> ${empid}</p>
        <p><b>Team:</b> ${team}</p>
        <p><b>From:</b> ${from} &nbsp;&nbsp; <b>To:</b> ${to}</p>
      </div>

      ${
        rows
          ? rows
          : `<p style="text-align:center; color:#777;">No tasks found in this date range.</p>`
      }

      <hr />
      <p class="footer">Generated Automatically by Employee Task Manager</p>
    </body>
  </html>
  `;
};
