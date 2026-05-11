let projects = JSON.parse(localStorage.getItem('ti-me-data')) || {};
let currentId = null;
let draggedItem = null;
let pendingProjectType = ''; 

const usagi = document.getElementById('usagi');
let isDragging = false;

// 우사기 타이머
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

// ---------------- 웹툰 리스트 자동 생성 ----------------
const webtoonList = [
  "일간알바", "코드네임 아나스타샤", "소꿉친구와 감금당했다", "공과 사는 구분해!", "그 가이드가 집착광공의 품에서 벗어나는 방법", 
  "더 뮤즈", "쉬운 선배", "노 모럴(No Moral)", "러브 오더", "솔트 소사이어티", "녹색전상", "고양이 테라피", "텐(TEN)", 
  "반칙", "죽어 마땅한 것들", "결혼하는 남자", "별주부전", "[능욕BL단편] 그 공작가 노예의 음란한 속사정", "망종(亡種)", 
  "비밀이 많은 XX", "아우토반 로맨스", "아늑한 집착", "모두에게 친절한 너는 왜", "갱생의 여지", "그림자의 영역", 
  "늑대 신랑 [완전판]", "과수원의 사정", "알파 트라우마", "오메가 콤플렉스", "서킷 브레이커", "[색야 단편선] 롤플레잉-경찰❤️파일럿", 
  "[색야단편선] 친구새끼들한테 따먹혔습니다", "[페어리] 실연 중독", "[음란침공 BL 단편선] 성실한 채무자?", "[음란침공 BL 단편선] 형제애", 
  "꽃은 미끼야", "아름다운 초저녁달 2권", "위험한 편의점", "럽미닥터!", "상극", "피자배달부와 골드팰리스", "패션(PASSION)", 
  "실수로 잘못 고백했는데", "더러운 욕망", "[아이돌 단편선] XX하면 알 수 있지 않을까?", "[루비] 테라노 군과 쿠마자키 군", 
  "절대 BL이 되는 세계 VS 절대 BL이 되고 싶지 않은 남자", "[루비] 페이크 팩트 립스", "소꿉친구로는 참을 수 없어", 
  "[라르고] 운명의 짝이 너라니", "[라르고] 오프 스테이지 러브 사이드", "테라피 게임", "[비애] 나츠메 씨는 개발당하고 싶다", 
  "[체험판] [볼레로] 덮쳐달라고, 남편! 1권", "가슴 지명", "[체험판] [체리콕] 위랑 아래, 어느 쪽이 좋아?", "[루비] 드래그리스·섹스", 
  "[크림툰] 반하는 약을 먹은 완벽남이 위험합니다! 2권", "너무 야한 후카미군", "[라르고] 40까지 하고 싶은 10가지 일", 
  "[루비] 힐링 패러독스", "30살까지 동정이면 마법사가 될 수 있대", "[라르고] 독점! 마이 히어로", "개구리 삶기", "시맨틱 에러", 
  "해피투게더", "호식이 이야기", "강아지는 건드리지 마라", "슬립 업(Slip Up)", "가장 깊은 고백", "키스 미 이프 유 캔(Kiss Me If You Can)", 
  "드라이버스 하이 (Driver's high)", "해빙곡선", "장미와 샴페인", "리미티드 런", "FlashLight (플래시라이트)", "외사랑", 
  "이리 사랑스러운 너", "스미르나 앤 카프리", "뱀 굴", "야화첩", "하이스쿨 솔티 하트", "조개소년 : 발화 / 조개소년", "징크스", 
  "향의 경계", "선 넘는 사이", "언슬립", "알페가(Alphega)", "풀북", "멍멍한 관계", "백라이트", "내가 네 운명의 가이드는 아니지만", 
  "녹색전상 : 몽리 / 녹색전상", "유원불변", "해와 달의 공생관계", "너드프로젝트", "시시포스의 개들", "뼈와 꽃잎", "박하사탕", 
  "더블다운", "캐시 오어 크레딧", "남보다 못한 사이", "바라메 강림하여 주소서", "제물 남편", "시거나 떫거나", "은총의 밤", 
  "가장 완벽한 도형", "백련이 피는 온도", "논제로섬", "아이돌 보러 간다며!", "등쳐먹는 연애", "홍실퀘스트", "필 마이 베네핏", 
  "작전명 마레오", "망돌 콤플렉스", "인 마이 배드(In My Bad)", "너는 나의 세상", "하절기", "짝사랑 필승법", "솔직하고 대담하게", 
  "넌 내게 수치심을 줬어❤️", "환장의 가이딩", "신을 품는 방법", "꽃이 지는 연못", "원룸 조교님", "엎질러진 피", "코티지 가든(Cottage garden)", 
  "럭키 다이스", "러브 올 플레이(LOVE ALL PLAY)", "구른 김에 왕까지", "월요일의 구원자", "엑시덴탈 베이비(Accidental baby)", 
  "피앙세는 토마토", "유성이 내리는 우주", "스테이지 비하인드", "방문 판매 왔습니다!", "백야의 꽃길", "당신이 방심한 사이", "미혹의 경계", 
  "아기 삶을 낳아줘, 나 미치는 꼴 보기 싫으면!", "그래서 누가 깔린건데?", "스쿠프", "해 뜨는 집", "물가의 밤", "파도의 해안", 
  "누군가 정해둔 것처럼", "자두를 누르지 마시오", "감금당해 주세요!"
];

