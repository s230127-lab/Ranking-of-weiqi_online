const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { google } = require("googleapis");

initializeApp();

const db = getFirestore();

const SPREADSHEET_ID = "15NVX-qvZ1GvV552uNoLZLxlh1DUDv7R03f6i4anwQDg";
const SHEET_NAME = "Form_Responses";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

const auth = new google.auth.GoogleAuth({
  scopes: [SHEETS_SCOPE],
});

const sheets = google.sheets({ version: "v4", auth });

function quoteSheetName(name) {
  return "'" + String(name).replace(/'/g, "''") + "'";
}

function columnToLetter(zeroBasedIndex) {
  let value = zeroBasedIndex + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function findEmailColumn(headers) {
  const accepted = new Set([
    "email",
    "emailaddress",
    "verifiedemail",
    "電子郵件",
    "電子郵件地址",
    "電郵",
    "電郵地址",
  ]);

  return headers.findIndex((header) => {
    const normalized = String(header || "")
      .toLowerCase()
      .replace(/[\s_\-()（）]/g, "");
    return accepted.has(normalized);
  });
}

async function hasFormSubmission(email) {
  const sheetPrefix = quoteSheetName(SHEET_NAME);
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetPrefix + "!1:1",
    majorDimension: "ROWS",
  });

  const headers = (headerResponse.data.values && headerResponse.data.values[0]) || [];
  const emailIndex = findEmailColumn(headers);

  if (emailIndex < 0) {
    throw new HttpsError(
      "failed-precondition",
      "找不到表單電子郵件欄位。請確認 Google Form 已啟用「收集電子郵件地址（已驗證）」，並確認回應工作表標題列包含 Email Address 欄位。"
    );
  }

  const emailColumn = columnToLetter(emailIndex);
  const emailResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetPrefix + "!" + emailColumn + "2:" + emailColumn,
    majorDimension: "COLUMNS",
  });

  const submittedEmails = (emailResponse.data.values && emailResponse.data.values[0]) || [];
  const normalizedTarget = normalizeEmail(email);
  return submittedEmails.some((candidate) => normalizeEmail(candidate) === normalizedTarget);
}

exports.checkParticipation = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB",
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先使用 Google 帳戶登入。");
    }

    const email = request.auth.token.email;
    if (typeof email !== "string" || request.auth.token.email_verified !== true) {
      throw new HttpsError(
        "failed-precondition",
        "目前登入帳戶沒有已驗證的電子郵件地址。請使用已驗證的 Google 帳戶登入。"
      );
    }

    try {
      const playerRef = db.collection("leaderboard").doc(request.auth.uid);
      const playerSnapshot = await playerRef.get();
      const playerData = playerSnapshot.exists ? playerSnapshot.data() : {};
      const games = Math.max(0, Number(playerData.games || 0));
      const safeGames = Number.isFinite(games) ? games : 0;
      const gameCompleted = safeGames >= 1;

      const formSubmitted = await hasFormSubmission(email);

      return {
        games: safeGames,
        gameCompleted,
        formSubmitted,
        completed: gameCompleted && formSubmitted,
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;

      const status = Number(
        error && (error.code || (error.response && error.response.status))
      );

      console.error("Participation verification failed", {
        status: Number.isFinite(status) ? status : "unknown",
        message: error && error.message ? error.message : "Unknown error",
      });

      if (status === 403 || status === 7) {
        throw new HttpsError(
          "permission-denied",
          "Firebase Cloud Function 的服務帳戶沒有檢視這份回應試算表的權限。請由表單擁有者或學校管理員授權。"
        );
      }

      if (status === 404 || status === 5) {
        throw new HttpsError(
          "not-found",
          "找不到指定試算表或回應工作表。請管理員檢查試算表 ID 及工作表名稱。"
        );
      }

      throw new HttpsError(
        "unavailable",
        "暫時無法完成核對。請稍後再試；如持續發生，請聯絡網站管理員。"
      );
    }
  }
);
