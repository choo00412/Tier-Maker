// 앱 데이터 (새로고침해도 날아가지 않게 임시 배열)
let projects = [];
let currentProjectId = null;
let draggedItem = null;

const homeScreen = document.getElementById('home-screen');
const workspaceScreen = document.getElementById('workspace-screen');
const projectList = document.getElementById('project-list');
const currentProjectTitle = document.getElementById('current-project-title');

// 1. 홈 화면: 프로젝트 리스트 그리기
function renderProjects() {
  projectList.innerHTML = '';
  if(projects.length === 0) {
    projectList.innerHTML = '<p style="color:#888; padding:20px;">+ 버튼을 눌러 새 리스트를 만들어보세요!</p>';
  }
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${p.title}</h3>
      <div class="project-actions">
        <button onclick="openProject('${p.id}')">작업하기</button>
        <button onclick="deleteProject('${p.id}')" style="background: #ffb3b3;">삭제</button>
      </div>
    `;
    projectList.appendChild(card);
  });
}

// 새 프로젝트 추가
document.getElementById('new-project-btn').addEventListener('click', () => {
  const title = prompt("새 주제(이름)를 입력하세요:");
  if (title) {
    const newProject = { id: Date.now().toString(), title: title };
    projects.push(newProject);
    renderProjects();
    openProject(newProject.id);
  }
});

// 프로젝트 삭제
window.deleteProject = function(id) {
  if (confirm("정말 삭제하시겠습니까?")) {
    projects = projects.filter(p => p.id !== id);
    renderProjects();
  }
}

// 프로젝트 열기 (작업 화면으로 전환)
window.openProject = function(id) {
  currentProjectId = id;
  const project = projects.find(p => p.id === id);
  currentProjectTitle.innerText = project.title;
  
  homeScreen.style.display = 'none';
  workspaceScreen.style.display = 'block';
}

// 뒤로가기
document.getElementById('back-btn').addEventListener('click', () => {
  workspaceScreen.style.display = 'none';
  homeScreen.style.display = 'block';
});


// 2. 아이템 추가 및 드래그 앤 드롭 로직
document.getElementById('add-item-btn').addEventListener('click', () => {
  const name = document.getElementById('item-name').value;
  const memo = document.getElementById('item-memo').value;
  const fileInput = document.getElementById('item-image');
  
  if (!name) return alert("이름을 입력하세요!");

  const itemEl = document.createElement('div');
  itemEl.className = 'item';
  itemEl.draggable = true;
  
  // 이름과 메모 넣기
  let innerHTML = `<div class="name-tag">${name}</div>`;
  if (memo) {
    // 티어 모드에선 툴팁으로, 랭킹 모드에선 우측에 표시됨 (CSS 마법)
    innerHTML += `<div class="item-memo-tooltip">${memo}</div>`;
  }
  itemEl.innerHTML = innerHTML;

  // 💡 핵심: 이미지 파일 업로드 시 브라우저 내부 임시 URL 사용 (깨짐 방지)
  if (fileInput.files && fileInput.files[0]) {
    const imageUrl = URL.createObjectURL(fileInput.files[0]);
    itemEl.style.backgroundImage = `url(${imageUrl})`;
  }

  // 드래그 시작
  itemEl.addEventListener('dragstart', function(e) {
    draggedItem = this;
    setTimeout(() => this.style.opacity = '0.5', 0);
  });

  // 드래그 끝
  itemEl.addEventListener('dragend', function() {
    setTimeout(() => {
      this.style.opacity = '1';
      draggedItem = null;
      updateRankingNumbers(); // 랭킹 번호 새로고침
    }, 0);
  });

  // 대기실에 쏙!
  document.getElementById('item-pool').appendChild(itemEl);
  
  // 입력창 초기화
  document.getElementById('item-name').value = '';
  document.getElementById('item-memo').value = '';
  fileInput.value = '';
});

// 드롭 영역 설정 (대기실, 티어 칸, 랭킹 칸 전체)
const dropZones = document.querySelectorAll('.tier-items, .pool, .ranking-list');
dropZones.forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('dragenter', function(e) {
    e.preventDefault();
    this.style.background = 'rgba(0,0,0,0.05)';
  });
  zone.addEventListener('dragleave', function() {
    this.style.background = '';
  });
  zone.addEventListener('drop', function() {
    this.style.background = '';
    if (draggedItem) {
      this.appendChild(draggedItem);
      updateRankingNumbers(); // 랭킹으로 넘어왔을 때 숫자 매기기
    }
  });
});

// 3. 랭킹 모드일 때 1위, 2위 숫자 매겨주는 함수
function updateRankingNumbers() {
  const rankingList = document.getElementById('ranking-list');
  const items = rankingList.querySelectorAll('.item');
  
  items.forEach((item, index) => {
    let numSpan = item.querySelector('.ranking-number');
    if (!numSpan) {
      numSpan = document.createElement('div');
      numSpan.className = 'ranking-number';
      item.prepend(numSpan); // 맨 앞에 숫자 붙이기
    }
    numSpan.innerText = (index + 1) + '위';
  });
  
  // 만약 랭킹에 있다가 다시 티어 보드나 대기실로 돌아가면 숫자 지우기
  document.querySelectorAll('.tier-items .item .ranking-number, .pool .item .ranking-number').forEach(el => el.remove());
}

// 4. 하단 네비게이션 탭 전환 (티어 <-> 랭킹)
const navTier = document.getElementById('nav-tier');
const navRanking = document.getElementById('nav-ranking');
const tierMode = document.getElementById('tier-mode');
const rankingMode = document.getElementById('ranking-mode');

navTier.addEventListener('click', () => {
  navTier.classList.add('active');
  navRanking.classList.remove('active');
  tierMode.style.display = 'block';
  rankingMode.style.display = 'none';
});

navRanking.addEventListener('click', () => {
  navRanking.classList.add('active');
  navTier.classList.remove('active');
  tierMode.style.display = 'none';
  rankingMode.style.display = 'block';
});

// 처음 시작할 때 렌더링
renderProjects();