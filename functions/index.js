const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();
const REGION = "us-central1";
const QUESTION_IDS = ["q1", "q2", "q3", "q4", "q5"];

function requireVerifiedUser(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "請先使用 Google 帳戶登入。");
  }

  if (request.auth.token.email_verified !== true) {
    throw new HttpsError(
      "failed-precondition",
      "請使用已驗證電子郵件地址的 Google 帳戶登入。"
    );
  }

  return request.auth.uid;
}

function cleanText(value, fieldName, maxLength) {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", fieldName + "格式不正確。");
  }

  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maxLength) {
    throw new HttpsError(
      "invalid-argument",
      fieldName + "不可留空，並且不可超過 " + maxLength + " 個字元。"
    );
  }

  return cleaned;
}

exports.submitQuestionnaire = onCall(
  {
    region: REGION,
    timeoutSeconds: 30,
    memory: "256MiB",
    maxInstances: 10,
  },
  async (request) => {
    const uid = requireVerifiedUser(request);
    const data = request.data || {};

    const className = cleanText(data.className, "班級", 40);
    const studentNumber = cleanText(data.studentNumber, "班號", 30);

    if (!data.answers || typeof data.answers !== "object" || Array.isArray(data.answers)) {
      throw new HttpsError("invalid-argument", "請填寫全部五題答案。");
    }

    const answers = {};
    for (const questionId of QUESTION_IDS) {
      answers[questionId] = cleanText(
        data.answers[questionId],
        "第 " + questionId.slice(1) + " 題",
        2000
      );
    }

    const questionnaireRef = db.collection("participationQuestionnaires").doc(uid);

    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(questionnaireRef);
      if (existing.exists) {
        throw new HttpsError(
          "already-exists",
          "此 Google 帳戶已提交問卷。如需更正，請聯絡網站管理員。"
        );
      }

      transaction.create(questionnaireRef, {
        uid,
        className,
        studentNumber,
        answers,
        schemaVersion: 1,
        submittedAt: FieldValue.serverTimestamp(),
      });
    });

    return { submitted: true };
  }
);

exports.checkParticipation = onCall(
  {
    region: REGION,
    timeoutSeconds: 30,
    memory: "256MiB",
    maxInstances: 10,
  },
  async (request) => {
    const uid = requireVerifiedUser(request);

    try {
      const playerRef = db.collection("leaderboard").doc(uid);
      const questionnaireRef = db.collection("participationQuestionnaires").doc(uid);
      const [playerSnapshot, questionnaireSnapshot] = await Promise.all([
        playerRef.get(),
        questionnaireRef.get(),
      ]);

      const playerData = playerSnapshot.exists ? playerSnapshot.data() : {};
      const rawGames = Number(playerData.games || 0);
      const games = Number.isFinite(rawGames) ? Math.max(0, rawGames) : 0;
      const gameCompleted = games >= 1;
      const formSubmitted = questionnaireSnapshot.exists;

      return {
        games,
        gameCompleted,
        formSubmitted,
        completed: gameCompleted && formSubmitted,
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;

      console.error("Participation verification failed:", error);
      throw new HttpsError(
        "unavailable",
        "暫時無法完成核對。請稍後再試；如持續發生，請聯絡網站管理員。"
      );
    }
  }
);
