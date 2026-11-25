/*
  ============================================================
  這個檔案 = 整個網站的內容。
  要改名字、自我介紹、作品、下載連結，都只要改這裡。
  改完存檔，重新整理網頁就會看到。
  ============================================================

  小提醒
  - 文字要放在 "引號" 裡面，每一項後面要有逗號 ,
  - 名字後面有 _en 的是英文版（例如 title 是中文，title_en 是英文）。
    不想寫英文的話，_en 那一行可以整行刪掉，英文版就會直接顯示中文。
  - 圖片放進 images 資料夾，然後寫 "images/檔名.png"
  - 作品想放介紹影片的話，把 mp4 放進 videos 資料夾，然後在那個作品裡寫
    video: "videos/檔名.mp4"（影片會出現在作品頁最上面的「介紹影片」）。
    videoPoster 是還沒按播放時顯示的圖；不想放影片就把這幾行刪掉。

  出新版本的時候
  - 作品有寫 github: "帳號/專案名稱" 的話，網站會自己去 GitHub 的 Releases
    抓最新版本、檔案大小和下載連結。所以你只要在 GitHub 發布新版，
    網站的下載按鈕就會自動變成最新的，不用改這個檔案。
  - Release 裡檔名有 "-update-" 的檔案（例如 RiotAccountHub-update-v1.0.4.zip）是「更新包」，
    網站會在下載按鈕下面另外放一個「下載更新包」，給已經在用舊版的人。
  - 下面的 versions 是備用的（GitHub 連不上時才會用到），
    也可以在這裡替某一版寫比較短的更新說明（notes）。
  - 作品沒有放在 GitHub 的話，就不要寫 github，
    然後每次出新版，在 versions 的「最上面」加一筆新的。
*/

