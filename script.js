// --- 화면 전환 로직 ---
const homeScreen = document.getElementById('home-screen');
const tierScreen = document.getElementById('tier-screen');

document.getElementById('create-new-btn').addEventListener('click', () => {
  const title = prompt("새 티어 주제를 입력하세요:");
  if (title) {
    document.getElementById('current-title').innerText = title;
    homeScreen.style.display = 'none';
    tierScreen.style.display = 'block';
  }
});

document.getElementById('back-btn').addEventListener('click', () => {
  tierScreen.style.display = 'none';
  homeScreen.style.display = 'block';
});

// --- 드래그 앤 드롭 로직 ---
let draggedItem = null;

// 아이템 추가 기능 (텍스트만 예시, 이미지는 File Reader 필요)
document.getElementById('add-item-btn').addEventListener('click', () => {
  const text = document.getElementById('item-text').value;
  if (!text) return;

  const newItem = document.createElement('div');
  newItem.classList.add('item');
  newItem.draggable = true;
  newItem.innerText = text;

  // 드래그 이벤트 연결
  newItem.addEventListener('dragstart', function() {
    draggedItem = this;
    setTimeout(() => this.style.display = 'none', 0);
  });

  newItem.addEventListener('dragend', function() {
    setTimeout(() => {
      this.style.display = 'block';
      draggedItem = null;
    }, 0);
  });

  document.getElementById('item-pool').appendChild(newItem);
  document.getElementById('item-text').value = '';
});

// 드롭 영역 설정 (각 티어 칸과 미분류 풀)
const dropZones = document.querySelectorAll('.tier-items, .item-pool');

dropZones.forEach(zone => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault(); // 드롭을 허용하려면 필수
  });

  zone.addEventListener('dragenter', function(e) {
    e.preventDefault();
    this.style.backgroundColor = 'rgba(0,0,0,0.1)';
  });

  zone.addEventListener('dragleave', function() {
    this.style.backgroundColor = 'transparent';
  });

  zone.addEventListener('drop', function() {
    this.style.backgroundColor = 'transparent';
    if (draggedItem) {
      this.appendChild(draggedItem);
    }
  });
});