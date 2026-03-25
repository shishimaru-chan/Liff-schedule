// ▼▼▼ ここにGASのURLを貼る ▼▼▼
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxJrlczVOw6_WCOXfA0jpIFTUJwIsdA48QuAAFZXPCMnKK6UngPoF810JN78rew8MbeaQ/exec';
let myProfile = null; // ←【追加①】

window.addEventListener('DOMContentLoaded', async () => {
  await liff.init({
    liffId: '2008794909-gcaJmGXJ',
  });

  myProfile = await liff.getProfile(); // ←【追加②】

  console.log('LIFF起動OK:', liff.isInClient());
});

window.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('submitBtn');
});

let selectedDate = null;
let currentDate = new Date();

const monthLabel = document.getElementById('currentMonth');
const calendarDays = document.getElementById('calendarDays');


function renderCalendar() {
  calendarDays.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const displayMonth = String(month + 1).padStart(2, "0"); // 1月を "01" にする魔法
  monthLabel.textContent = `${year}.${displayMonth}`;;

  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const lastDate = new Date(year, month + 1, 0).getDate();

  // ① 空白セル
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendarDays.appendChild(empty);
  }

  // ② 日付セル
  for (let day = 1; day <= lastDate; day++) {
    const dateEl = document.createElement('div');
    
    // 【重要】まず数字を入れる！（これが消えてたかも）
    dateEl.textContent = day; 

    const now = new Date();
    if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
      dateEl.classList.add('today');
    }

    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek === 0) dateEl.classList.add('sunday');
    if (dayOfWeek === 6) dateEl.classList.add('saturday');

    // この日の日付文字列を作る（保存・読み込み用）
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // --- ここがステップ1の「絵文字チェック」 ---
    const savedEmoji = localStorage.getItem(dateStr); 
    if (savedEmoji) {
      const mark = document.createElement('span');
      mark.className = 'mark';
      mark.textContent = savedEmoji; 
      dateEl.appendChild(mark);
    }
    // ---------------------------------------

    dateEl.addEventListener('click', () => {
      document.querySelectorAll('.dates div').forEach(el => el.classList.remove('selected'));
      dateEl.classList.add('selected');
      selectedDate = dateStr;
      console.log('選択中の日付:', selectedDate);
    });
    calendarDays.appendChild(dateEl);
  }
}

renderCalendar();

document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

const timeButtons = document.querySelectorAll('.time-group .btn');

timeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.textContent === '1日') {
      // 1日を選んだら他を解除
      timeButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    } else {
      // 朝〜夜を選んだら「1日」を解除
      timeButtons.forEach((b) => {
        if (b.textContent === '1日') b.classList.remove('selected');
      });
      btn.classList.toggle('selected');
    }
  });
});

const categoryButtons = document.querySelectorAll('.category-group .btn');

categoryButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// --- 2. 登録ボタンの処理をこれ一つにまとめる！ ---
// --- 1. ボタンを特定 ---
const finalSubmitBtn = document.getElementById('submitBtn');

// --- 2. 登録ボタンの処理（ここ！ () の前に async を入れるのが超大事！） ---
finalSubmitBtn.addEventListener('click', async () => { 
  console.log('登録ボタン押された（完全合体版）');

  // テスト用プロフィールの設定
  if (!myProfile) {
    myProfile = {
      userId: 'Uaf91e05353fdded14ddfb91c3032a52c',
      displayName: 'まい（テスト中）'
    };
  }

  // ① 日付チェック
  if (!selectedDate) return alert('日付を選んでね！');

  // ② 誰が操作しているか判定
  let loginUser = (myProfile.userId === 'Uaf91e05353fdded14ddfb91c3032a52c') ? 'mai' : 'takuya';

  // ③ ラジオボタンの選択確認
  const selectedInput = document.querySelector('input[name="scheduleType"]:checked');
  if (!selectedInput) return alert('「自分の予定」か「2人の予定」を選んでね！');

  // ④ スプシに送る名前と絵文字を決定
  let finalOwner = (selectedInput.value === 'both') ? 'both' : loginUser;
  let emoji = (finalOwner === 'both') ? '🍒' : (finalOwner === 'mai' ? '🍯' : '🍆');

  // ⑤ スマホ(LocalStorage)に保存＆カレンダー更新
  localStorage.setItem(selectedDate, emoji);
  renderCalendar();

  // ⑥ 入力値の取得（時間・カテゴリ・メモ）
  const time = Array.from(document.querySelectorAll('.time-group .btn.selected')).map(b => b.textContent).join(',');
  const category = document.querySelector('.category-group .btn.selected')?.textContent || '';
  const memo = document.querySelector('textarea').value;

  // ⑦ GASに送る荷物（payload）
  const payload = {
    date: selectedDate,
    owner: finalOwner,
    time: time,
    category: category,
    memo: memo,
    userId: myProfile.userId
  };

  alert(`${selectedDate} に ${emoji} を登録したよ！`);

  // ⑧ 【ここが await を使う場所！】
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    console.log('GAS送信結果:', result);
  } catch (err) {
    console.error('GAS送信エラー:', err);
  }
}); // ← 最後の閉じカッコ

// ページが読み込まれたら実行
window.addEventListener('DOMContentLoaded', () => {
  // 1. URLのパラメータ（?以降のデータ）を取得
  const params = new URLSearchParams(window.location.search);
  
  // 2. 「編集モード(edit=true)」かどうかチェック
  if (params.get('edit') === 'true') {
    console.log("編集モードで起動したよ！");

    // 3. 各入力欄にデータをセット
    // ※ id名（memo, category等）は、まいちゃんのHTMLのidに合わせてね！
    if (params.get('memo')) {
      document.getElementById('memo').value = params.get('memo');
    }
    
    if (params.get('category')) {
      document.getElementById('category').value = params.get('category');
    }

    if (params.get('date')) {
      document.getElementById('date').value = params.get('date');
    }

    // 時間（times）の処理
    // "10:00,11:00" みたいな文字列で届くから、分割してセット
    const times = params.get('times') ? params.get('times').split(',') : [];
    if (times.length > 0) {
      // 最初の時間をセット（input type="time" の場合）
      if (document.getElementById('startTime')) {
        document.getElementById('startTime').value = times[0];
      }
      // 終わりの時間があればセット
      if (times.length > 1 && document.getElementById('endTime')) {
        document.getElementById('endTime').value = times[times.length - 1];
      }
    }

    // 4. 「登録」ボタンの文字を「更新する」に変える
    const submitBtn = document.querySelector('button[type="submit"]') || document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.innerText = "予定を更新する";
      submitBtn.style.backgroundColor = "#4CAF50"; // 更新時は色を変えると分かりやすい！
    }

    // 5. 重要：編集対象の「ID」を隠し要素として持っておく（あとでGASに送るため）
    const hiddenId = document.createElement('input');
    hiddenId.type = 'hidden';
    hiddenId.id = 'editId';
    hiddenId.value = params.get('id');
    document.body.appendChild(hiddenId);
  }
});
