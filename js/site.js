/* ============================================================
   這個檔案負責把 data.js 的內容畫成網頁，還有全部的互動效果。
   平常不用改它。要改內容請改 data.js。
   ============================================================ */
(function () {
  "use strict";

  const SITE = window.SITE || {};
  const works = (Array.isArray(SITE.works) ? SITE.works : []).filter((w) => w && w.id != null);

  // 首頁和作品頁都放在 index.html 裡，用網址後面的 #作品代號 切換畫面（所以換畫面時卡片的動畫不會斷掉）
  const hashId = () => { try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return ""; } };
  const viewNow = () => (works.some((w) => String(w.id) === hashId()) ? "work" : "home");
  let page = viewNow();   // 現在的畫面："home"（首頁）或 "work"（作品頁）

  const $ =(sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 721px)");

  /* ---------- 介面上的固定文字（中文 / 英文） ---------- */

  const UI = {
    zh: {
      siteTitle: "{name} 的作品",
      navWorks: "作品",
      navAbout: "關於",
      langBtn: "English",
      hintMouse: "點卡片看介紹和下載。也可以抓起來甩，或用 ← → 鍵切換",
      hintTap: "點卡片看介紹和下載",
      hintSwipe: "左右滑看其他作品，點卡片看介紹和下載",
      draw: "隨機抽一張",
      allWorks: "全部作品",
      all: "全部",
      aboutMe: "關於我",
      download: "下載",
      notOut: "還沒發布",
      updated: "{date} 更新",
      sep: "，",
      secVideo: "介紹影片",
      secIntro: "介紹",
      secFeat: "特色",
      secShots: "截圖",
      secInstall: "怎麼安裝",
      secHistory: "更新紀錄",
      latest: "最新",
      dlThis: "下載這個版本",
      updAsk: "已經在用舊版？",
      updLink: "下載更新包",
      updHint: "打開裡面的程式、按「更新」就好，帳號和設定都會保留。",
      updShort: "更新包",
      more: "其他作品",
      noVersion: "這個作品還沒有可以下載的版本。",
      nfTitle: "找不到這個作品",
      nfBody: "網址裡的作品代號可能打錯了，或是這個作品已經被拿掉。",
      nfLink: "看全部作品",
      empty: "還沒有作品。打開 data.js，在 works 裡加第一個。",
      demo: "現在看到的是範例資料。打開 data.js，換成你自己的作品。",
      toastDemo: "這是範例資料，還沒有真的下載連結。",
      toastNone: "這個版本還沒有放下載連結。",
      backTop: "回到最上面",
      source: "在 GitHub 看原始碼",
      shot: "{title} 的截圖 {n}"
    },
    en: {
      siteTitle: "{name}'s works",
      navWorks: "Works",
      navAbout: "About",
      langBtn: "中文",
      hintMouse: "Click a card to see more and download. You can also grab and throw it, or use the ← → keys",
      hintTap: "Tap a card to see more and download",
      hintSwipe: "Swipe to see more. Tap a card to open it.",
      draw: "Pick a random one",
      allWorks: "All works",
      all: "All",
      aboutMe: "About me",
      download: "Download",
      notOut: "Not out yet",
      updated: "updated {date}",
      sep: ", ",
      secVideo: "Intro video",
      secIntro: "About this",
      secFeat: "Features",
      secShots: "Screenshots",
      secInstall: "How to install",
      secHistory: "Version history",
      latest: "Latest",
      dlThis: "Download this version",
      updAsk: "Already using an older version?",
      updLink: "Download the update package",
      updHint: "Open the program inside and click \"Update\". Your accounts and settings are kept.",
      updShort: "Update package",
      more: "Other works",
      noVersion: "This one has no download yet.",
      nfTitle: "Can't find this work",
      nfBody: "The link may be wrong, or this work was removed.",
      nfLink: "See all works",
      empty: "No works yet. Open data.js and add your first one in works.",
      demo: "This is sample data. Open data.js and put in your own works.",
      toastDemo: "This is sample data. There is no real download link yet.",
      toastNone: "This version has no download link yet.",
      backTop: "Back to top",
      source: "See the code on GitHub",
      shot: "{title} screenshot {n}"
    }
  };

  let lang = /^zh/i.test(navigator.language || "zh") ? "zh" : "en";
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "zh" || saved === "en") lang = saved;
  } catch (e) { /* 存不了就算了，用預設語言 */ }

  const t = (key, vars) => {
    let s = UI[lang][key] || UI.zh[key] || "";
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  };
  // 拿 data.js 裡的文字：英文版優先用 xxx_en，沒有就用中文
  const tx = (obj, key) => {
    const en = obj[key + "_en"];
    return lang === "en" && en != null && en !== "" ? en : obj[key];
  };
  const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  /* ---------- 小工具 ---------- */

  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
  const hasLink = (u) => { u = String(u || "").trim(); return u !== "" && u !== "#"; };
  const safeUrl = (u) => {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return "";
    return u;
  };
  const isOutside = (u) => /^https?:/i.test(u);
  const colorOf = (w) => {
    const c = String(w.color || "").trim();
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? c : "#ffffff";
  };
  // 這個顏色上面的字，用黑的還是白的比較清楚
  const onColor = (hex) => {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const lin = (i) => {
      const v = parseInt(h.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126 * lin(0) + 0.7152 * lin(2) + 0.0722 * lin(4);
    return L > 0.179 ? "#000000" : "#ffffff";
  };
  const latest = (w) => (Array.isArray(w.versions) && w.versions.length ? w.versions[0] : null);
  const fmtDate = (s) => {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || "").trim());
    return m ? m[1] + "/" + m[2].padStart(2, "0") + "/" + m[3].padStart(2, "0") : String(s || "");
  };
  const workUrl = (w) => "#" + encodeURIComponent(w.id);
  const dlAttrs = (url) => {
    const u = hasLink(url) ? safeUrl(url) : "";
    if (!u) return 'href="#" data-nolink';
    return 'href="' + esc(u) + '"' + (isOutside(u) ? ' target="_blank" rel="noopener"' : " download");
  };

  const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  const prng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  /* ---------- 卡片 ---------- */

  // 沒有封面圖的時候，自動畫一個圖案（每個作品都不一樣，但每次打開都一樣）
  function art(w, index) {
    const rnd = prng(hash(String(w.id)));
    const f = (v) => v.toFixed(1);
    let s = "";
    const kind = index % 4;
    if (kind === 0) {
      const cx = 40 + rnd() * 120, cy = 50 + rnd() * 100;
      for (let r = 12; r < 270; r += 17) {
        s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + r + '" fill="none" stroke="currentColor" stroke-width="6"/>';
      }
    } else if (kind === 1) {
      const cx = rnd() < 0.5 ? -10 : 210;
      for (let a = 0; a <= 26; a++) {
        const ang = Math.PI + Math.PI * (a / 26);
        s += '<line x1="' + cx + '" y1="212" x2="' + f(cx + Math.cos(ang) * 420) + '" y2="' + f(212 + Math.sin(ang) * 420) +
          '" stroke="currentColor" stroke-width="5"/>';
      }
    } else if (kind === 2) {
      const fx = rnd() * 200, fy = rnd() * 200;
      for (let y = 8; y < 200; y += 23) {
        for (let x = 8; x < 200; x += 23) {
          const r = Math.max(1.5, 10.5 - Math.hypot(x - fx, y - fy) / 20);
          s += '<circle cx="' + x + '" cy="' + y + '" r="' + f(r) + '" fill="currentColor"/>';
        }
      }
    } else {
      let x = -140;
      s += '<g transform="rotate(' + f(-18 - rnd() * 26) + ' 100 100)">';
      while (x < 340) {
        const bw = 4 + rnd() * 22;
        s += '<rect x="' + f(x) + '" y="-160" width="' + f(bw) + '" height="520" fill="currentColor"/>';
        x += bw + 6 + rnd() * 16;
      }
      s += "</g>";
    }
    return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + s + "</svg>";
  }

  function cardHTML(w, index) {
    const c = colorOf(w);
    const v = latest(w);
    const cover = safeUrl(w.cover);
    const icon = safeUrl(w.icon);
    const title = String(tx(w, "title") || "");
    const glyph = tx(w, "glyph") || Array.from(title.trim())[0] || "?";
    const mono = Array.from(String(SITE.name || "?").trim())[0] || "?";
    return (
      '<div class="card" style="--c:' + c + ";--on-c:" + onColor(c) + '">' +
        '<div class="card__top"><span>' + esc(tx(w, "type") || "") + "</span>" +
          (v ? '<span class="num">v' + esc(v.version) + "</span>" : "") + "</div>" +
        '<div class="card__art">' +
          (cover
            ? '<img src="' + esc(cover) + '" alt="" draggable="false">'
            : art(w, index) + (icon
                ? '<img class="card__icon' + (w.pixel ? " is-pixel" : "") + '" src="' + esc(icon) + '" alt="" draggable="false">'
                : '<span class="card__glyph" aria-hidden="true">' + esc(glyph) + "</span>")) +
        "</div>" +
        '<div class="card__body"><div class="card__title">' + esc(title) + "</div>" +
          '<p class="card__sum">' + esc(tx(w, "summary") || "") + "</p></div>" +
        '<div class="card__back" aria-hidden="true"><span>' + esc(mono) + "</span></div>" +
        '<div class="card__foil"></div><div class="card__glare"></div>' +
      "</div>"
    );
  }

  // 游標在卡片上移動：卡片跟著傾斜，反光跟著跑
  function tilt(zone, card) {
    if (!fine) return;
    zone.addEventListener("pointermove", (e) => {
      if (zone.classList.contains("is-drag") || zone.classList.contains("is-spring")) return;
      const r = card.getBoundingClientRect();
      const x = clamp((e.clientX - r.left) / r.width, 0, 1);
      const y = clamp((e.clientY - r.top) / r.height, 0, 1);
      card.style.setProperty("--px", (x * 100).toFixed(1));
      card.style.setProperty("--py", (y * 100).toFixed(1));
      if (!calm) {
        card.style.setProperty("--ry", ((x - 0.5) * 24).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * 20).toFixed(2) + "deg");
      }
    });
    zone.addEventListener("pointerleave", () => {
      if (!zone.classList.contains("is-drag") && !zone.classList.contains("is-spring")) resetTilt(card);
    });
  }
  function resetTilt(card) {
    ["--px", "--py", "--rx", "--ry"].forEach((p) => card.style.removeProperty(p));
  }

  // 抓起來甩：拖著走的時候有慣性，放開會像彈簧一樣彈回原位
  function grab(el, card, allowed) {
    let id = null, ox = 0, oy = 0, x = 0, y = 0, r = 0, vx = 0, vy = 0;
    let lx = 0, ly = 0, lt = 0, moved = false, endedAt = -1e9, raf = 0;

    const paint = () => {
      el.style.setProperty("--dx", x.toFixed(1) + "px");
      el.style.setProperty("--dy", y.toFixed(1) + "px");
      el.style.setProperty("--dr", r.toFixed(2) + "deg");
      card.style.setProperty("--ry", clamp(vx * 0.018, -28, 28).toFixed(2) + "deg");
      card.style.setProperty("--rx", clamp(-vy * 0.018, -28, 28).toFixed(2) + "deg");
      card.style.setProperty("--px", clamp(50 + x * 0.12, 0, 100).toFixed(1));
      card.style.setProperty("--py", clamp(50 + y * 0.12, 0, 100).toFixed(1));
    };
    const rest = () => {
      x = y = r = vx = vy = 0;
      ["--dx", "--dy", "--dr"].forEach((p) => el.style.removeProperty(p));
      resetTilt(card);
      el.classList.remove("is-spring");
    };
    const spring = () => {
      let last = performance.now();
      const step = (now) => {
        // 用很小的時間格慢慢算，畫面再卡，彈回來的速度也一樣
        let left = Math.min(0.1, (now - last) / 1000);
        last = now;
        while (left > 0) {
          const dt = Math.min(0.008, left);
          left -= dt;
          vx += (-190 * x - 13 * vx) * dt;
          vy += (-190 * y - 13 * vy) * dt;
          x += vx * dt;
          y += vy * dt;
          r += (clamp(vx * 0.012, -16, 16) - r) * Math.min(1, dt * 12);
        }
        if (Math.abs(x) < 0.4 && Math.abs(y) < 0.4 && Math.hypot(vx, vy) < 8) { rest(); return; }
        paint();
        raf = requestAnimationFrame(step);
      };
      el.classList.add("is-spring");
      raf = requestAnimationFrame(step);
    };

    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (allowed && !allowed()) return;
      id = e.pointerId;
      ox = e.clientX - x;
      oy = e.clientY - y;
      lx = e.clientX; ly = e.clientY; lt = performance.now();
      moved = false;
    });
    el.addEventListener("pointermove", (e) => {
      if (e.pointerId !== id) return;
      const nx = e.clientX - ox, ny = e.clientY - oy;
      if (!moved) {
        if (Math.hypot(nx - x, ny - y) < 8) return;
        moved = true;
        cancelAnimationFrame(raf);
        el.classList.remove("is-spring");
        el.classList.add("is-drag");
        try { el.setPointerCapture(id); } catch (err) { /* 沒關係 */ }
      }
      const now = performance.now(), dt = Math.max(1, now - lt);
      vx = 0.7 * vx + 0.3 * ((e.clientX - lx) / dt) * 1000;
      vy = 0.7 * vy + 0.3 * ((e.clientY - ly) / dt) * 1000;
      lx = e.clientX; ly = e.clientY; lt = now;
      x = nx; y = ny;
      r = clamp(vx * 0.012, -16, 16);
      paint();
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      if (!moved) return;
      endedAt = performance.now();
      el.classList.remove("is-drag");
      if (performance.now() - lt > 90) { vx = 0; vy = 0; }
      vx = clamp(vx, -3200, 3200);
      vy = clamp(vy, -3200, 3200);
      if (calm) rest(); else spring();
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    // 剛剛是在拖卡片，就不要當成點擊（不然會直接換頁）
    el.addEventListener("click", (e) => {
      if (performance.now() - endedAt < 350) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    el.addEventListener("dragstart", (e) => e.preventDefault());
  }

  /* ---------- 自動抓 GitHub 上的最新版本 ---------- */

  const GH_KEEP = 30 * 60 * 1000;   // 抓過一次後，30 分鐘內不重抓

  const fmtSize = (bytes) => {
    const mb = bytes / 1e6;
    if (!(mb > 0)) return "";
    if (mb >= 1000) return (mb / 1000).toFixed(1) + " GB";
    return (mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10) + " MB";
  };
  // 從 Release 的說明裡挑出「改了什麼」的條列（跳過下載、安裝那幾段）
  const parseNotes = (body) => {
    const out = [];
    let skip = false;
    String(body || "").replace(/\r/g, "").split("\n").forEach((line) => {
      const head = /^#{1,6}\s+(.*)$/.exec(line);
      if (head) { skip = /下載|安裝|download|install|sha/i.test(head[1]); return; }
      const item = /^[-*]\s+(.*)$/.exec(line);
      if (item && !skip && out.length < 12) {
        out.push(item[1].replace(/\*\*|`/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim());
      }
    });
    return out;
  };
  // 檔名裡有 "-update-" 的是「更新包」（給已經在用舊版的人），其他的才是完整下載包
  const isMetaFile = (a) => /\.(sha256|sha512|sig|asc|txt|json|ya?ml)$/i.test(a.name);
  const isUpdateFile = (a) => /-update-/i.test(a.name);
  const fromReleases = (json) => (Array.isArray(json) ? json : [])
    .filter((r) => r && !r.draft && !r.prerelease && r.tag_name)
    .map((r) => {
      const assets = (r.assets || []).filter((a) => a && a.name && !isMetaFile(a));
      const file = assets.find((a) => !isUpdateFile(a)) || assets[0];
      const upd = assets.find((a) => isUpdateFile(a) && a !== file);
      const d = new Date(r.published_at);
      const two = (n) => String(n).padStart(2, "0");
      return {
        version: String(r.tag_name).replace(/^v/i, ""),
        date: isNaN(d) ? "" : d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()),
        size: file ? fmtSize(file.size) : "",
        url: file ? file.browser_download_url : r.html_url,
        update: upd ? { url: upd.browser_download_url, size: fmtSize(upd.size) } : null,
        notes: parseNotes(r.body)
      };
    });
  // GitHub 的版本清單 + data.js 裡自己寫的說明，合在一起
  const applyReleases = (w, rel) => {
    if (!w._own) w._own = list(w.versions);
    const own = {};
    w._own.forEach((v) => { own[String(v.version)] = v; });
    w.versions = rel.map((r) => {
      const mine = own[r.version] || {};
      return {
        version: r.version,
        date: mine.date || r.date,
        size: r.size || mine.size,
        url: r.url,
        update: r.update || mine.update || null,
        notes: list(mine.notes).length ? mine.notes : r.notes,
        notes_en: mine.notes_en
      };
    });
  };
  const ghRead = (repo) => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("gh:" + repo) || "null");
      return saved && Date.now() - saved.at < GH_KEEP ? saved.rel : null;
    } catch (e) { return null; }
  };
  const ghSave = (repo, rel) => {
    try { sessionStorage.setItem("gh:" + repo, JSON.stringify({ at: Date.now(), rel: rel })); } catch (e) { /* 沒關係 */ }
  };

  function loadReleases(done) {
    const jobs = [];
    works.forEach((w) => {
      const repo = String(w.github || "").trim();
      if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return;
      const saved = ghRead(repo);
      if (saved) { applyReleases(w, saved); return; }
      jobs.push(
        fetch("https://api.github.com/repos/" + repo + "/releases?per_page=20", { headers: { Accept: "application/vnd.github+json" } })
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error("GitHub " + res.status))))
          .then((json) => {
            const rel = fromReleases(json);
            if (!rel.length) return false;
            ghSave(repo, rel);
            applyReleases(w, rel);
            return true;
          })
          .catch(() => false)   // 連不上就用 data.js 裡寫的版本
      );
    });
    if (jobs.length) Promise.all(jobs).then((got) => { if (got.some(Boolean)) done(); });
  }

  /* ---------- 小提示 ---------- */

  let toastTimer = 0;
  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("p");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    void el.offsetWidth;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 3200);
  }

  /* ============================================================
     首頁
     ============================================================ */

  const H = { slots: [], chars: [], active: -1, busy: false, push: 60, last: -1, filter: "", fontSize: 0, run: 0 };

  function renderHome(first) {
    const hand = $("#hand"), nameEl = $("#name");
    const name = String(SITE.name || "");

    // 重畫之前，把還沒跑完的動畫狀態清掉（例如洗牌洗到一半就去了別的畫面）
    H.run++;
    H.busy = false;
    $("#draw").disabled = false;
    hand.classList.remove("is-leaving", "is-stack", "is-gather", "is-backs", "is-reveal", "is-closed");
    document.title = name ? t("siteTitle", { name: name }) : t("allWorks");

    nameEl.innerHTML =
      '<span class="sr">' + esc(name) + "</span>" +
      '<span class="hero__chars" aria-hidden="true">' +
      Array.from(name).map((ch) => (ch === " " ? " " : '<span class="ch">' + esc(ch) + "</span>")).join("") +
      "</span>";
    $("#intro").textContent = tx(SITE, "intro") || "";

    // 只有第一次打開才發牌；其他時候卡片一開始就擺在位置上
    const dealing = first && shouldDeal();
    if (!dealing) hand.classList.add("is-dealt");
    hand.classList.add("is-static");   // 排位置的時候先不要有動畫

    if (!works.length) {
      hand.innerHTML = '<p class="none">' + t("empty") + "</p>";
      $("#draw").hidden = true;
    } else {
      const mid = (works.length - 1) / 2;
      hand.innerHTML = works.map((w, n) =>
        '<a class="slot" href="' + esc(workUrl(w)) + '" data-work="' + esc(w.id) + '" style="--i:' + (n - mid) + ";--n:" + n + '" draggable="false">' +
        cardHTML(w, n) + "</a>"
      ).join("");
    }

    hand.classList.toggle("is-few", works.length > 0 && works.length <= 3);
    H.slots = $$(".slot", hand);
    H.chars = $$(".ch", nameEl);
    H.active = -1;
    H.slots.forEach(bindSlot);

    renderChips();
    renderRows();
    renderAbout();

    // 一開始的光，用中間那張卡的顏色
    if (works.length) $("#top").style.setProperty("--c", colorOf(works[Math.floor((works.length - 1) / 2)]));

    // 不是第一次來：卡片先疊在中間，再攤開
    const fanOut = first && !dealing && !calm && wide.matches;
    if (fanOut) hand.classList.add("is-closed");

    fitName();
    layoutHand();
    void hand.offsetWidth;
    hand.classList.remove("is-static");
    if (dealing) deal();
    if (fanOut) {
      const open = () => hand.classList.remove("is-closed");
      requestAnimationFrame(() => requestAnimationFrame(open));
      setTimeout(open, 300);   // 保險：畫面更新被瀏覽器暫停時，還是會攤開
    }
    showHint();
    if (!wide.matches) onHandScroll();
  }

  function renderChips() {
    const seen = new Map();
    works.forEach((w) => {
      const key = String(w.type || "");
      if (key && !seen.has(key)) seen.set(key, tx(w, "type"));
    });
    const chips = $("#chips");
    if (seen.size < 2) { chips.innerHTML = ""; return; }
    const chip = (key, label) =>
      '<button class="chip" type="button" data-type="' + esc(key) + '" aria-pressed="' + (H.filter === key) + '">' +
      esc(label) + "</button>";
    chips.innerHTML = chip("", t("all")) + Array.from(seen).map((p) => chip(p[0], p[1])).join("");
  }

  function renderRows() {
    $("#rows").innerHTML = works.map((w) => {
      const c = colorOf(w), v = latest(w), title = tx(w, "title") || "";
      return (
        '<li class="row" data-type="' + esc(w.type || "") + '" style="--c:' + c + ";--on-c:" + onColor(c) + '"' +
          (H.filter && H.filter !== String(w.type || "") ? " hidden" : "") + ">" +
          '<a class="row__link" href="' + esc(workUrl(w)) + '">' + esc(title) + "</a>" +
          '<span class="row__type">' + esc(tx(w, "type") || "") + "</span>" +
          '<span class="row__sum">' + esc(tx(w, "summary") || "") + "</span>" +
          '<span class="row__ver">' +
            (v ? '<span class="num">v' + esc(v.version) + "</span>" + (v.date ? "<time>" + esc(fmtDate(v.date)) + "</time>" : "")
               : esc(t("notOut"))) +
          "</span>" +
          (v ? '<a class="row__dl" ' + dlAttrs(v.url) + ' aria-label="' + esc(t("download") + " " + title + " v" + v.version) + '">' +
               esc(t("download")) + "</a>" : "<span></span>") +
        "</li>"
      );
    }).join("");
  }

  function renderAbout() {
    const links = list(SITE.links).filter((l) => l && l.label);
    $("#aboutText").innerHTML =
      list(tx(SITE, "about")).map((p) => "<p>" + esc(p) + "</p>").join("") +
      (links.length
        ? '<ul class="links">' + links.map((l) => {
            const u = hasLink(l.url) ? safeUrl(l.url) : "";
            return '<li><a href="' + esc(u || "#") + '"' + (isOutside(u) ? ' target="_blank" rel="noopener"' : "") + ">" +
              esc(l.label) + "</a></li>";
          }).join("") + "</ul>"
        : "");
  }

  // 名字放到最大：剛好塞滿寬度，但不要高到把卡片擠出畫面
  function fitName() {
    const el = $("#name"), inner = $(".hero__chars", el);
    if (!inner || !inner.textContent) return;
    H.chars.forEach((ch) => { ch.style.fontWeight = ""; });
    el.style.fontSize = "200px";
    const w = inner.getBoundingClientRect().width;
    if (!w) return;
    const fit = (200 * el.clientWidth) / w * 0.99;
    H.fontSize = Math.max(48, Math.min(fit, wide.matches ? innerHeight * 0.36 : 1e4, 440));
    el.style.fontSize = H.fontSize.toFixed(1) + "px";
  }

  // 算出一手牌要攤多開
  function layoutHand() {
    const hand = $("#hand"), n = H.slots.length;
    if (!n) return;
    if (!wide.matches) {
      ["--spread", "--angle", "--drop"].forEach((p) => hand.style.removeProperty(p));
      return;
    }
    const W = hand.clientWidth, w = H.slots[0].offsetWidth, half = (n - 1) / 2;
    const few = n <= 3;   // 作品少的時候，卡片大一點、攤開一點
    const angle = n > 1 ? Math.min(few ? 10 : 7, 40 / (n - 1)) : 0;
    // 最外面的卡片是斜的，上面的角會往外凸。凸出畫面的部分要扣掉，卡片才不會被切到
    const lean = Math.sin((angle * half * Math.PI) / 180) * w * 1.4;
    const room = W - 2 * Math.max(0, lean - hand.getBoundingClientRect().left);
    hand.style.setProperty("--spread", (n > 1 ? Math.max(0, Math.min(w * (few ? 0.94 : 0.8), (room - w) / (n - 1))) : 0).toFixed(1) + "px");
    hand.style.setProperty("--angle", angle.toFixed(2) + "deg");
    hand.style.setProperty("--drop", (half > 0 ? Math.min(10, 46 / (half * half)) : 0).toFixed(2) + "px");
    H.push = Math.min(w * 0.3, 80);
  }

  // 第一次打開：從下面發牌。之後再回首頁就直接擺好
  let dealtOnce = false;
  function shouldDeal() {
    let seen = dealtOnce;
    dealtOnce = true;
    try { seen = seen || sessionStorage.getItem("dealt") === "1"; sessionStorage.setItem("dealt", "1"); } catch (e) { /* 沒關係 */ }
    return !calm && !seen && wide.matches;
  }
  function deal() {
    const hand = $("#hand");
    hand.classList.add("is-dealing");
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      hand.classList.add("is-dealt");
      setTimeout(() => hand.classList.remove("is-dealing"), 1000 + H.slots.length * 80);
    };
    requestAnimationFrame(() => requestAnimationFrame(start));
    setTimeout(start, 300);   // 保險：畫面更新被瀏覽器暫停時，還是會發牌
  }

  function bindSlot(slot, k) {
    const card = slot.firstElementChild;
    slot.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch" || H.busy || !wide.matches) return;
      activate(k);
    });
    slot.addEventListener("pointerleave", () => {
      if (!wide.matches || slot.classList.contains("is-drag")) return;
      if (H.active === k) deactivate();
    });
    slot.addEventListener("focus", () => { if (slot.matches(":focus-visible")) activate(k); });
    slot.addEventListener("blur", () => { if (wide.matches && H.active === k && !slot.matches(":hover")) deactivate(); });
    // 點下去會換到作品頁（卡片直接飛過去）。那段寫在最下面的「換畫面」
    tilt(slot, card);
    grab(slot, card, () => wide.matches && !H.busy);
  }

  // 選到一張卡：旁邊的卡讓開、整個畫面的光換成它的顏色、下面顯示它的名字
  function activate(k, pick) {
    const w = works[k];
    if (!w) return;
    H.active = k;
    H.slots.forEach((s, j) => {
      s.classList.toggle("is-picked", !!pick && j === k);
      if (wide.matches) s.style.setProperty("--push", j === k ? "0px" : (j < k ? -H.push : H.push) + "px");
    });
    $("#top").style.setProperty("--c", colorOf(w));
    if (wide.matches) {
      $("#cap").innerHTML = "<b>" + esc(tx(w, "title") || "") + "</b>" + esc(tx(w, "summary") || "");
    } else {
      // 手機：名字和介紹卡片上就有了，下面只要把「現在是第幾張」的圓點亮起來
      $$(".dots i").forEach((d, j) => d.classList.toggle("is-on", j === k));
    }
  }
  function deactivate() {
    H.active = -1;
    H.slots.forEach((s) => { s.style.removeProperty("--push"); s.classList.remove("is-picked"); });
    showHint();
  }
  function showHint() {
    const cap = $("#cap");
    if (!works.length) { cap.textContent = ""; return; }
    if (wide.matches) { cap.textContent = fine ? t("hintMouse") : t("hintTap"); return; }
    // 手機：一排小圓點（每個作品一顆）加一句操作提示
    const many = works.length > 1;
    cap.innerHTML =
      (many
        ? '<span class="dots" aria-hidden="true">' + works.map((w, k) =>
            '<i style="--c:' + colorOf(w) + '"' + (k === H.active ? ' class="is-on"' : "") + "></i>").join("") + "</span>"
        : "") +
      esc(many ? t("hintSwipe") : t("hintTap"));
  }

  // 手機：左右滑的時候，中間那張卡就是「選到的」
  function onHandScroll() {
    if (wide.matches || !H.slots.length) return;
    const hand = $("#hand"), box = hand.getBoundingClientRect(), mid = box.left + box.width / 2;
    let best = 0, bestD = Infinity;
    H.slots.forEach((s, k) => {
      const r = s.getBoundingClientRect(), c = r.left + r.width / 2, d = Math.abs(c - mid);
      if (d < bestD) { bestD = d; best = k; }
      s.firstElementChild.style.setProperty("--px", clamp(50 + ((c - mid) / box.width) * 130, 0, 100).toFixed(1));
    });
    H.slots.forEach((s, k) => s.classList.toggle("is-center", k === best));
    if (best !== H.active) activate(best);
  }

  // 隨機抽一張：收牌、洗牌、翻開
  function draw() {
    const n = H.slots.length;
    if (H.busy || !n) return;
    // 不要抽到同一張：電腦上避開上次抽到的，手機上避開現在正中間那張
    if (!wide.matches) onHandScroll();   // 先確定現在正中間是哪一張
    const avoid = wide.matches ? H.last : H.active;
    let k = Math.floor(Math.random() * n);
    if (n > 1 && k === avoid) k = (k + 1 + Math.floor(Math.random() * (n - 1))) % n;
    H.last = k;
    const hand = $("#hand"), btn = $("#draw"), slot = H.slots[k];

    if (!wide.matches) {
      slot.scrollIntoView({ behavior: calm ? "auto" : "smooth", inline: "center", block: "nearest" });
      slot.classList.add("is-pop");
      setTimeout(() => slot.classList.remove("is-pop"), 600);
      return;
    }
    if (calm) { activate(k, true); slot.focus({ preventScroll: true }); return; }

    H.busy = true;
    btn.disabled = true;
    deactivate();
    hand.classList.add("is-stack", "is-gather");
    // 洗牌洗到一半，畫面被重畫了（例如去了作品頁），後面的步驟就不要再做
    const run = H.run;
    const later = (fn, ms) => setTimeout(() => { if (run === H.run) fn(); }, ms);
    later(() => { hand.classList.add("is-backs"); hand.classList.remove("is-gather"); }, 560);
    for (let j = 0; j < 3; j++) {
      later(() => H.slots.forEach((s, i) => {
        const side = (i + j) % 2 ? 1 : -1;
        s.style.setProperty("--jx", (side * (44 + Math.random() * 50)).toFixed(0) + "px");
        s.style.setProperty("--jr", (side * (4 + Math.random() * 7)).toFixed(1) + "deg");
      }), 620 + j * 230);
      later(() => H.slots.forEach((s) => {
        s.style.removeProperty("--jx");
        s.style.removeProperty("--jr");
      }), 620 + j * 230 + 115);
    }
    later(() => {
      hand.classList.add("is-reveal");
      hand.classList.remove("is-stack", "is-backs");
      activate(k, true);
      slot.focus({ preventScroll: true });
    }, 1340);
    later(() => {
      hand.classList.remove("is-reveal");
      H.busy = false;
      btn.disabled = false;
    }, 1340 + 760 + n * 60);
  }

  // 只要綁一次的事件
  function initHome() {
    const hero = $("#top"), hand = $("#hand");

    $("#draw").addEventListener("click", draw);

    $("#chips").addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      H.filter = b.dataset.type;
      $$(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
      $$(".row").forEach((r) => { r.hidden = !!H.filter && r.dataset.type !== H.filter; });
    });

    let scrollTick = false;
    hand.addEventListener("scroll", () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => { scrollTick = false; onHandScroll(); });
    }, { passive: true });

    // ← → 鍵切換卡片
    document.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || H.busy) return;
      const el = document.activeElement;
      if (el && el.closest("input, textarea, select, [contenteditable]")) return;
      const n = H.slots.length;
      if (!n || hero.getBoundingClientRect().bottom < innerHeight * 0.35) return;
      const at = H.slots.indexOf(el) >= 0 ? H.slots.indexOf(el) : H.active;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = at < 0 ? (dir > 0 ? 0 : n - 1) : (at + dir + n) % n;
      e.preventDefault();
      H.slots[next].focus({ preventScroll: wide.matches });
      activate(next, true);
    });

    // 游標：光跟著走，名字的字被推得變細
    if (fine && !calm) {
      let mx = 0, my = 0, tick = false;
      const update = () => {
        tick = false;
        const box = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", (mx - box.left).toFixed(0) + "px");
        hero.style.setProperty("--my", (my - box.top).toFixed(0) + "px");
        const reach = H.fontSize * 1.05;
        H.chars.forEach((ch) => {
          const r = ch.getBoundingClientRect();
          const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
          const f = Math.max(0, 1 - d / reach);
          ch.style.fontWeight = String(Math.round(900 - 660 * f * f));
        });
      };
      hero.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        mx = e.clientX; my = e.clientY;
        if (!tick) { tick = true; requestAnimationFrame(update); }
      });
      hero.addEventListener("pointerleave", () => {
        H.chars.forEach((ch) => { ch.style.fontWeight = ""; });
        hero.style.removeProperty("--mx");
        hero.style.removeProperty("--my");
      });
    }

    let resizeTimer = 0;
    addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { fitName(); layoutHand(); onHandScroll(); }, 80);
    });
    wide.addEventListener("change", () => render(false));
    // 字型載入好之後，名字的大小要重算。每種瀏覽器通知的時間不太一樣，所以多聽幾種
    const refit = () => { fitName(); layoutHand(); };
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(refit);
      if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", refit);
    }
    addEventListener("load", refit);
  }

  /* ============================================================
     作品頁
     ============================================================ */

  function renderWork(first) {
    const app = $("#app");
    app.classList.toggle("is-enter", !!first);
    const id = hashId();
    const index = works.findIndex((w) => String(w.id) === String(id));
    $("#home").textContent = SITE.name || "Home";

    if (index < 0) {
      document.title = t("nfTitle");
      app.innerHTML =
        '<section class="none"><h1>' + t("nfTitle") + "</h1><p>" + t("nfBody") + "</p>" +
        '<p><a href="#works">' + t("nfLink") + "</a></p></section>";
      return;
    }

    const w = works[index], c = colorOf(w), v = latest(w);
    const title = tx(w, "title") || "";
    document.title = title + (SITE.name ? " | " + SITE.name : "");
    document.documentElement.style.setProperty("--c", c);
    document.documentElement.style.setProperty("--on-c", onColor(c));

    const repo = /^[\w.-]+\/[\w.-]+$/.test(String(w.github || "")) ? String(w.github) : "";
    const kind = [tx(w, "type"), tx(w, "platform")].filter(Boolean).map(esc).join(t("sep"));
    const meta = v
      ? [v.size, v.date ? t("updated", { date: fmtDate(v.date) }) : ""].filter(Boolean).map(esc).join(t("sep"))
      : "";

    const block = (head, body, cls) =>
      '<div class="block"><h2>' + head + '</h2><div class="block__body' + (cls ? " " + cls : "") + '">' + body + "</div></div>";

    const desc = list(tx(w, "description"));
    const feats = list(tx(w, "features"));
    const shots = list(w.screenshots).map(safeUrl).filter(Boolean);
    const steps = list(tx(w, "install"));
    const vers = list(w.versions);
    const others = works.map((o, i) => ({ o: o, i: i })).filter((x) => x.i !== index);

    // 介紹影片（data.js 的 video）。videoPoster 是還沒播放時顯示的圖，videoNote 是影片下面的小字
    const video = safeUrl(w.video), poster = safeUrl(w.videoPoster), videoNote = tx(w, "videoNote") || "";
    const oldVideo = $("video.video", app);   // 重畫之前先記住正在看的影片

    app.innerHTML =
      '<section class="work">' +
        '<div class="work__card"><div class="solo" id="solo" data-work="' + esc(w.id) + '" aria-hidden="true">' + cardHTML(w, index) + "</div></div>" +
        '<div class="work__info">' +
          (kind ? '<p class="work__kind">' + kind + "</p>" : "") +
          "<h1>" + esc(title) + "</h1>" +
          '<p class="work__sum">' + esc(tx(w, "summary") || "") + "</p>" +
          (v
            ? '<div class="dl"><a class="dl__btn" ' + dlAttrs(v.url) + ">" + esc(t("download")) +
              ' <span class="num">v' + esc(v.version) + "</span></a>" +
              (meta ? '<p class="dl__meta">' + meta + "</p>" : "") + "</div>" +
              (v.update && v.update.url
                ? '<p class="dl__upd">' + esc(t("updAsk")) + ' <a ' + dlAttrs(v.update.url) + ">" + esc(t("updLink")) + "</a>" +
                  (v.update.size ? '<span class="dl__updsize">（' + esc(v.update.size) + "）</span>" : "") +
                  '<br><span class="dl__updhint">' + esc(t("updHint")) + "</span></p>"
                : "")
            : '<p class="dl__none">' + t("noVersion") + "</p>") +
          (repo ? '<p class="work__src"><a href="https://github.com/' + esc(repo) + '" target="_blank" rel="noopener">' +
            t("source") + "</a></p>" : "") +
        "</div>" +
      "</section>" +

      '<section class="blocks">' +
        (video ? block(t("secVideo"),
          '<video class="video" controls playsinline preload="metadata" src="' + esc(video) + '"' +
          (poster ? ' poster="' + esc(poster) + '"' : "") + "></video>" +
          (videoNote ? '<p class="video__note">' + esc(videoNote) + "</p>" : ""), "block__body--wide") : "") +
        (desc.length ? block(t("secIntro"), desc.map((p) => "<p>" + esc(p) + "</p>").join("")) : "") +
        (feats.length ? block(t("secFeat"), '<ul class="feat">' + feats.map((f) => "<li>" + esc(f) + "</li>").join("") + "</ul>") : "") +
        (shots.length ? block(t("secShots"), '<div class="shots">' + shots.map((s, n) =>
          '<a href="' + esc(s) + '" target="_blank" rel="noopener"><img src="' + esc(s) + '" loading="lazy" alt="' +
          esc(t("shot", { title: title, n: n + 1 })) + '"></a>').join("") + "</div>", "block__body--wide") : "") +
        (steps.length ? block(t("secInstall"), '<ol class="steps">' + steps.map((s) => "<li><span>" + esc(s) + "</span></li>").join("") + "</ol>") : "") +
        (vers.length ? block(t("secHistory"), '<ul class="vers">' + vers.map((x, n) =>
          '<li class="ver"><div class="ver__head"><span class="num">v' + esc(x.version) + "</span>" +
          (n === 0 ? '<span class="ver__tag">' + t("latest") + "</span>" : "") +
          (x.date ? "<time>" + esc(fmtDate(x.date)) + "</time>" : "") +
          '<a class="ver__dl" ' + dlAttrs(x.url) + ">" + t("dlThis") + "</a>" +
          (x.update && x.update.url ? '<a class="ver__dl ver__upd" ' + dlAttrs(x.update.url) + ">" + t("updShort") + "</a>" : "") +
          "</div>" +
          (list(tx(x, "notes")).length
            ? '<ul class="ver__notes">' + list(tx(x, "notes")).map((s) => "<li>" + esc(s) + "</li>").join("") + "</ul>"
            : "") +
          "</li>").join("") + "</ul>") : "") +
      "</section>" +

      (others.length
        ? '<section class="more"><h2>' + t("more") + '</h2><div class="more__row">' +
          others.map((x) => '<a href="' + esc(workUrl(x.o)) + '" data-work="' + esc(x.o.id) + '">' + cardHTML(x.o, x.i) + "</a>").join("") +
          "</div></section>"
        : "");

    // 畫面重畫（換語言、抓到新版本）的時候，同一支影片就把原本那個放回去，才不會看到一半又從頭開始
    const newVideo = $("video.video", app);
    if (oldVideo && newVideo && oldVideo.getAttribute("src") === newVideo.getAttribute("src")) newVideo.replaceWith(oldVideo);

    const solo = $("#solo");
    tilt(solo, solo.firstElementChild);
    grab(solo, solo.firstElementChild);
  }

  /* ============================================================
     開始
     ============================================================ */

  function render(first) {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    $$("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
    $$(".lang").forEach((lb) => { lb.textContent = t("langBtn"); lb.lang = lang === "zh" ? "en" : "zh-Hant"; });
    const demo = $("#demo");
    if (demo) { demo.hidden = !SITE.demo; demo.textContent = t("demo"); }
    const foot = $("#foot");
    if (foot) {
      foot.innerHTML = "<span>© " + new Date().getFullYear() + " " + esc(SITE.name || "") + "</span>" +
        '<a href="#top" data-top>' + t("backTop") + "</a>";
    }
    if (page === "home") renderHome(first);
    else if (page === "work") renderWork(first);
  }

  $$(".lang").forEach((btn) => {
    btn.addEventListener("click", () => {
      lang = lang === "zh" ? "en" : "zh";
      try { localStorage.setItem("lang", lang); } catch (e) { /* 沒關係 */ }
      render(false);
    });
  });

  // 還沒放下載連結的按鈕：按了會出現提示，不會亂跳
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-nolink]");
    if (!a) return;
    e.preventDefault();
    toast(SITE.demo ? t("toastDemo") : t("toastNone"));
  });

  /* ============================================================
     換畫面：首頁 ↔ 作品頁
     卡片不會消失再出現，而是從原本的位置直接飛到新的位置
     ============================================================ */

  let shown = "";       // 現在顯示的畫面："home" 或 "work:作品代號"
  let swap = null;      // 正在進行的換畫面動畫
  let clicked = null;   // 剛剛點的連結（用來知道卡片要從哪裡飛出去）
  let busyUntil = 0;    // 這個時間之前畫面還在動，先不要重畫

  const viewEl = (name) => $('.view[data-view="' + name + '"]');
  const workOf = (key) => (key.indexOf("work:") === 0 ? key.slice(5) : "");
  const indexOfWork = (id) => works.findIndex((w) => String(w.id) === String(id));

  // 這個元素被轉了幾度
  const rotOf = (el) => {
    const s = getComputedStyle(el).transform;
    if (!s || s === "none") return 0;
    const m = s.slice(s.indexOf("(") + 1, -1).split(",").map(Number);
    return Math.atan2(m[1], m[0]) || 0;
  };

  // 量一張卡片現在在畫面上的樣子：中心點、寬度、角度。不在畫面裡就回傳 null
  function measure(card) {
    const r = card.getBoundingClientRect();
    if (!r.width || r.bottom < 40 || r.top > innerHeight - 40 || r.right < 20 || r.left > innerWidth - 20) return null;
    const rot = rotOf(card.parentElement) + rotOf(card);
    return {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      w: r.width / (Math.abs(Math.cos(rot)) + 1.4 * Math.abs(Math.sin(rot))),   // 卡片是 5:7，斜的時候外框會比較寬
      rot: rot
    };
  }

  // 讓卡片從 from（剛剛量到的樣子）飛到它自己現在的位置
  function fly(card, from) {
    const holder = card.parentElement;
    const box = holder.getBoundingClientRect();
    const frame = rotOf(holder);
    const dx = from.cx - (box.left + box.width / 2), dy = from.cy - (box.top + box.height / 2);
    const cos = Math.cos(-frame), sin = Math.sin(-frame);   // 外層是斜的話，位移要換算一下
    const start =
      "translate(" + (dx * cos - dy * sin).toFixed(2) + "px, " + (dx * sin + dy * cos).toFixed(2) + "px) " +
      "rotate(" + (from.rot - frame).toFixed(4) + "rad) " +
      "scale(" + (from.w / card.offsetWidth).toFixed(4) + ")";
    return card.animate([{ transform: start, offset: 0 }], { duration: 700, easing: "cubic-bezier(.45, 0, .15, 1)" });
  }

  // 捲到對的位置：#works、#about 捲到那一段，其他都回到最上面
  function scrollToPart(id, smooth) {
    const how = smooth ? "smooth" : "instant";
    const el = page === "home" && id && id !== "top" ? document.getElementById(id) : null;
    if (el && el.getClientRects().length) el.scrollIntoView({ behavior: how, block: "start" });
    else scrollTo({ top: 0, left: 0, behavior: how });
  }

  function route() {
    const id = hashId();
    const next = viewNow();
    const key = next === "work" ? "work:" + id : "home";
    const link = clicked;
    clicked = null;

    // 同一個畫面：只要捲過去
    if (key === shown) { scrollToPart(id, !calm); return; }

    if (swap) swap.end();   // 上一次的動畫還沒跑完，先收掉
    $$("video").forEach((v) => v.pause());   // 離開這一頁就先暫停影片，不然看不到畫面還會繼續有聲音
    const prev = shown;
    shown = key;
    page = next;
    busyUntil = performance.now() + 950;

    const out = prev ? viewEl(prev.split(":")[0]) : null;
    const inn = viewEl(next);

    // 第一次打開網頁，或是使用者不要動畫：直接換
    if (!out || calm) {
      $$(".view").forEach((v) => { v.hidden = v !== inn; });
      render(!prev);
      scrollToPart(id, false);
      return;
    }

    // 1. 先量要飛出去的那張卡片：優先用剛剛點的那張，不然就用畫面上代表這個作品的那張
    let fromCard = link && link.isConnected ? $(".card", link) : null;
    if (!fromCard && prev === "home") {
      const s = H.slots[indexOfWork(workOf(key))];
      fromCard = s ? s.firstElementChild : null;
    }
    if (!fromCard && next === "home") fromCard = $("#solo .card");
    const from = fromCard ? measure(fromCard) : null;
    const fromHolder = from ? fromCard.parentElement : null;

    // 2. 換畫面。舊的畫面釘在原地慢慢淡出，新的畫面在它上面出現
    const same = out === inn;   // 從一個作品頁到另一個作品頁
    let fade = null;
    if (!same) {
      out.style.top = -scrollY + "px";
      out.classList.add("is-out");
      inn.hidden = false;
      fade = out.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-out", fill: "forwards" });
    }
    render(false);
    scrollToPart(id, false);

    // 3. 找到新畫面上的同一張卡片
    let toCard = null, slot = null;
    if (next === "work") {
      toCard = $("#solo .card");
    } else {
      const k = indexOfWork(workOf(prev));
      slot = H.slots[k] || null;
      if (slot) {
        toCard = slot.firstElementChild;
        $("#top").style.setProperty("--c", colorOf(works[k]));   // 光的顏色先接著用這個作品的
        if (!wide.matches) {   // 手機：先把這張卡片轉到正中間
          const hand = $("#hand"), hb = hand.getBoundingClientRect(), sb = slot.getBoundingClientRect();
          hand.scrollLeft += sb.left + sb.width / 2 - (hb.left + hb.width / 2);
          onHandScroll();
        }
      }
    }

    // 4. 兩邊都看得到卡片，才讓它飛過去；不然就只有淡入淡出
    const canFly = !!(from && toCard && measure(toCard));
    if (canFly) {
      if (!same) {
        fromHolder.style.visibility = "hidden";
        if (prev === "home") $("#hand").classList.add("is-leaving");   // 其他的卡片掉下去
      }
      if (slot) slot.classList.add("is-fly");
      inn.classList.add("is-flying");
    }
    inn.classList.add("is-swap");   // 新畫面其他的東西淡進來
    const flight = canFly ? fly(toCard, from) : null;

    // 5. 動畫跑完之後收拾乾淨
    const me = { end: null };
    const timer = setTimeout(() => me.end(), 900);
    me.end = () => {
      if (swap !== me) return;
      swap = null;
      clearTimeout(timer);
      if (fade) fade.cancel();
      if (flight) flight.cancel();
      if (!same) {
        out.hidden = true;
        out.classList.remove("is-out");
        out.style.top = "";
        if (prev === "home") $("#hand").classList.remove("is-leaving");
      }
      if (fromHolder) fromHolder.style.visibility = "";
      if (slot) slot.classList.remove("is-fly");
      inn.classList.remove("is-swap", "is-flying");
    };
    swap = me;
  }

  function go(hash) {
    if (location.hash !== hash) location.hash = hash;   // 網址變了會觸發 hashchange，再由 route() 換畫面
    else route();
  }

  addEventListener("hashchange", route);

  // 點網站裡的連結（#作品代號、#works、#about）
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-nolink")) return;
    e.preventDefault();
    if (a.hasAttribute("data-top")) { scrollTo({ top: 0, left: 0, behavior: calm ? "instant" : "smooth" }); return; }
    clicked = a;
    go(a.getAttribute("href"));
  });

  // 抓到 GitHub 上的新版本之後，把畫面上的版本號和下載連結換掉
  function showNewVersions() {
    // 進場或換畫面的動畫還在跑，等它跑完再換，動畫才不會被打斷
    const wait = busyUntil - performance.now();
    if (wait > 0) { setTimeout(showNewVersions, wait + 30); return; }
    if (page === "work") { renderWork(false); return; }
    H.slots.forEach((slot, k) => {
      const v = latest(works[k]), top = $(".card__top", slot);
      if (!v || !top) return;
      let num = $(".num", top);
      if (!num) { num = document.createElement("span"); num.className = "num"; top.appendChild(num); }
      num.textContent = "v" + v.version;
    });
    renderRows();
  }

  initHome();
  loadReleases(showNewVersions);
  route();
})();
