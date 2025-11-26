if (location.protocol === "file:" || location.protocol === "content:") {
  alert("HTMLファイルが直接開かれたことを検知しました。\nCORSエラーや、hCaptchaウィジェットのHostエラーなどが理由で正常に使用できない可能性があります。\nhttps://discord-joiner.soyaaaaana.com を使用してください。");
}

let captcha_invites = [];

let strict_mode = false;
let auto_scroll_mode = true;

let first = true;
function log(message) {
  const element = document.getElementById("log");
  if (element) {
    element.value += (first ? "" :"\n") + message;
    if (auto_scroll_mode) {
      element.scrollTop = element.scrollHeight;
    }
  }
  first = false;
}

function startCaptcha() {
  removeCaptcha();
  if (captcha_invites.length) {
    initCaptcha(captcha_invites[0].captcha_sitekey, captcha_invites[0].captcha_rqdata);
  }
  else {
    // complete
    elementDisabled(false);
    log("✅ 全て完了しました！");
  }
}

function removeCaptcha() {
  document.querySelectorAll("iframe[data-hcaptcha-widget-id]").forEach(widget => {
    hcaptcha.remove(widget.getAttribute("data-hcaptcha-widget-id"));
  });
}

async function onSuccess(key) {
  console.log("Captcha Solved: " + key);
  log("✅ Captchaが解決されました！");
  const invite_data = captcha_invites[0];
  await invite_main(invite_data.discord_token, invite_data.invite_code, invite_data.x_context_properties, invite_data.x_fingerprint, invite_data.session_id, invite_data.captcha_session_id, invite_data.captcha_rqtoken, key);
  captcha_invites.shift();
  startCaptcha();
}

let loaded = false;

function onCaptchaLoad() {
  loaded = true;
}

function initCaptcha(sitekey, rqdata) {
  if (!loaded) {
    log("❌ hCaptchaウィジェットはまだ読み込まれていません。");
    return;
  }

  let params = { sitekey: sitekey, callback: onSuccess };
  window.hcaptcha.render("captcha-box", params);
  hcaptcha.setData("", { rqdata: rqdata });
  log("hCaptchaウィジェットを配置しました。")
}

// ========== https://qiita.com/ShotaroImai/items/7ea552323a1f89d67907 ==========
function CheckOs() {
  var ua = navigator.userAgent;
  var os;

  //まずはWindowsをチェック
  if (ua.match(/Win(dows )?NT 10\.0/)) {
    os = {
      name: "Windows",
      version: "10"
    };
  }
  //NTのカーネルバージョンと名称のナンバリングは一致していない。
  else if (ua.match(/Win(dows )?NT 6\.3/)) {
    os = {
      name: "Windows",
      version: "8.1"
    };
  }
  else if (ua.match(/Win(dows )?NT 6\.2/)) {
    os = {
      name: "Windows",
      version: "8"
    };
  }
  //7より古いものは一纏め。NTより以前は最後のOtherに入れる。
  else if (ua.match(/Win(dows )?(NT [654]|9.)/)) {
    os = {
      name: "Windows",
      version: "0"
    };
  }
  //Macの判定。userAgentでは"Mac OS X"になっている。バージョン番号を正規表現で取得。
  else if (ua.match(/Mac OS X ([0-9]+)[_.]([0-9]+)[_.]([0-9]+)/)) {
    os = {
      name: "macOS",
      version: RegExp.$1 + "." + RegExp.$2 + "." + RegExp.$3
    };
  }
  //OS Xより古いものはまとめる。
  else if (ua.match(/Mac|PPC/)) {
    os = {
      name: "macOS",
      version: "0"
    };
  }
  //スマホ対応。ちゃんと動作確認してない。
  else if (ua.match(/iPhone|iPad/)) {
    os = {
      name: "iOS",
      version: "0"
    };
  }
  else if (ua.match(/Android ([\.\d]+)/)) {
    os = {
      name: "Android",
      version: RegExp.$1
    };
  }
  //Linuxはディストリは見ない。
  else if (ua.match(/Linux/)) {
    os = {
      name: "Linux",
      version: "0"
    };
  }
  //*BSDも一応書いておく。
  else if (ua.match(/^.*\s([A-Za-z]+BSD)/)) {
    os = {
      name: RegExp.$1,
      version: "0"
    };
  }
  //ここまでに該当しないものは一纏め。
  else {
    os = {
      name: "Unknown",
      version: "0"
    };
  }
  return os;
}

