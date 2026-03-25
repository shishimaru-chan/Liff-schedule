// ▼▼▼ GASのURL（GET用） ▼▼▼
const GAS_URL = "https://script.google.com/macros/s/AKfycbwXt8EVgYPNHid3BV8kMxY439lnbtycM3YbcWV2SkvliOjnbxXBY9bMoeXjnVy8ijqTGQ/exec";
let scheduleMap = {};
let currentDate = new Date();

const monthLabel = document.getElementById("currentMonth");
const calendarDays = document.getElementById("calendarDays");

// 1. 絵文字の対応表を「登録ページ」と合わせる！
const OWNER_MARK = {
  mai: "🍯",
  takuya: "🍆",
  both: "🍒"
};

// 2. データを読み込む関数
function loadSchedules() {
  fetch(GAS_URL)
    .then(res => res.json())
    .then(data => {
      scheduleMap = groupSchedulesByDate(data);
      console.log("最新の予定マップ:", scheduleMap);
      renderCalendar(); // データを取ったらカレンダーを描く
    })
    .catch(err => console.error("取得エラー😢", err));
}

// 3. 日付をタップした時に予定を出す
function showSchedules(dateKey) {
  const listEl = document.getElementById("scheduleList");
  if (!scheduleMap[dateKey]) {
    listEl.innerHTML = `<div style="text-align:center; padding:20px; color:#999;">予定はありません 🎐</div>`;
    return;
  }

  listEl.innerHTML = scheduleMap[dateKey].map(item => {
    const emoji = OWNER_MARK[item.owner] || "🍯";
    const ownerName = item.owner === "mai" ? "MAI" : item.owner === "takuya" ? "TAKUYA" : "2人";
    const times = item.time ? item.time.split(",") : [];

      return `
      <div class="schedule-card-new">
        <div class="card-left">
          <div class="owner-icon">${emoji}</div>
          <div class="owner-name">${ownerName}</div>
        </div>

        <div class="card-body">
          <div class="tag-row">
            ${item.category ? `<span class="category-tag">${item.category}</span>` : ""}
            ${times.map(t => `<span class="time-tag">${t}</span>`).join("")}
          </div>
          <div class="memo-text">${item.memo || "予定なし"}</div>
        </div>

        <div class="card-right">
          <button class="edit-circle-btn" onclick="editSchedule('${item.id}', '${item.category || ""}', '${item.memo || ""}', '${times.join(",")}', '${item.owner}', '${dateKey}')">
            <span style="font-size:16px;">✏️</span>
          </button>
          <button class="delete-circle-btn" onclick="deleteSchedule('${item.id}', '${dateKey}')">
            <span style="font-size:16px; color:white;">🗑️</span>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// 4. 削除ボタンの処理
async function deleteSchedule(id, dateKey) {
  if (!confirm("この予定を消しちゃうよ？")) return;

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "delete", id: id })
    });
    const result = await res.json();
    
    if (result.result === "ok") {
      alert("消去完了！✨");
      loadSchedules(); // ★ データを再読み込みしてカレンダーを更新！
      document.getElementById("scheduleList").innerHTML = "更新中..."; // 一旦リセット
    }
  } catch (err) {
    alert("消せなかったよ...😢");
    console.error(err);
  }
}

// --- 以下、カレンダー描画などの基本機能（大きな変更なし） ---

function groupSchedulesByDate(data) {
  const map = {};
  data.forEach(item => {
    if (!map[item.date]) map[item.date] = [];
    map[item.date].push(item);
  });
  return map;
}

function renderCalendar() {
  calendarDays.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const displayMonth = String(month + 1).padStart(2, "0"); // 1月を "01" にする魔法
  monthLabel.textContent = `${year}.${displayMonth}`;;

  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const lastDate = new Date(year, month + 1, 0).getDate();
  
  for (let i = 0; i < firstDay; i++) {
    calendarDays.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateEl = document.createElement("div");
    dateEl.textContent = day;
    
    // --- ★ ここから土日の判定を追加！ ---
    // その日の日付オブジェクトを作って、曜日を取得（0:日, 6:土）
    const dayOfWeek = new Date(year, month, day).getDay(); 

    if (dayOfWeek === 0) {
      dateEl.classList.add("sunday");    // 日曜日
    } else if (dayOfWeek === 6) {
      dateEl.classList.add("saturday");  // 土曜日
    }
    // --- ★ ここまで ---

    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateKey = `${year}-${mm}-${dd}`;


    if (scheduleMap[dateKey]) {
      const markEl = document.createElement("div");
      markEl.className = "mark";
      const owners = [...new Set(scheduleMap[dateKey].map(item => item.owner))];
      markEl.textContent = owners.map(o => OWNER_MARK[o] || "").join("");
      dateEl.appendChild(markEl);
    }

    dateEl.addEventListener("click", () => {
      document.querySelectorAll(".dates div").forEach(el => el.classList.remove("selected"));
      dateEl.classList.add("selected");
      showSchedules(dateKey);
    });
    calendarDays.appendChild(dateEl);
  }
}

// 最初にデータを読み込む
loadSchedules();

// 月移動ボタン
document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);

  // ★ ここを追加！ 下のリストをリセットする
  document.getElementById("scheduleList").innerHTML = "日付をタップすると予定が表示されます";
  
  renderCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);

  // ★ ここを追加！ 下のリストをリセットする
  document.getElementById("scheduleList").innerHTML = "日付をタップすると予定が表示されます";
  
  renderCalendar();
});

document.getElementById("goToInput").addEventListener("click", () => {
  // index.html に移動する（同じフォルダにある場合）
  window.location.href = "index.html";
});

function editSchedule(id, category, memo, timesStr, owner, date) {
  const params = new URLSearchParams({
    edit: 'true',
    id: id,
    category: category,
    memo: memo,
    times: timesStr, // "10:00,11:00" みたいな文字列
    owner: owner,
    date: date      // 編集した後に元の日に戻れるように日付も送るよ
  });
  
  // 登録画面（index.html）へジャンプ！
  window.location.href = `index.html?${params.toString()}`;
}
