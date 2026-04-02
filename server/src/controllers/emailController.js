const db = require("../config/db");
const client = require("../config/mail");
const PDFDocument = require("pdfkit");
const axios = require("axios");

const QR_SERVICE_URL = process.env.QR_SERVICE_URL || "http://localhost:8000";

// Helper to format meals table for email
const formatMealsHtml = (meals) => {
  if (!meals || meals.length === 0) return "";
  
  let html = `
    <div style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead style="background-color: #f8f9fa;">
          <tr>
            <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: left;">Date</th>
            <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: left;">Meal</th>
            <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: left;">Time</th>
          </tr>
        </thead>
        <tbody>`;
  
  meals.forEach(meal => {
    html += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${meal.formatted_date}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-transform: capitalize;">${meal.meal_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${meal.start_time} - ${meal.end_time}</td>
          </tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>`;
  return html;
};

// Helper to generate PDF with QR code and meal schedule
const generateQrPdf = (qrBase64, participantName, eventName, meals) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      let chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => {
        const result = Buffer.concat(chunks);
        resolve(result.toString("base64"));
      });

      // Header
      doc.fontSize(24).fillColor("#2c3e50").text(eventName, { align: "center" }).moveDown(0.5);
      doc.fontSize(16).fillColor("#333").text("Meal Pass / QR Entry", { align: "center" }).moveDown(0.2);
      doc.fontSize(14).fillColor("#555").text(`Participant: ${participantName}`, { align: "center" }).moveDown(1.5);

      // QR Code
      const imgData = qrBase64.split(";base64,").pop();
      const imgBuffer = Buffer.from(imgData, "base64");
      const qrSize = 250;
      doc.image(imgBuffer, (doc.page.width - qrSize) / 2, doc.y, {
        width: qrSize,
        height: qrSize
      });
      doc.moveDown(qrSize / 12 + 1.5);

      // Meal Schedule Title
      if (meals && meals.length > 0) {
        doc.fontSize(18).fillColor("#2980b9").text("📅 Meal Schedule", { underline: true }).moveDown(0.8);
        doc.fontSize(12).fillColor("#333");
        
        meals.forEach(meal => {
          doc.text(`• ${meal.formatted_date}: ${meal.meal_name.toUpperCase()} (${meal.start_time} - ${meal.end_time})`, {
            indent: 20
          }).moveDown(0.5);
        });
      }

      // Footer
      doc.fontSize(10).fillColor("#95a5a6").text("Powered by Team Food Coupons", 0, doc.page.height - 70, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const processEmailBatch = async (participants, eventName, meals) => {
  const chunkSize = 20; // Send in batches to respect API rate limits
  let sent = 0;

  for (let i = 0; i < participants.length; i += chunkSize) {
    const chunk = participants.slice(i, i + chunkSize);
    const token_ids = chunk.map(p => p.token_id);
    let qrMap = {};

    try {
      // Fetch QRs dynamically
      const qrResponse = await axios.post(`${QR_SERVICE_URL}/generate_qr_batch`, {
        token_ids,
        error_correction: "M"
      });
      for (const res of qrResponse.data.results) {
        qrMap[res.token_id] = res.qr_base64;
      }
    } catch (error) {
      console.error(`❌ QR Service Error for chunk ${i}:`, error.message);
      continue; // Skip chunk if QR generation completely fails
    }

    const emailPromises = chunk.map(async (participant) => {
      const { id, name, email, token_id } = participant;
      const qr_code = qrMap[token_id];
      if (!qr_code) return; // Skip if QR couldn't be generated

      try {
        const pdfBase64 = await generateQrPdf(qr_code, name, eventName, meals);

        const sendSmtpEmail = {
          to: [{ email: email }],
          sender: { email: process.env.EMAIL_USER, name: "Event Team" },
          subject: `Your Meal Pass for ${eventName} 🎟️`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2c3e50;">Hello ${name},</h2>
              <p>We're excited to have you at <strong>${eventName}</strong>! Please find your personalized **Meal Pass (PDF)** attached to this email.</p>
              
              <div style="background-color: #f8f9fa; border-left: 5px solid #3498db; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Note:</strong> Your unique QR code is inside the attached PDF. Please keep it ready for scanning at the designated food counters.</p>
              </div>

              <h3 style="border-bottom: 2px solid #3498db; padding-bottom: 5px; color: #2980b9;">📅 Event Meal Schedule</h3>
              ${formatMealsHtml(meals)}

              <p style="margin-top: 30px;">Enjoy the event!</p>
              <p style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; font-size: 0.9em; color: #95a5a6;">
                Best Regards,<br>
                <strong>Team Food Coupons</strong>
              </p>
            </div>
          `,
          attachment: [{
            content: pdfBase64,
            name: "MealPass_QRCode.pdf"
          }]
        };

        await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
        await db.execute("UPDATE participants SET email_sent = TRUE WHERE id = ?", [id]);
        console.log(`✅ Email sent to ${email}`);
        sent++;
      } catch (err) {
        console.error(`❌ Failed to send email to ${email}:`, err.message);
      }
    });

    await Promise.all(emailPromises);

    // Pause briefly between chunks to avoid rate limiting
    if (i + chunkSize < participants.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return sent;
};

