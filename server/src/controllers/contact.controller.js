import pool from "../config/db.js";


export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject?.trim() || "Portfolio Contact";
    const cleanMessage = message.trim();

    if (cleanName.length > 100 || cleanEmail.length > 254 ||
        cleanSubject.length > 150 || cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    await pool.execute(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [cleanName, cleanEmail, cleanSubject, cleanMessage]
    );

    const emailResponse = await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: process.env.API_SECRET,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok || !emailResult.success) {
      throw new Error(emailResult.message || "Google email service failed");
    }

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send your message. Please try again later.",
    });
  }
};

export const getAdminMessages = async (req, res) => {
  try {
    const [messages] = await pool.query(
      `SELECT id, name, email, subject, message, status, created_at
       FROM contact_messages
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Fetch admin messages error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages.",
    });
  }
};

export const updateAdminMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["unread", "read", "replied"];

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status.",
      });
    }

    const [result] = await pool.execute(
      "UPDATE contact_messages SET status = ? WHERE id = ?",
      [status, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message status updated.",
    });
  } catch (error) {
    console.error("Update message status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update message status.",
    });
  }
};

export const deleteAdminMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM contact_messages WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete message.",
    });
  }
};
