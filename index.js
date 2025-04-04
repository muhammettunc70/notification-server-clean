const express = require("express");
const admin = require("firebase-admin");
const app = express();
require("dotenv").config();

app.use(express.json());

const serviceAccount = require("./firebaseKey.json");

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

  try {
    const response = await admin.messaging().send(message);
    res.status(200).send("Bildirim gönderildi: " + response);
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).send("Bildirim gönderilemedi.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
