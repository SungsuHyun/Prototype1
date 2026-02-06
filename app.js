const searchInput = document.getElementById("searchInput");
const clearBtn = document.querySelector(".menu-btn");
const aiContent = document.getElementById("aiContent");
const appContent = document.getElementById("appContent");
const aiStatus = document.getElementById("aiStatus");
const appCount = document.getElementById("appCount");
const appGrid = document.getElementById("appGrid");
const searchResults = document.getElementById("searchResults");
const genUiPanel = document.querySelector(".left-panel"); // The bottom panel

let uiTimeout = null;

const placeholderState = {
  ai: `
    <div class="card" style="align-items: center; justify-content: center; height: 100%; text-align: center; background: transparent; backdrop-filter: none; box-shadow: none;">
      <div style="font-size: 24px; margin-bottom: 10px;">✨</div>
      <div class="card-desc">검색어를 입력하면 AI가 요약해줍니다.</div>
    </div>
  `,
  apps: ``,
  status: "대기",
  statusClass: "ai-ready",
  count: 0,
};

const activeState = {
  ai: `
    <div class="card">
        <div class="card-title" style="margin-bottom: 4px;">저녁 요약</div>
        <div class="list-item" style="background: rgba(255,255,255,0.1);">
            <div style="display: flex; gap: 8px; align-items: center;">
                <i class="fas fa-check-circle" style="color: #47cba8;"></i>
                <span>식당 예약</span>
            </div>
            <span style="color: #ccc; font-size: 11px;">완료</span>
        </div>
        <div class="list-item" style="background: rgba(255,255,255,0.1);">
             <div style="display: flex; gap: 8px; align-items: center;">
                <i class="far fa-circle" style="color: #aaa;"></i>
                <span>택시 호출</span>
            </div>
            <span style="color: #ccc; font-size: 11px;">18:30</span>
        </div>
        <div style="margin-top: 8px; font-size: 12px; color: #ddd; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px;">
            <i class="fas fa-map-marker-alt" style="color: #e84f5a; margin-right: 4px;"></i>
            강남역 3번 출구, 19:00
        </div>
    </div>
  `,
  apps: `
    <div class="app-row-icon-only">
        <div class="icon-container icon-samsung-msg">
            <i class="fas fa-comment-dots" style="color:white; font-size: 26px;"></i>
        </div>
    </div>
    <div class="app-row-icon-only">
        <div class="icon-container icon-kakao">
            <i class="fas fa-comment" style="color:#3C1E1E; font-size: 24px;"></i>
        </div>
    </div>
    <div class="app-row-icon-only">
        <div class="icon-container icon-calendar">
        </div>
    </div>
  `,
  status: "완료",
  statusClass: "ai-active",
  count: 3,
};

const loadingState = {
    ai: `
        <div class="card">
            <div class="card-title" style="margin-bottom: 10px;">생성 중...</div>
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-80"></div>
        </div>
    `,
    status: "분석 중",
    statusClass: "ai-warn"
};

function updateUI(value) {
  const trimmed = value.trim();
  clearTimeout(uiTimeout);

  if (!trimmed) {
    appGrid.classList.remove("hidden");
    searchResults.classList.remove("active");
    genUiPanel.classList.remove("gen-ui-active");
    setTimeout(() => {
        if(!trimmed) searchResults.classList.add("hidden");
    }, 100); 
    
    // Reset contents
    aiContent.innerHTML = placeholderState.ai;
    appContent.innerHTML = "";
    appCount.textContent = "0";
    aiStatus.textContent = "대기";
    aiStatus.className = "badge ai-ready";
    return;
  }

  // 1. Show Panel Container & Apps Immediately
  appGrid.classList.add("hidden");
  searchResults.classList.remove("hidden");
  requestAnimationFrame(() => {
      searchResults.classList.add("active");
  });

  // Render Apps
  appContent.innerHTML = activeState.apps;
  appCount.textContent = "3";

  // 2. Show Loading State for Gen UI
  aiContent.innerHTML = loadingState.ai;
  aiStatus.textContent = loadingState.status;
  aiStatus.className = `badge ${loadingState.statusClass}`;
  genUiPanel.classList.remove("gen-ui-active");

  // 3. Delay then Show Gen UI Result with Effect
  uiTimeout = setTimeout(() => {
    aiContent.innerHTML = activeState.ai;
    aiStatus.textContent = activeState.status;
    aiStatus.className = `badge ${activeState.statusClass}`;
    
    // Add the thin border effect
    genUiPanel.classList.add("gen-ui-active");
  }, 1200); // 1.2s delay
}

searchInput.addEventListener("input", (event) => {
  updateUI(event.target.value);
});

// Initial Init
aiContent.innerHTML = placeholderState.ai;
