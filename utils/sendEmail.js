import Brevo from "@getbrevo/brevo";

export const sendEmail = async (to, subject, otp) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();

    // ✅ Correct API key setup
    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;

    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 6px; color: #2563eb;">${otp}</h1>
        <p>This OTP is valid for <b>5 minutes</b>.</p>
      </div>
    `;

    sendSmtpEmail.sender = {
      name: "Employee Task Manager",
      email: process.env.FROM_EMAIL,
    };

    sendSmtpEmail.to = [{ email: to }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Brevo Email sent:", data);
    return data;
  } catch (error) {
    console.log("❌ Brevo Email error:", error?.response?.body || error);
    throw error;
  }
};
