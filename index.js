const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNewMessageNotification = functions.firestore
    .document('orders/{orderId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        const messageData = snap.data();
        const orderId = context.params.orderId;

        // Yalnızca READER (admin) mesajıysa bildirimi gönder
        if (messageData.sender !== "READER") {
            console.log("Kullanıcı mesajı, bildirim gönderilmeyecek.");
            return null;
        }

        // İlgili sipariş belgesini al
        const orderRef = admin.firestore().collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            console.log("Sipariş bulunamadı.");
            return null;
        }

        const orderData = orderSnap.data();
        const userId = orderData.userId;

        // Kullanıcı belgesini al
        const userRef = admin.firestore().collection("users").doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            console.log("Kullanıcı bulunamadı.");
            return null;
        }

        const userData = userSnap.data();
        const fcmToken = userData.fcmToken;

        if (!fcmToken) {
            console.log("Kullanıcının FCM token'ı yok.");
            return null;
        }

        // Bildirim mesajı
        const payload = {
            notification: {
                title: "🔮 New Message from Your Tarot Reader",
                body: messageData.text || "You have a new message in your chat.",
            },
            data: {
                orderId: orderId
            }
        };

        // Bildirimi gönder
        try {
            await admin.messaging().sendToDevice(fcmToken, payload);
            console.log("✅ Bildirim başarıyla gönderildi.");
        } catch (error) {
            console.error("❌ Bildirim gönderilemedi:", error);
        }

        return null;
    });
