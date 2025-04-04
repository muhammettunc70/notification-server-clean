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

// Bildirim gönderme endpoint'i
app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: { title, body },
    token,
  };

  // 🔍 LOG: gönderilen bildirim içeriği
  console.log("📤 Bildirim gönderiliyor:", JSON.stringify(message, null, 2));

  try {
    const response = await admin.messaging().send(message);

    // ✅ LOG: başarılı gönderim
    console.log("✅ Bildirim gönderildi:", response);

    res.status(200).send("Bildirim gönderildi: " + response);
  } catch (error) {
    // ❌ LOG: hata olursa
    console.error("❌ Bildirim hatası:", error);
    res.status(500).send("Bildirim gönderilemedi.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
