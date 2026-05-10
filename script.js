// 데이터 불러오기 (새로고침해도 살아있음!)
let projects = JSON.parse(localStorage.getItem('ti-me-data')) || {};
let currentId = null;
let draggedItem = null;

const usagi = document.getElementById('usagi');
let isDragging = false;

// 🐰 우사기 랜덤 타이머 (5초마다 1,2,3,4 중 하나로 변경)
setInterval(() => {
  if (!isDragging) {
    const randomNum = Math.floor(Math.random() * 4) + 1; // 1~4
    usagi.src = `usagi${randomNum}.gif`;
  }
}, 5000);

// 데이터 저장 함수
function saveData() {
  localStorage.setItem('ti-me-data', JSON.stringify(projects));
}

// 홈 화면 렌더링
function renderHome() {
  const list = document.getElementById('project-list');
  list.innerHTML = '';
  Object.values(projects).forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${p.title} (${p.type === 'tier' ? '티어' : '랭킹'})</h3>
      <div class="project-actions">
        <button onclick="openProject('${p.id}')">열기</button>
        <button onclick="deleteProject('${p.id}')" style="background:#ff9999;">삭제</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// 프로젝트 생성 (티어/랭킹)
document.getElementById('btn-new-tier').addEventListener('click', () => createProject('tier'));
document.getElementById('btn-new-ranking').addEventListener('click', () => createProject('ranking'));

function createProject(type) {
  const title = prompt("주제를 입력하세요:");
  if (title) {
    const id = Date.now().toString();
    projects[id] = { id, title, type, items: [] }; // items 배열에 다 저장함
    saveData();
    renderHome();
    openProject(id);
  }
}

window.deleteProject = function(id) {
  if (confirm("삭제하시겠습니까?")) {
    delete projects[id];
    saveData();
    renderHome();
  }
}

// 프로젝트 열기
window.openProject = function(id) {
  currentId = id;
  const p = projects[id];
  document.getElementById('current-project-title').innerText = p.title;
  
  // 모드에 따라 화면 전환
  document.getElementById('tier-mode').style.display = p.type === 'tier' ? 'block' : 'none';
  document.getElementById('ranking-mode').style.display = p.type === 'ranking' ? 'block' : 'none';
  
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('workspace-screen').style.display = 'block';

  renderItems();
}

document.getElementById('back-btn').addEventListener('click', () => {
  document.getElementById('workspace-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'block';
});

// 💡 이미지 파일 -> 문자로 변환 (Base64)해서 영구 저장
document.getElementById('add-item-btn').addEventListener('click', () => {
  const name = document.getElementById('item-name').value;
  const memo = document.getElementById('item-memo').value;
  const fileInput = document.getElementById('item-image');
  
  if (!name) return alert("이름을 입력하세요!");

  const newItem = {
    itemId: Date.now().toString(),
    name: name,
    memo: memo,
    img: null,
    zone: 'pool' // 처음엔 무조건 대기실
  };

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newItem.img = e.target.result; // 이미지를 문자로!
      projects[currentId].items.push(newItem);
      saveData();
      renderItems();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    projects[currentId].items.push(newItem);
    saveData();
    renderItems();
  }

  document.getElementById('item-name').value = '';
  document.getElementById('item-memo').value = '';
  fileInput.value = '';
});

// 아이템 화면에 그리기
function renderItems() {
  // 모든 칸 초기화
  document.querySelectorAll('.tier-items, .pool, .ranking-list').forEach(el => el.innerHTML = '');
  
  projects[currentId].items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'item';
    itemEl.draggable = true;
    itemEl.id = item.itemId;

    let innerHTML = `<div class="name-tag">${item.name}</div>`;
    if (item.memo) innerHTML += `<div class="item-memo-tooltip">${item.memo}</div>`;
    itemEl.innerHTML = innerHTML;

    if (item.img) itemEl.style.backgroundImage = `url(${item.img})`;

    // 드래그 이벤트
    itemEl.addEventListener('dragstart', function(e) {
      draggedItem = item; // 데이터 객체를 기억
      e.dataTransfer.setData('text/plain', item.itemId); // 모바일 호환성
      setTimeout(() => this.style.opacity = '0.5', 0);
      
      // 🐰 드래그할 땐 우사기 2번으로 고정!
      isDragging = true;
      usagi.src = 'usagi2.gif';
    });

    itemEl.addEventListener('dragend', function() {
      setTimeout(() => {
        this.style.opacity = '1';
        draggedItem = null;
        updateRanking();
      }, 0);
      
      // 🐰 드래그 끝나면 다시 기본 우사기로
      isDragging = false;
      usagi.src = 'usagi1.gif';
    });

    // 해당 zone(S, A, pool, ranking)을 찾아서 넣기
    const dropZone = document.querySelector(`[data-zone="${item.zone}"]`);
    if(dropZone) dropZone.appendChild(itemEl);
  });
  
  updateRanking();
}

// 드롭 영역 설정
document.querySelectorAll('.tier-items, .pool, .ranking-list').forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('dragenter', function(e) {
    e.preventDefault();
    this.style.background = 'rgba(0,0,0,0.05)';
  });
  zone.addEventListener('dragleave', function() {
    this.style.background = '';
  });
  zone.addEventListener('drop', function(e) {
    this.style.background = '';
    if (draggedItem) {
      // 데이터 업데이트
      draggedItem.zone = this.getAttribute('data-zone');
      saveData();
      renderItems(); // 화면 다시 그리기
    }
  });
});

function updateRanking() {
  const rankingList = document.getElementById('ranking-list');
  const items = rankingList.querySelectorAll('.item');
  items.forEach((item, index) => {
    let numSpan = item.querySelector('.ranking-number');
    if (!numSpan) {
      numSpan = document.createElement('div');
      numSpan.className = 'ranking-number';
      item.prepend(numSpan);
    }
    numSpan.innerText = (index + 1) + '위';
  });
}

// 시작
renderHome();