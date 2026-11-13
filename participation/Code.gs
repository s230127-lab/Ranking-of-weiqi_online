/**
 * 圍棋參與紀錄：Google 表單核對服務
 *
 * 部署方式：
 * 1. 將此程式貼到 Apps Script 專案。
 * 2. 確認執行帳戶可以檢視表單回應試算表。
 * 3. 部署為網頁應用程式，執行身分選「我」，存取權限選「所有人」。
 * 4. 將部署網址貼到 participation/index.html 的 APPS_SCRIPT_URL。
 *
 * 本程式只回傳是否找到電子郵件，不會回傳試算表中的個人答案。
 */

const CONFIG = Object.freeze({
  SPREADSHEET_ID: "15NVX-qvZ1GvV552uNoLZLxlh1DUDv7R03f6i4anwQDg",
  SHEET_NAME: "Form_Responses",
  FIREBASE_API_KEY: "AIzaSyBOcBPN-D8S4-4lJ6LwzGcBV-N4CI60bdzI"
});

/**
 * JSONP endpoint，供 GitHub Pages 前端跨網域讀取核對結果。
 * 只接受固定 callback 名稱，避免 callback 參數被用來注入程式碼。
 */
function doGet(event) {
  const callback = String((event && event.parameter && event.parameter.callback) || "");
  const token = String((event && event.parameter && event.parameter.token) || "");

  if (callback !== "weiqiFormCheck") {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "invalid_request" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let result;
  try {
    result = verifyFormSubmission_(token);
  } catch (error) {
    console.error("Form verification failed: " + error);
    result = { ok: false, error: "form_check_failed" };
  }

  return ContentService
    .createTextOutput("weiqiFormCheck(" + JSON.stringify(result) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/**
 * 以 Firebase ID token 識別登入者，再在回應表中比對其已驗證電郵。
 */
function verifyFormSubmission_(idToken) {
  if (!idToken || idToken.length > 6000) {
    return { ok: false, error: "auth_invalid" };
  }

  const identity = verifyFirebaseIdentity_(idToken);
  if (!identity || !identity.email || identity.emailVerified !== true) {
    return { ok: false, error: "auth_invalid" };
  }

  const email = normalizeEmail_(identity.email);
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME) || spreadsheet.getSheets()[0];

  if (!sheet) {
    return { ok: false, error: "spreadsheet_unavailable" };
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 1 || lastColumn < 1) {
    return { ok: false, error: "email_column_missing" };
  }

  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  const emailColumn = findEmailColumn_(headers);
  if (emailColumn < 0) {
    return { ok: false, error: "email_column_missing" };
  }

  if (lastRow < 2) {
    return { ok: true, submitted: false };
  }

  const values = sheet.getRange(2, emailColumn + 1, lastRow - 1, 1).getDisplayValues();
  const submitted = values.some(function(row) {
    return normalizeEmail_(row[0]) === email;
  });

  return { ok: true, submitted: submitted };
}

/**
 * 使用 Firebase Authentication 的 accounts:lookup 驗證 ID token。
 * 不信任前端傳入的電子郵件地址；電郵只取自已驗證的 Firebase token。
 */
function verifyFirebaseIdentity_(idToken) {
  const url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" +
    encodeURIComponent(CONFIG.FIREBASE_API_KEY);

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ idToken: idToken }),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    console.warn("Firebase token lookup rejected with HTTP " + response.getResponseCode());
    return null;
  }

  const body = JSON.parse(response.getContentText());
  const users = body && body.users;
  if (!users || !users.length) return null;

  return {
    email: String(users[0].email || ""),
    emailVerified: users[0].emailVerified === true
  };
}

/**
 * 支援 Google Forms 常見英文及繁體中文電郵欄位名稱。
 * 回傳 0-based 欄索引；找不到時回傳 -1。
 */
function findEmailColumn_(headers) {
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i] || "")
      .toLowerCase()
      .replace(/[\s_\-()（）]/g, "");

    if (
      header === "email" ||
      header === "emailaddress" ||
      header === "verifiedemail" ||
      header === "電子郵件" ||
      header === "電子郵件地址" ||
      header === "電郵" ||
      header === "電郵地址"
    ) {
      return i;
    }
  }
  return -1;
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}
