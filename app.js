const device = document.getElementById("device");
const drawer = document.getElementById("drawer");
const searchInput = document.getElementById("searchInput");
const touchArea = document.getElementById("touchArea"); // Full screen touch area for home

// Views inside Drawer
const appGrid = document.getElementById("appGrid");
const searchResults = document.getElementById("searchResults");
const searchOnlyContent = document.getElementById("searchOnlyContent"); // Wrapper for Hint + AI

// Gen UI Elements
const aiContent = document.getElementById("aiContent");
const appContent = document.getElementById("appContent");
const aiStatus = document.getElementById("aiStatus");
const appCount = document.getElementById("appCount");
const genUiPanel = document.querySelector(".left-panel");

let uiTimeout = null;

// State Management
// 0: Home (Hidden Drawer)
// 1: Search Only (Drawer at 25%)
// 2: Apps (Drawer at Full)
// 3: Results (Drawer at Full + Results View)
let currentState = 0;

// Swipe Logic Variables
let startY = 0;
let currentY = 0;
let isDragging = false;
let didSwipe = false; // Flag to prevent click event after swipe
const SWIPE_THRESHOLD = 50;

function switchState(newState) {
    currentState = newState;
    
    // Reset Classes
    device.classList.remove("state-home", "state-portal", "state-apps", "state-results");
    appGrid.classList.add("hidden");
    searchResults.classList.add("hidden");
    searchOnlyContent.classList.add("hidden"); // Hide Search Only Content

    if (newState === 0) {
        // Home
        device.classList.add("state-home");
        searchInput.blur();
    } else if (newState === 1) {
        // Search Only (Drawer 25%)
        device.classList.add("state-portal");
        searchOnlyContent.classList.remove("hidden"); // Show Hint + AI
        // Focus search input slightly delayed to allow animation
        setTimeout(() => searchInput.focus(), 300);
    } else if (newState === 2) {
        // Apps (Drawer Full)
        device.classList.add("state-apps");
        appGrid.classList.remove("hidden");
        searchInput.blur();
    } else if (newState === 3) {
        // Results
        device.classList.add("state-results");
        searchResults.classList.remove("hidden");
        // Ensure drawer is full height
    }
}

// Close drawer when clicking outside (on the touch area)
touchArea.addEventListener("click", () => {
    // Only close if we didn't just swipe
    if (!didSwipe && currentState !== 0) {
        switchState(0);
    }
});

// Touch Event Handlers for Swipe
function handleTouchStart(e) {
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    currentY = startY; 
    isDragging = true;
    didSwipe = false; 
}

function handleTouchMove(e) {
    if (!isDragging) return;
    currentY = e.touches ? e.touches[0].clientY : e.clientY;
}

function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    const diff = startY - currentY; // Positive = Swipe Up, Negative = Swipe Down

    if (Math.abs(diff) < SWIPE_THRESHOLD) {
        return; 
    }

    didSwipe = true; 

    if (diff > 0) {
        // Swipe Up
        if (currentState === 0) {
            switchState(1);
        } else if (currentState === 1) {
            switchState(2);
        }
    } else {
        // Swipe Down
        if (currentState === 2) {
            switchState(1);
        } else if (currentState === 1) {
            switchState(0);
        } else if (currentState === 3) {
            switchState(1);
        }
    }
    
    // Reset values
    startY = 0;
    currentY = 0;
}

// Attach listeners to the whole device screen (for Home) and Drawer (for dragging drawer)
device.addEventListener("mousedown", handleTouchStart);
device.addEventListener("mousemove", handleTouchMove);
device.addEventListener("mouseup", handleTouchEnd);
device.addEventListener("touchstart", handleTouchStart);
device.addEventListener("touchmove", handleTouchMove);
device.addEventListener("touchend", handleTouchEnd);


// Gen UI Logic (Same as before)
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

searchInput.addEventListener("input", (event) => {
    const val = event.target.value.trim();
    
    if (!val) {
        if (currentState === 3) {
             switchState(1);
        }
        return;
    }

    if (currentState !== 3) {
        switchState(3);
    }

    clearTimeout(uiTimeout);
    
    appContent.innerHTML = activeState.apps;
    appCount.textContent = "3";

    aiContent.innerHTML = loadingState.ai;
    aiStatus.textContent = loadingState.status;
    aiStatus.className = `badge ${loadingState.statusClass}`;
    genUiPanel.classList.remove("gen-ui-active");

    uiTimeout = setTimeout(() => {
        aiContent.innerHTML = activeState.ai;
        aiStatus.textContent = activeState.status;
        aiStatus.className = `badge ${activeState.statusClass}`;
        genUiPanel.classList.add("gen-ui-active");
    }, 1200);
});

// Init
switchState(0);
