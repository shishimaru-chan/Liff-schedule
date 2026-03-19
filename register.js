// ▼▼▼ ここにGASのURLを貼る ▼▼▼
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbwXt8EVgYPNHid3BV8kMxY439lnbtycM3YbcWV2SkvliOjnbxXBY9bMoeXjnVy8ijqTGQ/exec';
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

  submitBtn.addEventListener('click', async () => {
    console.log('登録ボタン押された');

    // ① 日付チェック
    if (!selectedDate) {
      alert('日付を選んでね');
      return;
    }

    // ② 予定の種類
    let owner = '';

    if (myProfile.userId === 'Uaf91e05353fdded14ddfb91c3032a52c') {
      owner = 'mai';
    } else if (myProfile.userId === 'U4ddaf3a91709ed5a72e6ad2704e2b4cf') {
      owner = 'takuya';
    } else {
      alert('登録者が判別できません');
      return;
    }

    // ③ 時間（selected のものを取得）
    const time = Array.from(
      document.querySelectorAll('.time-group .btn.selected'),
    )
      .map((btn) => btn.textContent)
      .join(',');

    // ④ カテゴリ
    const category =
      document.querySelector('.category-group .btn.selected')?.textContent ||
      '';

    // ⑤ メモ
    const memo = document.querySelector('textarea').value;

    // ⑥ GASに送るデータ
    const payload = {
      date: selectedDate,
      owner: owner,
      time: time,
      category: category,
      memo: memo,
      userId: myProfile.userId, // ←追加(0127)
    };

    console.log('送信データ', payload);

    // ⑦ GASへPOST
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.result === 'ok') {
        alert('登録できたよ 🎉');
        setTimeout(() => {
          liff.closeWindow();
        }, 300);
      } else {
        alert('登録失敗 😢');
        console.error(result);
      }
    } catch (err) {
      alert('通信エラー 😢');
      console.error(err);
    }
  });
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
    dateEl.textContent = day;

    const now = new Date(); // 今の本当の時間を取得
    if (
      day === now.getDate() && 
      month === now.getMonth() && 
      year === now.getFullYear()
    ) {
      dateEl.classList.add('today'); // これでCSSの .today が発動するよ！
    }

    // 2. 土日の判定（これもお忘れなく！）
    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek === 0) dateEl.classList.add('sunday');
    if (dayOfWeek === 6) dateEl.classList.add('saturday');


    dateEl.addEventListener('click', () => {
      // 全員から選択を外す
      document.querySelectorAll('.dates div').forEach(el => el.classList.remove('selected'));

      // クリックしたやつに選択をつける
      dateEl.classList.add('selected');

      selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