const sendEmailsToAllParticipants = async (req, res) => {
  try {
    const { event_id } = req.body;
    if (!event_id) {
      return res.status(400).json({ message: "event_id is required." });
    }

    const [[event]] = await db.execute("SELECT event_name FROM events WHERE event_id = ?", [event_id]);
    const eventName = event ? event.event_name : "the event";

    const [meals] = await db.execute(
      "SELECT meal_name, start_time, end_time, DATE_FORMAT(date, '%d %b %Y') as formatted_date FROM event_meals WHERE event_id = ? ORDER BY date, start_time",
      [event_id]
    );

    const [results] = await db.execute(
      "SELECT id, name, email, token_id FROM participants WHERE event_id = ? AND email_sent = FALSE",
      [event_id]
    );

    if (results.length === 0) {
      return res.status(200).json({ 
        message: "No new emails to send for this event!" 
      });
    }

    console.log(`📧 Starting email dispatch for ${results.length} participants (Event: ${event_id})`);

    // Return early with 202 Accepted to prevent HTTP timeout on free tier platforms
    res.status(202).json({ message: `✅ Email dispatch started for ${results.length} participants. This might take a few minutes.` });

    // Process in background
    processEmailBatch(results, eventName, meals).then(sent => {
      console.log(`🎉 Finished sending ${sent} emails for event ${eventName}.`);
    }).catch(err => {
      console.error("❌ Background email processing critically failed:", err);
    });

  } catch (error) {
    console.error("❌ Error initiating email batch:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
};

const sendSingleEmail = async (req, res) => {
  try {
    const { participant_id, event_id } = req.body;

    if (!participant_id || !event_id) {
      return res.status(400).json({ message: "participant_id and event_id are required in the request body." });
    }

    const [[event]] = await db.execute("SELECT event_name FROM events WHERE event_id = ?", [event_id]);
    const eventName = event ? event.event_name : "the event";

    const [meals] = await db.execute(
      "SELECT meal_name, start_time, end_time, DATE_FORMAT(date, '%d %b %Y') as formatted_date FROM event_meals WHERE event_id = ? ORDER BY date, start_time",
      [event_id]
    );

    const [results] = await db.execute(
      "SELECT name, email, token_id FROM participants WHERE id = ?",
      [participant_id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Participant not found." });
    }

    const { name, email, token_id } = results[0];

    // Generate QR code dynamically
    let qr_code;
    try {
      const qrResponse = await axios.post(`${QR_SERVICE_URL}/generate_qr_batch`, {
        token_ids: [token_id],
        error_correction: "M"
      });
      qr_code = qrResponse.data.results[0]?.qr_base64;
    } catch (err) {
      return res.status(500).json({ message: "QR Service failed to generate the code.", error: err.message });
    }

    if (!qr_code) {
      return res.status(500).json({ message: "QR code could not be created dynamically." });
    }

    const pdfBase64 = await generateQrPdf(qr_code, name, eventName, meals);

    const sendSmtpEmail = {
      to: [{ email: email }],
      sender: { email: process.env.EMAIL_USER, name: "Event Team" },
      subject: `Your Meal Pass for ${eventName} 🎟️`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2c3e50;">Hello ${name},</h2>
          <p>We're excited to have you at <strong>${eventName}</strong>! Please find your personalized **Meal Pass (PDF)** attached to this email.</p>
          
          <div style="background-color: #f8f9fa; border-left: 5px solid #3498db; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Note:</strong> Your unique QR code is inside the attached PDF. Please keep it ready for scanning at the designated food counters.</p>
          </div>

          <h3 style="border-bottom: 2px solid #3498db; padding-bottom: 5px; color: #2980b9;">📅 Event Meal Schedule</h3>
          ${formatMealsHtml(meals)}

          <p style="margin-top: 30px;">Enjoy the event!</p>
          <p style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; font-size: 0.9em; color: #95a5a6;">
            Best Regards,<br>
            <strong>Team Food Coupons</strong>
          </p>
        </div>
      `,
      attachment: [{
        content: pdfBase64,
        name: "MealPass_QRCode.pdf"
      }]
    };

    await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    await db.execute("UPDATE participants SET email_sent = TRUE WHERE id = ?", [participant_id]);
    console.log(`✅ Single Email with QR sent to ${email}`);

    res.json({ message: `✅ Email sent successfully to ${name}.` });
  } catch (error) {
    console.error("❌ Error in sendSingleEmail:", error);
    res.status(500).json({
      message: "Internal server error while sending email",
      error: error.message,
    });
  }
};

module.exports = { sendEmailsToAllParticipants, sendSingleEmail };