document.getElementById('btn-auto-webtoon-tier').addEventListener('click', () => createAutoProject('tier'));
document.getElementById('btn-auto-webtoon-ranking').addEventListener('click', () => createAutoProject('ranking'));

function createAutoProject(type) {
  const id = Date.now().toString();
  projects[id] = { id, title: '웹툰 취향 리스트', type: type, items: [] };
  
  webtoonList.forEach((name, index) => {
    projects[id].items.push({
      itemId: id + '-' + index,
      name: name,
      memo: '',
      img: null,
      zone: 'pool'
    });
  });
  saveData();
  renderHome();
  openProject(id);
}

// ---------------- 기본 기능 ----------------
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

// 아이템 추가 로직
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

// 💡 순위 계산 (끼워넣기 위치 판별)
function getDragAfterElement(container, x, y) {
  const draggableElements = [...container.querySelectorAll('.item:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = container.classList.contains('ranking-list') 
      ? y - box.top - box.height / 2 
      : x - box.left - box.width / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 화면 그리기 및 드래그 이벤트 할당
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
      itemEl.classList.add('dragging');
      isDragging = true;
      usagi.src = 'usagi2.gif';
    });

    itemEl.addEventListener('dragend', function() {
      itemEl.classList.remove('dragging');
      isDragging = false;
      usagi.src = 'usagi1.gif';
      
      // 드래그 끝나면 바뀐 순서대로 데이터 재배열
      const newItems = [];
      document.querySelectorAll('.item').forEach(el => {
        const found = projects[currentId].items.find(i => i.itemId === el.id);
        if (found) {
          found.zone = el.parentElement.getAttribute('data-zone');
          newItems.push(found);
        }
      });
      projects[currentId].items = newItems;
      saveData();
      renderItems(); 
    });

    const dropZone = document.querySelector(`[data-zone="${item.zone}"]`);
    if(dropZone) dropZone.appendChild(itemEl);
  });
  
  updateRanking();
}

// 드롭 영역 이벤트 (끼워넣기 처리)
document.querySelectorAll('.tier-items, .pool, .ranking-list').forEach(zone => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(zone, e.clientX, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (dragging) {
      if (afterElement == null) {
        zone.appendChild(dragging);
      } else {
        zone.insertBefore(dragging, afterElement);
      }
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