function CheckBrowser() {
  var nvUA = navigator.userAgent;
  //文字列を切る開始と終点の変数
  var cutSt, cutEd;
  //バージョン番号を格納する変数
  var bwVer;
  //ブラウザ名+バージョン番号にする変数
  var bw;
  //大抵はuserAgentの一番最後にそれぞれのブラウザ名とバージョン番号がある。
  //なので文字列カット終点デフォルトは末尾にする。
  cutEd = nvUA.length;

  //まずはIEのチェックから。最早11より前は一纏め。
  if (nvUA.indexOf("MSIE") != -1) {
    bw = {
      name: "Internet Explorer",
      version: "10"
    };
  }
  //IE11は"Trident"という文字列を使っている。
  else if (nvUA.indexOf("Trident") != -1) {
    bw = {
      name: "Internet Explorer",
      version: "11"
    };
  }
  //Edgeは古いものは"Edge"、Chromiumベースになってからは"Edg"。これも悪い歴史とノウハウ。
  else if (nvUA.indexOf("Edge") != -1 || nvUA.indexOf("Edg") != -1) {
    if (nvUA.indexOf("Edge") != -1) {
      //Edgeという文字列を見つけたら、そこを合図にして"Edge/"の5文字先からバージョン番号がはじまる。
      cutSt = nvUA.indexOf("Edge");
      bwVer = nvUA.substring(cutSt + 5, cutEd);
    }
    else {
      //Chromiumベースになってからは"Edg/"の4文字。
      cutSt = nvUA.indexOf("Edg");
      bwVer = nvUA.substring(cutSt + 4, cutEd);
    }
    bw = {
      name: "Edge",
      version: bwVer
    };
  }
  else if (nvUA.indexOf("Firefox") != -1) {
    cutSt = nvUA.indexOf("Firefox");
    //"Firefox/"の8文字から先がバージョン番号。
    bwVer = nvUA.substring(cutSt + 8, cutEd);
    bw = {
      name: "FireFox",
      version: bwVer
    };
  }
  //Operaは最近は"OPR"を使っているらしい。
  else if (nvUA.indexOf("OPR") != -1) {
    cutSt = nvUA.indexOf("OPR");
    bwVer = nvUA.substring(cutSt + 4, cutEd);
    bw = {
      name: "Opera",
      version: bwVer
    };
  }
  //Safariは厄介。Chromeも最後"Safari/xxxx"で終わるのでちょっと遠まわりする。
  else if (nvUA.indexOf("Safari") != -1) {
    //"Safari"があっても"Chrome"の文字列があったらGoogle Chrome。
    if (nvUA.indexOf("Chrome") != -1) {
      cutSt = nvUA.indexOf("Chrome");
      // "Chrome/xxxx Safari/xxxx"なので、スペースまでが末尾。
      cutEd = nvUA.indexOf(" ", cutSt);
      //"Chrome/"の7文字からスペース(cutED)までがバージョン番号
      bwVer = nvUA.substring(cutSt + 7, cutEd);
      bw = {
        name: "Chrome",
        version: bwVer
      };
    }
    else {
      //Safariは"Version/xxx Safari/yyy"になっており、バージョン番号はxxxの方
      cutSt = nvUA.indexOf("Version");
      cutEd = nvUA.indexOf(" ", cutSt);
      bwVer = nvUA.substring(cutSt + 8, cutEd);
      bw = {
        name: "Safari",
        version: bwVer
      };
    }
  }
  //それ以外にもブラウザは山のようにある。
  else {
    bw = {
      name: "Unknown",
      version: "0"
    };
  }
  return bw;
}
// ========== ここまで ==========

