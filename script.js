let projects = JSON.parse(localStorage.getItem('ti-me-data')) || {};
let currentId = null;
let draggedItem = null;
let pendingProjectType = ''; // 모달창에서 어떤 버튼을 눌렀는지 기억하는 변수

const usagi = document.getElementById('usagi');
let isDragging = false;

// 우사기 랜덤 타이머 (10초로 변경)
setInterval(() => {
  if (!isDragging) {
    const randomNum = Math.floor(Math.random() * 4) + 1;
    usagi.src = `usagi${randomNum}.gif`;
  }
}, 10000);

function saveData() {
  localStorage.setItem('ti-me-data', JSON.stringify(projects));
}

// ---------------- 모달 창 로직 ----------------
const modal = document.getElementById('custom-modal');
const modalInput = document.getElementById('modal-input');

document.getElementById('btn-new-tier').addEventListener('click', () => openModal('tier'));
document.getElementById('btn-new-ranking').addEventListener('click', () => openModal('ranking'));

function openModal(type) {
  pendingProjectType = type;
  modalInput.value = '';
  modal.style.display = 'flex';
  modalInput.focus();
}

document.getElementById('modal-cancel').addEventListener('click', () => {
  modal.style.display = 'none';
});

document.getElementById('modal-confirm').addEventListener('click', () => {
  const title = modalInput.value.trim();
  if (title) {
    createProject(pendingProjectType, title);
    modal.style.display = 'none';
  }
});
// ----------------------------------------------

function createProject(type, title) {
  const id = Date.now().toString();
  projects[id] = { id, title, type, items: [] };
  saveData();
  renderHome();
  openProject(id);
}

function renderHome() {
  const list = document.getElementById('project-list');
  list.innerHTML = '';
  Object.values(projects).forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div>
        <span style="font-size:12px; color:#888; font-weight:600; margin-bottom:6px; display:block;">
          ${p.type === 'tier' ? '티어 모드' : '랭킹 모드'}
        </span>
        <h3>${p.title}</h3>
      </div>
      <div class="project-actions">
        <button onclick="openProject('${p.id}')">열기</button>
        <button onclick="deleteProject('${p.id}')" class="del-btn">삭제</button>
      </div>
    `;
    list.appendChild(card);
  });
}

window.deleteProject = function(id) {
  if (confirm("정말 삭제하시겠습니까?")) {
    delete projects[id];
    saveData();
    renderHome();
  }
}

window.openProject = function(id) {
  currentId = id;
  const p = projects[id];
  document.getElementById('current-project-title').innerText = p.title;
  
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
    zone: 'pool'
  };

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newItem.img = e.target.result;
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

function renderItems() {
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

    itemEl.addEventListener('dragstart', function(e) {
      draggedItem = item;
      e.dataTransfer.setData('text/plain', item.itemId);
      setTimeout(() => this.style.opacity = '0.5', 0);
      
      isDragging = true;
      usagi.src = 'usagi2.gif';
    });

    itemEl.addEventListener('dragend', function() {
      setTimeout(() => {
        this.style.opacity = '1';
        draggedItem = null;
        updateRanking();
      }, 0);
      
      isDragging = false;
      usagi.src = 'usagi1.gif';
    });

    const dropZone = document.querySelector(`[data-zone="${item.zone}"]`);
    if(dropZone) dropZone.appendChild(itemEl);
  });
  
  updateRanking();
}

document.querySelectorAll('.tier-items, .pool, .ranking-list').forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('dragenter', function(e) {
    e.preventDefault();
    this.style.background = 'rgba(0,0,0,0.02)';
  });
  zone.addEventListener('dragleave', function() {
    this.style.background = '';
  });
  zone.addEventListener('drop', function(e) {
    this.style.background = '';
    if (draggedItem) {
      draggedItem.zone = this.getAttribute('data-zone');
      saveData();
      renderItems();
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
    numSpan.innerText = (index + 1);
  });
}

renderHome();