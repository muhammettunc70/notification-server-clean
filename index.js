const express = require("express");
const admin = require("firebase-admin");
const app = express();
require("dotenv").config();

app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("Sunucu çalışıyor! 🚀");
});

// Bildirim gönderme (kullanıcıya genel)
app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: { title, body },
    token,
  };

  console.log("📤 Bildirim gönderiliyor:", JSON.stringify(message, null, 2));

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Bildirim gönderildi:", response);
    res.status(200).send("Bildirim gönderildi: " + response);
  } catch (error) {
    console.error("❌ Bildirim hatası:", error);
    res.status(500).send("Bildirim gönderilemedi.");
  }
});

// ✅ Admin mesaj yazarsa tetiklenecek yeni endpoint
app.post("/admin-reply", async (req, res) => {
  const { token, orderId } = req.body;

  const message = {
    notification: {
      title: "🔮 You've got a new message!",
      body: "The tarot reader has replied to your order.",
    },
    token,
  };

  console.log("📤 Admin cevabı bildirimi gönderiliyor:", JSON.stringify(message, null, 2));

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Bildirim gönderildi:", response);
    res.status(200).send("Notification sent: " + response);
  } catch (error) {
    console.error("❌ Bildirim hatası:", error);
    res.status(500).send("Bildirim gönderilemedi.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