function generateRandomString(length, string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
  return Array.from(crypto.getRandomValues(new Uint8Array(length))).map((n) => string[n % string.length]).join('')
}

// ========== https://docs.discord.food/reference#launch-signature (GeminiによってJavaScriptへ変換されたコード) ==========
function generateLaunchSignature() {
  const BITS = 0b00000000100000000001000000010000000010000001000000001000000000000010000010000001000000000100000000000001000000000000100000000000n;
  const MASK_ALL = (1n << 128n) - 1n;

  let randomInt = 0n;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  for (let i = 0; i < 16; i++) {
    randomInt = (randomInt << 8n) | BigInt(bytes[i]);
  }

  const resultInt = randomInt & (~BITS & MASK_ALL);

  const hex = resultInt.toString(16).padStart(32, '0');

  return hex.substring(0, 8) + '-' +
    hex.substring(8, 12) + '-' +
    hex.substring(12, 16) + '-' +
    hex.substring(16, 20) + '-' +
    hex.substring(20, 32);
}
// ========== ここまで ==========

// Geminiが作ったcreateUUID関数（http:など、crypto.randomUUID()が使えない環境に対応するための関数）
const createUUID = () => {
  // 32文字の16進数ランダムデータ (16バイト)
  let d = new BigUint64Array(2);
  crypto.getRandomValues(d);
  let h = (d[0].toString(16).padStart(16, '0') + d[1].toString(16).padStart(16, '0')).slice(0, 32);

  // v4マスキング (13文字目を'4'、17文字目を'8'～'b')
  h = h.substring(0, 12) + '4' + h.substring(13);
  const v = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  h = h.substring(0, 16) + v + h.substring(17);

  // フォーマット
  return h.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

function getSuperPropertiesJson() {
  const os = CheckOs();
  const browser = CheckBrowser();

  return {
    "os": os.name,
    "browser": browser.name,
    "device": "",
    "system_locale": navigator.language,
    "has_client_mods": false,
    "browser_user_agent": navigator.userAgent,
    "browser_version": browser.version,
    "os_version": os.version,
    "referrer": "",
    "referring_domain": "",
    "referrer_current": "",
    "referring_domain_current": "",
    "release_channel": "stable",
    "client_build_number": 471383,
    "client_event_source": null,
    "client_launch_id": typeof crypto.randomUUID === "function" ? crypto.randomUUID() : createUUID(),
    "launch_signature": generateLaunchSignature(),
    "client_app_state": "unfocused",
    "client_heartbeat_session_id": typeof crypto.randomUUID === "function" ? crypto.randomUUID() : createUUID(),
  };
}

function getSuperProperties() {
  return btoa(JSON.stringify(getSuperPropertiesJson()));
}

function getSessionId(discord_token) {
  return new Promise((resolve, reject) => {
    let complete = false;

    const ws = new WebSocket("wss://gateway.discord.gg/?encoding=json&v=9");
    ws.onopen = () => {
      // ログイン
      ws.send(JSON.stringify({
        op: 2,
        d: {
          token: discord_token,
          capabilities: 1734653,
          properties: getSuperPropertiesJson(),
          presence: {
            status: "unknown",
            since: 0,
            activities: [],
            afk: false
          }
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // ログイン時のユーザー情報などが送られてくるメッセージのみを取得する
      if (data.op === 0 || data.t === "READY") {
        complete = true;
        ws.close();
        resolve(data.d.session_id);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error: ", error);
      reject(error);
    };

    ws.onclose = () => {
      // console.log("WebSocket connection closed.");
      if (!complete) {
        reject();
      }
    };
  });
}

async function getFingerprintAndSetCookie() {
  const response = await fetch("https://discord-joiner-api.soyaaaaana.com/experiments", {
    headers: {
      "x-context-properties": btoa(JSON.stringify({
        location: "/channels/@me"
      })),
      "x-debug-options": "bugReporterEnabled",
      "x-discord-locale": new Intl.Locale(navigator.language).baseName,
      "x-discord-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      "x-super-properties": getSuperProperties(),
    },
    credentials: "include"
  });
  if (response.ok) {
    return (await response.json()).fingerprint;
  }
  return null;
}

async function invite(discord_token, invite_code) {
  log("x-context-propertiesの値を計算しています...");
  const response = await fetch(`https://discord.com/api/v9/invites/${invite_code}?with_counts=true&with_expiration=true&with_permissions=true`, {
    "headers": {
      "authorization": discord_token,
      "x-debug-options": "bugReporterEnabled",
      "x-discord-locale": new Intl.Locale(navigator.language).baseName,
      "x-discord-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      "x-super-properties": getSuperProperties()
    }
  });

  let x_context_properties;
  if (response.ok) {
    const json = await response.json();

    x_context_properties = btoa(JSON.stringify({
      "location": "Accept Invite Page",
      "location_guild_id": json.guild.id,
      "location_channel_id": json.channel.id,
      "location_channel_type": 0
    }));

    log("✅ x-context-propertiesの値を取得しました！");
  }
  else {
    if (response.status === 404) {
      log("❌ 招待リンクが無効です。\n");
      return {
        error: "invite",
      };
    }

    x_context_properties = btoa(JSON.stringify({
      "location": "Accept Invite Page",
      "location_guild_id": "1441394248510607362",
      "location_channel_id": "1441394250297249874",
      "location_channel_type": 0
    }));

    log(`❌ x-context-propertiesの値を取得できませんでした。${strict_mode ? "操作をキャンセル" : "別の固定値を使用"}します。`);

    if (strict_mode) {
      return {
        error: "x-context-properties",
      };
    }
  }

  log("x-fingerprintの値とCookieを取得しています...");
  let x_fingerprint = null;
  try {
    x_fingerprint = await getFingerprintAndSetCookie();
    log("✅ x-fingerprintの値とCookieを取得しました！");
  }
  catch {
    log(`❌ x-fingerprintの値とCookieを取得できませんでした。${strict_mode ? "操作をキャンセル" : "これらの値を使用せずに続行"}します。`);

    if (strict_mode) {
      return {
        error: "x-fingerprint",
      };
    }
  }


  await invite_data(discord_token, invite_code, x_context_properties, x_fingerprint);
  return {
    x_context_properties: x_context_properties,
    x_fingerprint: x_fingerprint,
  };
}

function getMaskedToken(discord_token) {
  return `${discord_token.split(".")[0]}.***`;
}

async function invite_data(discord_token, invite_code, x_context_properties, x_fingerprint) {
  const token_mask = getMaskedToken(discord_token);

  log(`${token_mask} session_idの値を取得しています...`);

  let session_id;
  try {
    session_id = await getSessionId(discord_token);
    log(`✅ ${token_mask} session_idの値を取得しました！`);
  }
  catch {
    log(`❌ ${token_mask} session_idの値を取得できませんでした。${strict_mode ? "操作をキャンセル" : "ランダム文字列を使用"}します。`);

    if (strict_mode) {
      return {
        error: "session_id",
      };
    }
    else {
      session_id = generateRandomString(32, "abcdef0123456789");
    }
  }

  await invite_main(discord_token, invite_code, x_context_properties, x_fingerprint, session_id, null, null, null);
}

async function invite_main(discord_token, invite_code, x_context_properties, x_fingerprint, session_id, hcaptcha_session_id, hcaptcha_rqtoken, hcaptcha_key) {
  const token_mask = getMaskedToken(discord_token);

  const headers = {
    "authorization": discord_token,
    "content-type": "application/json",
    "x-debug-options": "bugReporterEnabled",
    "x-discord-locale": new Intl.Locale(navigator.language).baseName,
    "x-discord-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    "x-super-properties": getSuperProperties(),
  };

  if (x_context_properties) {
    headers["x-context-properties"] = x_context_properties;
  }

  if (x_fingerprint) {
    headers["x-fingerprint"] = x_fingerprint;
  }

  if (hcaptcha_key) {
    headers["x-captcha-key"] = hcaptcha_key;
  }

  if (hcaptcha_rqtoken) {
    headers["x-captcha-rqtoken"] = hcaptcha_rqtoken;
  }

  if (hcaptcha_session_id) {
    headers["x-captcha-session-id"] = hcaptcha_session_id;
  }

  log(`${token_mask} サーバーへの参加リクエストを送信しています...`);

  const response = await fetch("https://discord-joiner-api.soyaaaaana.com/invite/" + invite_code, {
    headers: headers,
    body: JSON.stringify({
      session_id: session_id
    }),
    method: "POST",
    credentials: "include"
  });

  if ((!hcaptcha_session_id || !hcaptcha_rqtoken || !hcaptcha_key) && response.status === 400) {
    log(`⚠️ ${token_mask} Captchaが要求されました。操作が全て完了次第、hCaptchaウィジェットを配置します。`)
    const json = await response.json();
    captcha_invites.push({
      discord_token: discord_token,
      invite_code: invite_code,
      x_context_properties: x_context_properties,
      x_fingerprint: x_fingerprint,
      session_id: session_id,
      captcha_sitekey: json.captcha_sitekey,
      captcha_session_id: json.captcha_session_id,
      captcha_rqdata: json.captcha_rqdata,
      captcha_rqtoken: json.captcha_rqtoken,
    });
    return;
  }

  if (response.ok) {
    log(`✅ ${token_mask} サーバーへ参加しました！`);
  }
  else if (response.status === 401) {
    log(`❌ ${token_mask} トークンが無効なため、サーバーへ参加できませんでした...`);
  }
  else if (response.status === 403) {
    const json = await response.json();
    log(`❌ ${token_mask} サーバーへ参加できませんでした...\n    エラーコード: ${json.code}\n    理由: ${json.message}`);
  }
  else {
    log(`❌ ${token_mask} サーバーへ参加できませんでした...\n    HTTPステータスコード: ${response.status}`);
  }
}

function elementDisabled(disabled) {
  const elements = [
    document.getElementById("execute"),
    document.getElementById("strict")
  ];

  if (disabled) {
    elements.forEach(element => element.setAttribute("disabled", ""));
  }
  else {
    elements.forEach(element => element.removeAttribute("disabled"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  function updateTheme() {
    const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (document.body.getAttribute("data-bs-theme") !== theme) {
      document.body.setAttribute("data-bs-theme", theme);
    }
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);
  updateTheme();
  document.body.style.display = "block";

  document.getElementById("auto_scroll").addEventListener("change", async (e) => {
    auto_scroll_mode = e.target.checked;
  });

  document.getElementById("execute").addEventListener("click", async (e) => {

    elementDisabled(true);

    strict_mode = document.getElementById("strict").checked;

    const tokens = document.getElementById("tokens").value.replaceAll("\r", "").split("\n").map(token => token.trim()).filter(token => Boolean(token));
    const invite_code = document.getElementById("invite").value.trim().replace(/^(https?:\/\/)?((canary\.|ptb\.)?discord(app)?\.com\.?\/invite\/|discord.gg\/?.*(?=\/))\//, "");

    if (tokens.length) {
      log((first ? "" : "\n") + "サーバー参加のセットアップを開始します。");
      const data = await invite(tokens.shift(), invite_code);

      if (data.error) {
        elementDisabled(false);
        return;
      }

      for (const token_index in tokens) {
        await invite_data(tokens[token_index], invite_code, data.x_context_properties, data.x_fingerprint);
      }

      log(`要求されたCaptcha数は${captcha_invites.length}個です${captcha_invites.length ? "。" : "！おめでとう✨️"}`);
      startCaptcha();
    }
    else {
      log("❌ トークンが指定されていません。");
      elementDisabled(false);
    }
  });
});