window.SITE = {

  // 改成 true 的話，網站最上面會出現「這是範例資料」的提示
  demo: false,

  // 首頁最大的那個名字
  name: "Leo",

  // 首頁下面的一句話
  intro: "這裡放的是我做的程式，每個都可以直接下載最新版。",
  intro_en: "These are the programs I made. You can download the newest version of each one.",

  // 「關於我」的內容，一個 "引號" 是一段
  about: [
    "我是 Leo，這裡放的是我做的程式。想看原始碼可以到我的 GitHub。"
  ],
  about_en: [
    "I'm Leo. This is where I put the programs I made. You can see the code on my GitHub."
  ],

  // 聯絡方式。Email 的網址要寫成 "mailto:你的信箱"
  links: [
    { label: "GitHub", url: "https://github.com/yuanleo2009-cpu" }
  ],

  // ==========================================================
  // 作品清單。要新增作品，就複製一整個 { ... } 再改內容。
  // ==========================================================
  works: [

    {
      id: "clawd-pet",            // 網址用的代號：只能用英文小寫、數字和 -，每個作品要不一樣
      title: "Clawd 桌寵",
      title_en: "Clawd Desktop Pet",
      type: "桌寵",               // 類型，隨你寫：遊戲、工具、模組、影片…
      type_en: "Desktop pet",
      color: "#ff8a3d",           // 這個作品的代表色
      icon: "images/clawd.png",   // 卡片中間的圖。沒有圖就改寫 glyph: "字"，會顯示一個大字
      pixel: true,                // 圖是像素畫的話寫 true，放大才不會糊
      cover: "",                  // 想用一整張圖當卡片封面就寫在這裡，例如 "images/cover.png"
      github: "yuanleo2009-cpu/clawd-pet",
      platform: "Windows 10 / 11",
      summary: "住在 Windows 桌面上的像素小螃蟹，雙擊牠就會打開 Claude。",
      summary_en: "A little pixel crab that lives on your Windows desktop. Double-click it to open Claude.",
      description: [
        "Clawd 是一隻橘色的像素小螃蟹，平常待在你的工作列上：浮動、眨眼、東張西望，太久沒人理牠就打哈欠睡覺。",
        "你可以摸牠、把牠拎起來搖、用力甩出去，牠都會有反應。雙擊牠就會打開桌面版 Claude。",
        "這是非官方的粉絲作品，與 Anthropic 無關。程式碼用 MIT 授權公開；Clawd 的形象和 Claude 商標屬於 Anthropic。"
      ],
      description_en: [
        "Clawd is a small orange pixel crab that sits on your taskbar. It floats, blinks and looks around. If you leave it alone for too long, it yawns and falls asleep.",
        "You can pet it, pick it up and shake it, or throw it across the screen, and it reacts every time. Double-click it to open the Claude desktop app.",
        "This is an unofficial fan project and is not connected to Anthropic. The code is open under the MIT license. The Clawd character and the Claude trademark belong to Anthropic."
      ],
      features: [
        "摸摸頭會冒愛心，搖太大力會頭暈",
        "可以拎起來丟出去，撞到螢幕邊緣會彈回來",
        "會自己跳舞、轉圈、開合跳、躲貓貓",
        "有番茄鐘、喝水提醒和整點報時",
        "可以調大小和幀率，也能換成自己的圖片和台詞",
        "安裝不需要系統管理員權限，可以開機自動啟動"
      ],
      features_en: [
        "Pet it and hearts pop out. Shake it too hard and it gets dizzy",
        "Pick it up and throw it, and it bounces off the edge of the screen",
        "It dances, spins, does jumping jacks and plays peekaboo by itself",
        "Has a pomodoro timer, a drink water reminder and an hourly chime",
        "You can change its size and frame rate, or use your own picture and lines",
        "No admin rights needed to install, and it can start with Windows"
      ],
      screenshots: ["images/clawd-demo.gif"],
      install: [
        "下載 ClawdPet-Setup 安裝檔，雙擊執行",
        "如果 Windows 顯示「已保護你的電腦」，點「其他資訊」再點「仍要執行」（因為安裝檔沒有數位簽章）",
        "照著安裝精靈按下一步，可以選要不要建立桌面捷徑和開機自動啟動",
        "裝好後，在開始功能表搜尋 Clawd 就能打開"
      ],
      install_en: [
        "Download the ClawdPet-Setup file and double-click it",
        "If Windows says it protected your PC, click \"More info\" and then \"Run anyway\" (the installer is not signed)",
        "Follow the setup steps. You can choose a desktop shortcut and start with Windows",
        "After it is installed, search for Clawd in the Start menu to open it"
      ],
      versions: [                 // 最新的放最上面
        {
          version: "1.3.1",
          date: "2026-11-24",
          size: "19 MB",
          url: "https://github.com/yuanleo2009-cpu/clawd-pet/releases/download/v1.3.1/ClawdPet-Setup-1.3.1.exe",
          notes: [
            "更常自己做動作：每 1 到 2 分鐘一次",
            "睡著 2 到 4 分鐘後會自己醒來",
            "可以調整自己做動作的頻率"
          ],
          notes_en: [
            "Does things by itself more often, about every 1 to 2 minutes",
            "Wakes up by itself after sleeping for 2 to 4 minutes",
            "You can change how often it does things by itself"
          ]
        },
        {
          version: "1.3.0",
          date: "2026-11-24",
          size: "19 MB",
          url: "https://github.com/yuanleo2009-cpu/clawd-pet/releases/download/v1.3.0/ClawdPet-Setup-1.3.0.exe",
          notes: [
            "新增餵點心",
            "新增番茄鐘、喝水提醒和整點報時",
            "可以跟著滑鼠走，也能用滾輪調整大小",
            "新動畫：打哈欠、躲貓貓、開合跳、嚇一跳"
          ],
          notes_en: [
            "You can feed it a snack",
            "Added a pomodoro timer, a drink water reminder and an hourly chime",
            "It can follow your mouse, and you can resize it with the scroll wheel",
            "New animations: yawn, peekaboo, jumping jacks and getting startled"
          ]
        },
        {
          version: "1.2.0",
          date: "2026-11-23",
          size: "19 MB",
          url: "https://github.com/yuanleo2009-cpu/clawd-pet/releases/download/v1.2.0/ClawdPet-Setup-1.2.0.exe",
          notes: [
            "會像螃蟹一樣橫著走路",
            "可以丟出去、摸摸頭、搖到頭暈",
            "新增跳舞、轉圈和打招呼",
            "右鍵多了動作選單"
          ],
          notes_en: [
            "Walks sideways like a crab",
            "You can throw it, pet it and shake it until it gets dizzy",
            "Added dancing, spinning and saying hello",
            "Added an actions menu on right-click"
          ]
        },
        {
          version: "1.1.0",
          date: "2026-11-23",
          size: "19 MB",
          url: "https://github.com/yuanleo2009-cpu/clawd-pet/releases/download/v1.1.0/ClawdPet-Setup-1.1.0.exe",
          notes: [
            "新增落地特效",
            "啟動更快，安裝檔也變小了",
            "睡著的時候更省電",
            "修正設定檔壞掉時程式開不起來的問題"
          ],
          notes_en: [
            "Added landing effects",
            "Starts faster, and the installer is smaller",
            "Uses less power while it sleeps",
            "Fixed the app not opening when the settings file was broken"
          ]
        },
        {
          version: "1.0.0",
          date: "2026-11-23",
          size: "26 MB",
          url: "https://github.com/yuanleo2009-cpu/clawd-pet/releases/download/v1.0.0/ClawdPet-Setup-1.0.0.exe",
          notes: ["第一個版本"],
          notes_en: ["First version"]
        }
      ]
    },

    {
      id: "riot-account-hub",
      title: "Riot Account Hub",
      type: "工具",
      type_en: "Tool",
      color: "#ff3d5a",
      icon: "images/riot-account-hub.png",
      cover: "",
      video: "videos/riot-account-hub-intro.mp4",              // 介紹影片（約 30 秒）
      videoPoster: "images/riot-account-hub-intro.jpg",        // 還沒按播放時顯示的圖
      videoNote_en: "The text in the video is in Chinese.",    // 影片下面的小字，只有英文版會顯示
      github: "yuanleo2009-cpu/RiotAccountHub",
      platform: "Windows 10 / 11",
      summary: "VALORANT 帳號切換器。每個帳號登入一次，之後按一下就能切換並開始遊戲。",
      summary_en: "A VALORANT account switcher. Log in to each account once, then switch and start the game with one click.",
      description: [
        "有好幾個 Riot 帳號的話，每次換帳號都要重新登入很麻煩。這個程式讓每個帳號只要登入一次，之後在帳號卡片上按「啟動」，就會自動切換到那個帳號並打開 VALORANT。",
        "Google、Facebook、Apple 和帳號密碼登入都可以用。",
        "它不會儲存你的密碼，只會把 Riot Client 自己產生的「保持登入」檔案加密存在你的電腦裡。它不會讀寫遊戲的記憶體，也不會碰 Vanguard。",
        "這不是 Riot Games 官方的程式，與 Riot Games 無關，請自己決定要不要使用。"
      ],
      description_en: [
        "If you have more than one Riot account, logging in again every time you switch is annoying. With this app you log in to each account only once. After that, click \"Launch\" on an account card and it switches to that account and opens VALORANT.",
        "It works with Google, Facebook, Apple and normal username and password logins.",
        "It does not save your password. It only keeps an encrypted copy of the \"stay signed in\" files that Riot Client makes, and they stay on your own computer. It does not read or change the game's memory, and it does not touch Vanguard.",
        "This is not an official Riot Games app and is not connected to Riot Games. Please decide for yourself if you want to use it."
      ],
      features: [
        "按一下就切換帳號並開始遊戲",
        "帳號卡片會顯示段位、遊戲卡面和目前狀態",
        "可以把一個帳號的鍵位、靈敏度和準星複製到另一個帳號",
        "可以設定主帳號，其他帳號一鍵套用它的設定",
        "用內建瀏覽器看戰績、逛熱門準星",
        "登入失效時會馬上提醒，按一下就能重新登入",
        "有新版本時，在程式裡按一下就能更新",
        "遊戲中再按一次按鈕，就能關閉 VALORANT",
        "登入資料用 Windows 內建的加密保護，只有這台電腦解得開"
      ],
      features_en: [
        "Switch accounts and start the game with one click",
        "Account cards show your rank, player card and status",
        "Copy keybinds, sensitivity and crosshair from one account to another",
        "Set a main account and apply its settings to the others with one click",
        "Check your match history and browse popular crosshairs in the built-in browser",
        "Warns you right away when a saved login stops working, with one click to log in again",
        "When a new version comes out, update it from inside the app with one click",
        "Click the button again while in game to close VALORANT",
        "Login data is protected with Windows encryption, so only this computer can open it"
      ],
      screenshots: [],
      install: [
        "下載 zip 檔，在上面按右鍵選「全部解壓縮」",
        "把 RiotAccountHub.exe 放到一個固定的資料夾",
        "雙擊打開。如果 Windows 顯示「已保護您的電腦」，按「其他資訊」再按「仍要執行」",
        "按「新增帳號」，在 Riot Client 登入，記得勾選「保持登入」",
        "回到程式按「我登入好了」。之後在帳號卡片按「啟動」就能切換帳號"
      ],
      install_en: [
        "Download the zip file, right-click it and choose \"Extract All\"",
        "Put RiotAccountHub.exe in a folder where you will keep it",
        "Double-click to open it. If Windows says it protected your PC, click \"More info\" and then \"Run anyway\"",
        "Click \"Add account\" and log in with Riot Client. Remember to check \"Stay signed in\"",
        "Go back to the app and click \"I'm logged in\". After that, click \"Launch\" on an account card to switch"
      ],
      versions: [
        {
          version: "1.0.4",
          date: "2026-11-25",
          size: "60 MB",
          url: "https://github.com/yuanleo2009-cpu/RiotAccountHub/releases/download/v1.0.4/RiotAccountHub-v1.0.4.zip",
          update: {
            url: "https://github.com/yuanleo2009-cpu/RiotAccountHub/releases/download/v1.0.4/RiotAccountHub-update-v1.0.4.zip",
            size: "60 MB"
          },
          notes: [
            "新功能：有新版本時，程式上方會出現提示，按「立即更新」就會自動更新",
            "舊版可以用更新包更新：先打開舊版，再打開更新包裡的程式，按「更新」",
            "更新包會先檢查檔案指紋，確認沒有被改過才更新"
          ],
          notes_en: [
            "New: when a new version comes out, a notice appears at the top. Click \"Update now\" and it updates itself",
            "Older versions can use the update package: open the old app, then open the program in the update package and click \"Update\"",
            "The update package is checked against its published fingerprint before anything is replaced"
          ]
        },
        {
          version: "1.0.3",
          date: "2026-11-25",
          size: "62 MB",
          url: "https://github.com/yuanleo2009-cpu/RiotAccountHub/releases/download/v1.0.3/RiotAccountHub-v1.0.3.zip",
          notes: [
            "修正：新增帳號時明明有勾「保持登入」，卻一直說沒有勾",
            "新功能：登入失效時會馬上提醒，按一下就能重新登入",
            "新功能：遊戲中再按一次按鈕，就能關閉 VALORANT",
            "切換帳號時不用再多等大約 2 秒"
          ],
          notes_en: [
            "Fixed: when adding an account, it kept saying \"Stay signed in\" was not checked even when it was",
            "New: it warns you right away when a saved login stops working, and one click lets you log in again",
            "New: click the button again while in game to close VALORANT",
            "Switching accounts no longer waits about 2 extra seconds"
          ]
        },
        {
          version: "1.0.2",
          date: "2026-11-23",
          size: "62 MB",
          url: "https://github.com/yuanleo2009-cpu/RiotAccountHub/releases/download/v1.0.2/RiotAccountHub-v1.0.2.zip",
          notes: [
            "切換帳號時，自動關掉 Riot Client 的背景影片和聲音",
            "修正幾個可能閃退或弄丟帳號清單的問題",
            "檔案處理和內建瀏覽器變得更安全"
          ],
          notes_en: [
            "Turns off Riot Client's background video and sound when you switch accounts",
            "Fixed some problems that could crash the app or lose the account list",
            "Made file handling and the built-in browser safer"
          ]
        },
        {
          version: "1.0.0",
          date: "2026-11-23",
          size: "62 MB",
          url: "https://github.com/yuanleo2009-cpu/RiotAccountHub/releases/download/v1.0.0/RiotAccountHub-v1.0.0.zip",
          notes: ["第一個公開版本"],
          notes_en: ["First public version"]
        }
      ]
    }

  ]
};
