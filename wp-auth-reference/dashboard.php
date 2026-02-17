<?php

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

if (!isset($_GET['cb'])) {
    $qs = $_GET;
    $qs['cb'] = time();
    $url = strtok($_SERVER["REQUEST_URI"], '?') . '?' . http_build_query($qs);
    header("Location: " . $url, true, 302);
    exit;
  }
  

// Robustly locate wp-load.php no matter where WP is installed
$dir = __DIR__;
$wpLoad = null;

while ($dir !== '/' && $dir !== '.' && $dir !== '') {
  if (file_exists($dir . '/wp-load.php')) {
    $wpLoad = $dir . '/wp-load.php';
    break;
  }
  $parent = dirname($dir);
  if ($parent === $dir) break;
  $dir = $parent;
}

if (!$wpLoad) {
  http_response_code(500);
  echo "ERROR: wp-load.php not found.";
  exit;
}

require_once($wpLoad);

  $isEmbed = isset($_GET['embed']) && $_GET['embed'] === '1';

  // If not logged in, redirect to custom login
  if (!is_user_logged_in()) {
    $redirect = urlencode((is_ssl() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    wp_safe_redirect('/leader/tracker/login.php?cb=' . time() . '&redirect=' . $redirect);

    exit;
  }

  // --- Approval gate ---
$user_id = get_current_user_id();
if ($user_id) {
  $pending = get_user_meta($user_id, 'tracker_pending', true);
  if ($pending) {
    wp_logout();
    wp_safe_redirect('/leader/tracker/login.php?cb=' . time() . '&pending=1');
    exit;
  }
}
  
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Cache-buster -->
  <script>
    (function () {
      const url = new URL(location.href);

      // If we *haven't* already added a bust param…
      if (!url.searchParams.has('vb')) {
        // Add a version param based on timestamp
        url.searchParams.set('v', Date.now().toString());
        // Internal flag so we don't loop forever
        url.searchParams.set('vb', '1');

        // Reload once with the new query string
        location.replace(url.pathname + url.search + url.hash);
      } else {
        // We're on the "busted" URL – clean up the vb flag
        requestAnimationFrame(function () {
          const u = new URL(location.href);
          u.searchParams.delete('vb');
          history.replaceState(null, '', u.pathname + u.search + u.hash);
        });
      }
    })();
  </script>

  <meta charset="utf-8" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <title>Engagement Tracker</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
  <style>
body {
  background-color: <?php echo $isEmbed ? '#0E66B4' : '#1e1e1e'; ?>;
  font-family: Arial, sans-serif;
  padding: <?php echo $isEmbed ? '0' : '20px'; ?>;
}

    table {
      border-collapse: collapse;
      margin-bottom: 40px;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      min-width: 600px;
      background-color: white;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 6px;
      text-align: center;
    }

    th {
      background-color: #f4f4f4;
    }

    tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    h2 {
      margin-top: 40px;
    }

    .section-header {
      background-color: #1e1e1e;
      color: white;
      font-weight: bold;
      text-align: left;
      padding: 6px;
      margin-top: 40px;
      width: 100%;
      box-sizing: border-box;
    }

    table td:first-child,
    table th:first-child {
      position: sticky;
      left: 0;
      background-color: white;
      z-index: 1;
    }

    table th:first-child {
      z-index: 2;
    }

    .section-filter {
      justify-content: center;
      background-color: #1e1e1e;
      padding: 10px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .section-filter button {
      background-color: #1e1e1e;
      color: white;
      border: 1px solid white;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s, color 0.3s;
    }

    .section-filter button:hover {
      background-color: white;
      color: #1e1e1e;
    }

    #searchInput {
      padding: 6px 12px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 20px;
      border: 2px solid #ccc;
      background-color: #1e1e1e;
      color: white;
      display: block;
      margin: 0 auto 10px auto;
      width: 360px;
      text-align: center;
    }

    button:hover {
      font-weight: bold;
      cursor: pointer;
    }

    .toggle-buttons button {
      margin: 5px;
      padding: 8px 16px;
      font-weight: bold;
      border: 1px solid white;
      border-radius: 20px;
      background-color: #1e1e1e;
      color: white;
      transition: background-color 0.3s, color 0.3s;
    }

    .toggle-buttons .active-button {
      background-color: white;
      color: black;
    }
    
    /* Modal styles */
.modal {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(30, 30, 30, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 20px 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-sizing: border-box;
  color: black;
}

.modal-content h2 {
  margin-top: 0;
}

.modal-content label {
  display: block;
  margin-top: 12px;
  font-weight: bold;
}

.modal-content input[type="text"],
.modal-content textarea {
  width: 100%;
  padding: 6px 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-content button {
  margin-top: 16px;
  padding: 10px 16px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.modal-content button[type="submit"] {
  background-color: #1e1e1e;
  color: white;
  margin-right: 10px;
}

.modal-content button[type="button"] {
  background-color: #ccc;
  color: black;
}

/* Hide/show based on screen width */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
}
@media (min-width: 769px) {
  .desktop-only { display: table !important; }
  .mobile-only { display: none !important; }
}

/* Mobile collapsible styles */
.attendance-list-mobile {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}
.student-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
.student-toggle {
  width: 100%;
  text-align: left;
  padding: 10px;
  font-size: 16px;
  background: #f9f9f9;
  border: none;
  cursor: pointer;
}
.student-details {
  padding: 10px;
  background: #fff;
  border-top: 1px solid #ddd;
}


    
  
    @media (max-width: 768px) {
      table {
        display: none;
      }
      .student-list {
        display: block;
      }
    }

    @media (min-width: 769px) {
      .student-list {
        display: none;
      }
    }

    .student-card {
      background: white;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .student-name {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 6px;
    }

    .attendance-summary {
      font-size: 16px;
      margin-bottom: 6px;
    }

    .expand-toggle {
      cursor: pointer;
      color: #007BFF;
      text-decoration: underline;
      font-size: 14px;
    }

    .attendance-history {
      margin-top: 6px;
      display: none;
      font-size: 14px;
    }

  </style>
  
  <style>
  .clickable-name {
    color: #f06292;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
  }

  .clickable-name:hover {
    color: #ce93d8;
  }

    @media (max-width: 768px) {
      table {
        display: none;
      }
      .student-list {
        display: block;
      }
    }

    @media (min-width: 769px) {
      .student-list {
        display: none;
      }
    }

    .student-card {
      background: white;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .student-name {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 6px;
    }

    .attendance-summary {
      font-size: 16px;
      margin-bottom: 6px;
    }

    .expand-toggle {
      cursor: pointer;
      color: #007BFF;
      text-decoration: underline;
      font-size: 14px;
    }

    .attendance-history {
      margin-top: 6px;
      display: none;
      font-size: 14px;
    }

  </style>

<style>
/* Desktop-only sticky date header for the tracker table */
@media (min-width: 1025px) {
  /* allow sticky children to work */
  body.mode-tracker table.desktop-only {
    overflow: initial; /* overrides the table's overflow:hidden */
  }

  /* make the header row stick to the top */
  body.mode-tracker table.desktop-only thead th {
    position: sticky;
    top: 0;
    z-index: 4;
    background: #f4f4f4; /* same as your header bg */
    box-shadow: 0 1px 0 rgba(0,0,0,0.06);
  }

  /* keep the first column sticky on the left (header + cells) and layer properly */
  body.mode-tracker table.desktop-only td:first-child,
  body.mode-tracker table.desktop-only th:first-child {
    position: sticky;
    left: 0;
    background: #fff;
    z-index: 5;
  }

  /* top-left corner cell (Name header) needs to sit above both sticky axes */
  body.mode-tracker table.desktop-only thead th:first-child {
    background: #f4f4f4;
    z-index: 6;
  }
}
</style>

<style>
/* Offset sticky table header below the WP admin bar when logged in */
@media (min-width: 1025px) {
  body.admin-bar.mode-tracker table.desktop-only thead th {
    top: 32px; /* desktop admin bar height */
  }
  /* keep the top-left corner cell in sync */
  body.admin-bar.mode-tracker table.desktop-only thead th:first-child {
    top: 32px;
  }
}

/* If you ever view the tracker on narrower screens while logged in,
   WP's admin bar grows to ~46px. Included for completeness. */
@media (max-width: 1024px) {
  body.admin-bar.mode-tracker table.desktop-only thead th,
  body.admin-bar.mode-tracker table.desktop-only thead th:first-child {
    top: 46px;
  }
}
</style>

<style>
  /* Make the tracker look "embedded" when ?embed=1 is used */
  body.embed-mode {
    background-color: #1e1e1e; /* app blue */
  }

  body.embed-mode .toggle-buttons,
  body.embed-mode #printBtn,
  body.embed-mode #mainTitle {
    display: none !important;
  }

  /* Tighten up spacing a bit for embed mode */
  body.embed-mode #tables {
    margin-top: 0;
  }

  /* Optional: center the content a bit nicer in mobile app */
  body.embed-mode #tables,
  body.embed-mode #attendance-summary {
    padding: 8px 12px;
    box-sizing: border-box;
  }
</style>

  
</head>

<body<?php if ($isEmbed) echo ' class="embed-mode"'; ?>>
<div class="toggle-buttons" style="text-align: center; margin-bottom: 20px;">
  <button id="attendanceBtn" onclick="loadSheet('Output')">Attendance</button>
  <button id="contactBtn" onclick="loadSheet('ContactInfo')">Contact Info</button>
  <button id="dashboardBtn" onclick="loadSheet('Dashboard')">Dashboard</button>
  <button onclick="window.location.href='/leader/tracker/logout.php'">Logout</button>

</div>


  <div style="text-align: center; margin-bottom: 60px;">
  <img alt="Logo" src="https://pursuegen.com/logo/logo.png" style="max-width: 300px; height: auto;" />
  </div>

<div id="mainTitle" style="font-family: 'Bebas Neue', sans-serif; font-size: 40px; font-weight: normal; color: #ccc; text-align: center; margin-top: -100px; margin-bottom: 100px;">
  Engagement Tracker
</div>


  <div style="margin-bottom: 20px;">
    <input id="searchInput" placeholder="Type a name or select a grade group below" type="text" autocomplete="off" style="display:none;" />
    <div class="section-filter" id="sectionButtons" style="display:none;"></div>
    <div style="text-align: center; margin-bottom: 20px;">
      <button id="printBtn" onclick="window.print()" style="margin-top: 10px; padding: 10px 20px; background-color: #1e1e1e; color: white; font-size: 16px; border: none; border-radius: 5px; display: inline-flex; align-items: center; gap: 8px;">
        <svg fill="white" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0h24v24H0z" fill="none"></path>
          <path d="M19 8H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zm-3 10H8v-4h8v4zm3-6H5v-2h14v2zM17 4H7v4h10V4z"></path>
        </svg>
        Print
      </button>
    </div>
  </div>

  <div id="attendance-summary" class="summary-line" style="
  font-weight: bold;
  margin: 20px auto;
  display: none;
  color: white;
  text-align: center;
  max-width: 100%;
  line-height: 1.6em;
">
  <div style="margin-bottom: 4px;">
    Overall Attendance For 
    <select id="weekSelector" style="margin-left: 8px; font-weight: bold; font-size: 1em;"></select>
  </div>
  <div>
    <span id="trueCount">🟢 0</span>, 
    <span id="ftgCount">🔵 0</span>, 
    <span id="totalCount">Total: 0</span>
  </div>
</div>
  

<div id="tables"></div>
  
  <div id="dashboardContainer" style="display:none; width: 100%; height: 90vh; margin-top: 20px;">
  <iframe src="" id="dashboardIframe" style="width: 100%; height: 100%; border: none;"></iframe>
</div>


  <script>
  
  
  const desiredOrder = ['6 Girls', '6 Boys', '7 Girls', '7 Boys', '8 Girls', '8 Boys', '9 Girls', '9 Boys', '10 Girls', '10 Boys', '11 Girls', '11 Boys', '12 Girls', '12 Boys', 'Other'];

  async function fetchJSON(sheetName = 'Output') {
  const cb = Date.now(); // cache buster
  let url;

  if (sheetName === 'Output') {
  // Attendance data (secure + role-filtered)
  url = `https://pursuegen.com/leader/tracker/secure_proxy.php?_cb=${cb}`;
} else {
  // ContactInfo/Dashboard/etc (secure + role-filtered)
  url = `https://pursuegen.com/leader/tracker/secure_proxy.php?sheet=${encodeURIComponent(sheetName)}&_cb=${cb}`;
}

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 401) {
  // Not logged in → send to custom login and return to this page
  const returnTo = encodeURIComponent(window.location.href);
  window.location.href = `/leader/tracker/login.php?redirect=${returnTo}`;
  throw new Error('Not logged in');
}

  if (response.status === 403) {
    const msg = await response.text();
    console.error('Forbidden:', msg);
    throw new Error(`Access denied (403). Ask an admin to assign your role.`);
  }

  throw new Error(`Failed to load JSON data (${response.status})`);
}

  const json = await response.json();
  console.log('Fetched sheet', sheetName, 'first row:', json[0]);

  return json;
}

    function formatIfDate(str) {
      const parsedDate = Date.parse(str);
      if (!isNaN(parsedDate)) {
        return new Date(parsedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return str;
    }

    function parseJSON(data, sheetName = 'Output') {
  // --- CONTACT INFO SHEET (unchanged behavior) ---
  if (sheetName === 'ContactInfo') {
    // Some backends will return { data: [...] } instead of just [...]
    const rows = Array.isArray(data) && Array.isArray(data[0])
      ? data
      : (Array.isArray(data?.data) ? data.data : []);

    if (!rows || rows.length === 0) {
      return { ContactInfo: { headers: [], rows: [] } };
    }

    const headers = rows[0];
    const bodyRows = rows.slice(1);
    return { ContactInfo: { headers, rows: bodyRows } };
  }

  // --- ATTENDANCE / OUTPUT SHEET ---
  // Defensive: support both plain arrays and { data: [...] }
  const rows = Array.isArray(data) && Array.isArray(data[0])
    ? data
    : (Array.isArray(data?.data) ? data.data : []);

  const parsedData = {};
  let currentSection = null;

  // Normalize labels like "6 Girls", "6th Girls", "6 grade girls", "Other students"
  function normalizeSectionName(raw) {
    if (!raw) return null;
    const lower = String(raw).toLowerCase().trim();

    if (lower.includes('other')) return 'Other';

    // capture "6 Girls", "6th girls", "6 grade boys", etc.
    const match = lower.match(/(\d{1,2})\s*(?:th|st|nd|rd)?\s*(girls?|boys?)/);
    if (!match) return null;

    const grade = match[1];
    const genderRaw = match[2];
    const gender = genderRaw.startsWith('girl') ? 'Girls' : 'Boys';

    return `${grade} ${gender}`; // matches your desiredOrder keys
  }

  for (let row of rows) {
    if (!row || row.length === 0) continue;

    const firstCellRaw = row[0];
    const firstCell = firstCellRaw != null ? String(firstCellRaw).trim() : '';

    // 1) SECTION HEADER ROW?  (e.g. "6 Girls", "7 Boys", "Other")
    const normalized = normalizeSectionName(firstCell);
    if (normalized) {
      currentSection = normalized;

      if (!parsedData[currentSection]) {
        parsedData[currentSection] = { headers: [], rows: [] };
      } else {
        // Reset headers so the next non-empty row becomes header row
        parsedData[currentSection].headers = [];
      }

      continue;
    }

    // If we haven't hit a section yet, ignore this row
    if (!currentSection) continue;

    // Ensure section object exists
    if (!parsedData[currentSection]) {
      parsedData[currentSection] = { headers: [], rows: [] };
    }

    const sectionObj = parsedData[currentSection];

    // 2) FIRST NON-EMPTY ROW AFTER SECTION = HEADERS
    if (sectionObj.headers.length === 0) {
      const headers = row.map((cell, i) =>
        i === 0 ? (cell || '') : formatIfDate(cell || '')
      );
      sectionObj.headers = headers;
      continue;
    }

    // 3) SUBSEQUENT ROWS = DATA
    sectionObj.rows.push(row);
  }

  console.log('Parsed sections:', Object.keys(parsedData));
  return parsedData;
}


function applySearch() {
  const search = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
  console.log('applySearch triggered with:', search);

  const groupSections = document.querySelectorAll('.group-section');

  groupSections.forEach(group => {
    const header = group.querySelector('.section-header');
    const table = group.querySelector('table');
    const cards = group.querySelectorAll('.mobile-card');
    const rows = table?.querySelectorAll('tbody tr') || [];

    const sectionName = header?.textContent.toLowerCase() || '';
    let hasMatch = false;

    // desktop filtering...
    if (sectionName.includes(search) && search !== '') {
      rows.forEach(row => row.style.display = '');
      hasMatch = true;
    } else {
      rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        const match = rowText.includes(search);
        row.style.display = match ? '' : 'none';
        if (match) hasMatch = true;
      });
    }

    // mobile card filtering...
    if (search === '') {
      cards.forEach(card => card.style.display = 'block');
      hasMatch = true;
    } else if (sectionName.includes(search)) {
      cards.forEach(card => card.style.display = 'block');
      hasMatch = true;
    } else {
      cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const match = cardText.includes(search);
        card.style.display = match ? 'block' : 'none';
        if (match) hasMatch = true;
      });
    }

    // section toggle
    group.style.display = hasMatch ? '' : 'none';
  });

  // ✅ recompute totals after filtering
  if (typeof window.updateSummary === 'function') {
    window.updateSummary();
  }
}

    

function setupFilters(availableSections = []) {
  const sectionFilter = document.getElementById('sectionButtons');
  sectionFilter.innerHTML = '';

  const searchInput = document.getElementById('searchInput');

  // If nothing passed, fall back to whatever sections are currently rendered
  if (!Array.isArray(availableSections) || availableSections.length === 0) {
    availableSections = [...document.querySelectorAll('.group-section')]
      .map(el => el.getAttribute('data-group'))
      .filter(Boolean);
  }

  // Build buttons only for sections the user can actually see
  availableSections.forEach(group => {
    const btn = document.createElement('button');
    btn.textContent = group;
    btn.setAttribute('data-section', group);
    btn.type = 'button';

    btn.addEventListener('click', () => {
      // Hard reset then apply section filter
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      searchInput.value = group;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      applySearch();
      if (typeof window.updateSummary === 'function') window.updateSummary(); // ✅ keep summary in sync
    });

    sectionFilter.appendChild(btn);
  });

  // Reset button (still useful even if only one section, because search box can be used)
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.id = 'resetFilter';
  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    applySearch();
    if (typeof window.updateSummary === 'function') window.updateSummary(); // ✅ keep summary in sync
  });

  sectionFilter.appendChild(resetBtn);

  // Rebind search input
  searchInput.removeEventListener('input', applySearch);
  searchInput.addEventListener('input', () => {
    applySearch();
    if (typeof window.updateSummary === 'function') window.updateSummary(); // ✅ keep summary in sync when typing
  });
}

async function loadSheet(sheetName = 'Output') {
  try {
    // Hide all page sections immediately to prevent flashing
    document.getElementById('tables').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('searchInput').style.display = 'none';
    document.getElementById('sectionButtons').style.display = 'none';

    const oldContactInput = document.getElementById('searchInputContact');
    if (oldContactInput && oldContactInput.parentNode) {
      oldContactInput.parentNode.remove();
    }

    const oldResetBtn = document.getElementById('contactResetBtn');
    if (oldResetBtn) oldResetBtn.remove();

    if (sheetName === 'Dashboard') {
      // Hide attendance summary if switching from attendance page
      const summary = document.getElementById('attendance-summary');
      if (summary) summary.style.display = 'none';

      // Hide attendance search and filters
      document.getElementById('searchInput').style.display = 'none';
      document.getElementById('sectionButtons').style.display = 'none';

      // Remove contact search bar if it exists
      const contactSearch = document.getElementById('searchInputContact');
      if (contactSearch) contactSearch.remove();

      // Hide print button
      document.getElementById('printBtn').style.display = 'none';

      // Show dashboard
      document.getElementById('mainTitle').textContent = '//Dashboard//';
      document.getElementById('tables').style.display = 'none';
      document.getElementById('dashboardContainer').style.display = 'block';
      document.getElementById('dashboardIframe').src = "https://pursuegen.com/leader/tracker/dashboard.html";

      // Update active buttons
      document.getElementById('attendanceBtn').classList.remove('active-button');
      document.getElementById('contactBtn').classList.remove('active-button');
      document.getElementById('dashboardBtn').classList.add('active-button');

      document.body.classList.remove('mode-tracker'); // NEW: not the tracker view
      return;
    }

    if (sheetName !== 'ContactInfo') {
      const oldContactInput = document.getElementById('searchInputContact');
      if (oldContactInput && oldContactInput.parentNode) {
        oldContactInput.parentNode.remove(); // removes wrapper that contains input + clear "�"
      }
      const oldResetBtn = document.getElementById('contactResetBtn');
      if (oldResetBtn) oldResetBtn.remove();
    }

    const jsonData = await fetchJSON(sheetName);
    const parsed = parseJSON(jsonData, sheetName);

    // Reset inputs
    document.getElementById('searchInput').value = '';
    const contactSearch2 = document.getElementById('searchInputContact');
    if (contactSearch2) contactSearch2.remove();
    if (sheetName === 'Output') applySearch(); // fully reset visible state

    renderTables(parsed, sheetName);

    const titleDiv = document.getElementById('mainTitle');
    if (sheetName === 'ContactInfo') {
      titleDiv.textContent = 'Contact Info';
      document.getElementById('printBtn').style.display = 'inline-flex';
    } else {
      titleDiv.textContent = 'Engagement Tracker';
      document.getElementById('printBtn').style.display = 'inline-flex';
    }

    // Button active states
    document.getElementById('attendanceBtn').classList.remove('active-button');
    document.getElementById('contactBtn').classList.remove('active-button');
    document.getElementById('dashboardBtn').classList.remove('active-button');

    if (sheetName === 'Output') {
  const tablesDiv = document.getElementById('tables');
  tablesDiv.classList.remove('fade-in');
  tablesDiv.style.display = 'block';
  void tablesDiv.offsetWidth;
  tablesDiv.classList.add('fade-in');

  document.getElementById('attendanceBtn').classList.add('active-button');
  document.getElementById('tables').style.display = 'block';
  document.getElementById('searchInput').style.display = 'block';
  document.getElementById('sectionButtons').style.display = 'flex';
  document.getElementById('dashboardContainer').style.display = 'none';
  document.getElementById('printBtn').style.display = 'inline-flex';

  // ✅ Only show filter buttons for sections actually present for this user
  const availableSections = desiredOrder.filter(s => parsed[s]);
  setupFilters(availableSections);

  document.body.classList.add('mode-tracker');
} else if (sheetName === 'ContactInfo') {
  const tablesDiv = document.getElementById('tables');
  tablesDiv.classList.remove('fade-in');
  tablesDiv.style.display = 'block';
  void tablesDiv.offsetWidth;
  tablesDiv.classList.add('fade-in');

  document.getElementById('contactBtn').classList.add('active-button');
  document.getElementById('tables').style.display = 'block';
  document.getElementById('searchInput').style.display = 'none';
  document.getElementById('sectionButtons').style.display = 'none';
  document.getElementById('dashboardContainer').style.display = 'none';
  document.getElementById('printBtn').style.display = 'inline-flex';

  // ✅ remove setupFilters() here

  document.body.classList.remove('mode-tracker');
}

  } catch (err) {
    console.error(err);
    document.getElementById('tables').textContent = 'Error loading tracker data.';
  }
}




function renderTables(parsedData, sheetName) {
  const tablesDiv = document.getElementById('tables');
  tablesDiv.innerHTML = ''; // Clear previous content

  const trackerSearchInput = document.getElementById('searchInputTracker');
  const sectionFilter = document.getElementById('sectionButtons');

  const isAttendance = sheetName === 'Output';
  const isContact = sheetName === 'ContactInfo';

  // Always hide summary unless it's the attendance page
  const summary = document.getElementById('attendance-summary');
  if (summary) summary.style.display = 'none';


  if (trackerSearchInput) trackerSearchInput.style.display = 'none';
  if (sectionFilter) sectionFilter.style.display = 'none';

  const existingContactSearch = document.getElementById('searchInputContact');
  if (existingContactSearch) existingContactSearch.remove();

  // ========== ATTENDANCE PAGE ==========
  if (isAttendance) {
    if (trackerSearchInput) trackerSearchInput.style.display = 'block';
    if (sectionFilter) sectionFilter.style.display = 'flex';

    const sections = desiredOrder;
    for (let section of sections) {
      if (!parsedData[section]) continue;
      const { headers, rows } = parsedData[section];
      // ✅ Remove spacer/blank rows (including non-breaking spaces) so no visual gaps appear
const cleanRows = (rows || []).filter(r => {
  if (!r || !Array.isArray(r)) return false;

  // Name cell must exist and not be blank (handles NBSP too)
  const rawName = r[0] == null ? '' : String(r[0]);
  const nameClean = rawName.replace(/[\s\u00A0]/g, ''); // removes spaces + NBSP
  if (!nameClean) return false;

  // Row must have at least one attendance value somewhere (prevents empty “gap” rows)
  const hasAnyAttendance = r.slice(1).some(v => {
    const s = v == null ? '' : String(v);
    return s.replace(/[\s\u00A0]/g, '') !== '';
  });

  return hasAnyAttendance;
});

      if (!headers.length) continue;

      const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'group-section';
    sectionWrapper.setAttribute('data-group', section);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'section-header';
    headerDiv.textContent = section;

    sectionWrapper.appendChild(headerDiv);


      // ✅ MOBILE COLLAPSIBLE VIEW (ONLY on small screens)
      if (window.innerWidth < 768) {
        const mobileContainer = document.createElement('div');
        mobileContainer.className = 'attendance-list-mobile';

        const mostRecentDate = headers[1]; // ✅ correct (column after "Name")

        const olderDates = headers.slice(1, -1);

        const sortedMobileRows = [...cleanRows]
        .filter(row => row[0] && row[0].trim() !== '')
  .sort((a, b) => {
    const nameA = (a[0] || '').toLowerCase();
    const nameB = (b[0] || '').toLowerCase();

    const statusA = String(a[1] || '').toLowerCase(); // most recent week
    const statusB = String(b[1] || '').toLowerCase();

    function rank(status) {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'ftg') return 0;
  if (s === 'true') return 1;
  return 2; // false/blank/etc
}

    const rankDiff = rank(statusA) - rank(statusB);
    if (rankDiff !== 0) return rankDiff;

    return nameA.localeCompare(nameB);
  });

sortedMobileRows.forEach(row => {

  const studentName = row[0];
    const attendance = row.slice(1);
    const mostRecent = attendance[0]; // most recent date's value
    const emoji = getEmoji(mostRecent); // ✅ add this line

    const olderAttendance = attendance.slice(0, -1);

    const card = document.createElement('div');
    card.className = 'student-card mobile-card';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'student-toggle';
    toggleBtn.innerHTML = `<div class="student-name">${studentName}</div><span>${mostRecentDate}: ${emoji}</span>`;
    // ✅ updated with emoji

    toggleBtn.onclick = () => {
    const details = toggleBtn.nextElementSibling;
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
  };

          const detailDiv = document.createElement('div');
          detailDiv.className = 'student-details';
          detailDiv.style.display = 'none';

olderDates.forEach((date, i) => {
  const status = olderAttendance[i];
  const emoji = getEmoji(status); // ✅ add this
  const line = document.createElement('div');
  line.innerHTML = `<strong>${date}:</strong> ${emoji}`; // ✅ updated
  detailDiv.appendChild(line);
});


          card.appendChild(toggleBtn);
          card.appendChild(detailDiv);
          mobileContainer.appendChild(card);
        });

        mobileContainer.classList.add('mobile-only');
        sectionWrapper.appendChild(mobileContainer);

      }





      // ✅ DESKTOP TABLE
      const table = document.createElement('table');
      table.classList.add('desktop-only');

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');

      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');

// 🔥 SORT ROWS BY MOST RECENT WEEK:
// FTG → Present → Absent → Alphabetical
const sortedRows = [...cleanRows].sort((a, b) => {
  const nameA = (a[0] || '').toLowerCase();
  const nameB = (b[0] || '').toLowerCase();

  const statusA = String(a[1] || '').toLowerCase(); // most recent week
  const statusB = String(b[1] || '').toLowerCase();

  function rank(status) {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'ftg') return 0;
  if (s === 'true') return 1;
  return 2; // false/blank/etc
}

  const rankDiff = rank(statusA) - rank(statusB);
  if (rankDiff !== 0) return rankDiff;

  return nameA.localeCompare(nameB);
});

sortedRows.forEach(row => {
  const tr = document.createElement('tr');

        if (sheetName === 'ContactInfo') {
  tr.style.cursor = 'pointer';
  tr.addEventListener('click', () => openModal(row));
}

row.forEach((cell, i) => {
  const td = document.createElement('td');
  const val = typeof cell === 'string' ? cell.trim().toLowerCase() : cell;

  if (i !== 0) {
    if (val === true || val === 'true') {
      td.textContent = '🟢';
    } else if (val === false || val === 'false') {
      td.textContent = '🔴';
    } else if (val === 'ftg') {
      td.textContent = '🔵';
    } else {
      td.textContent = cell;
    }
  } else {
    td.textContent = cell;
  }

  tr.appendChild(td);
});


    tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      sectionWrapper.appendChild(table);
tablesDiv.appendChild(sectionWrapper);

    }

  }

  // ========== CONTACT PAGE ==========
else if (isContact) {
  const contactData = parsedData.ContactInfo;
  const { headers, rows } = contactData;

  const instruction = document.createElement('div');
  instruction.textContent = '↓ Click any student name below to open the Student Follow-Up form ↓';
  Object.assign(instruction.style, {
    color: '#ccc',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center'
  });
  tablesDiv.appendChild(instruction);

  // Create search wrapper
  const searchWrapper = document.createElement('div');
  searchWrapper.style.position = 'relative';
  searchWrapper.style.width = '360px';
  searchWrapper.style.margin = '0 auto 10px auto';

  const contactSearchInput = document.createElement('input');
  contactSearchInput.type = 'text';
  contactSearchInput.id = 'searchInputContact';
  contactSearchInput.placeholder = 'Search by student name';

  Object.assign(contactSearchInput.style, {
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '20px',
    border: '2px solid #ccc',
    backgroundColor: '#1e1e1e',
    color: 'white',
    width: '100%',
    textAlign: 'center',
    boxSizing: 'border-box'
  });

  if (!document.getElementById('contactPlaceholderStyle')) {
    const style = document.createElement('style');
    style.id = 'contactPlaceholderStyle';
    style.textContent = `
      #searchInputContact::placeholder {
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  searchWrapper.appendChild(contactSearchInput);

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.parentNode.insertBefore(searchWrapper, printBtn);
  } else {
    tablesDiv.appendChild(searchWrapper);
  }

  // Reset Button
  const resetBtn = document.createElement('button');
  resetBtn.id = 'contactResetBtn';
  resetBtn.textContent = 'Reset';
  Object.assign(resetBtn.style, {
    backgroundColor: '#1e1e1e',
    color: 'white',
    border: '1px solid white',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s',
    display: 'block',
    margin: '20px auto 10px auto'
  });

  // === MOBILE CARD VIEW ===
  const mobileContainer = document.createElement('div');
  mobileContainer.className = 'attendance-list-mobile mobile-only';

  const allowedGroups = [
  '6 girls', '6 boys', '7 girls', '7 boys', '8 girls', '8 boys',
  '9 girls', '9 boys', '10 girls', '10 boys', '11 girls', '11 boys',
  '12 girls', '12 boys', 'other'
];

rows
  .filter(row => row[2] && allowedGroups.includes(row[2].trim().toLowerCase()))
  .forEach(row => {
    const name = row[1];
    const pcoID = row[0];
    const gradeGroup = row[2];
    const phone = row[3];
    const email = row[4];
    const card = document.createElement('div');
    card.className = 'student-card';

    const nameEl = document.createElement('div');
    nameEl.className = 'student-name clickable-name';
    nameEl.textContent = name;
    nameEl.style.cursor = 'pointer';
    nameEl.addEventListener('click', () => {
      openModal([name, pcoID, gradeGroup]);
    });

    const gradeEl = document.createElement('div');
    gradeEl.className = 'attendance-summary';
    gradeEl.textContent = `Grade: ${gradeGroup}`;

    const phoneEl = document.createElement('div');
    phoneEl.className = 'attendance-summary';
    phoneEl.textContent = `Phone: ${phone}`;

    const emailEl = document.createElement('div');
    emailEl.className = 'attendance-summary';
    emailEl.textContent = `Email: ${email}`;


    const pcoEl = document.createElement('div');
    pcoEl.className = 'attendance-summary';
    pcoEl.textContent = `PCO ID: ${pcoID}`;


    card.appendChild(nameEl);
    card.appendChild(gradeEl);
    card.appendChild(phoneEl);
    card.appendChild(emailEl);
    card.appendChild(pcoEl);

    mobileContainer.appendChild(card);
  });

  tablesDiv.appendChild(mobileContainer);

// === DESKTOP TABLE VIEW ===
let searchValue = '';
const trackerSearchInput = document.getElementById('trackerSearchInput');
if (trackerSearchInput) {
  searchValue = trackerSearchInput.value.trim().toLowerCase();
}

const matchingRows = rows.filter(row => {
  const group = row[2] ? row[2].trim().toLowerCase() : '';
  const name = row[1] ? row[1].trim().toLowerCase() : '';
  return allowedGroups.includes(group) && (!searchValue || name.includes(searchValue));
});

if (matchingRows.length === 0) return;

const table = document.createElement('table');
table.classList.add('desktop-only');

const thead = document.createElement('thead');
const headerRow = document.createElement('tr');
headers.forEach(header => {
  const th = document.createElement('th');
  th.textContent = header;
  headerRow.appendChild(th);
});
thead.appendChild(headerRow);
table.appendChild(thead);

const tbody = document.createElement('tbody');

matchingRows.forEach(row => {
  const tr = document.createElement('tr');
  row.forEach((cell, i) => {
    const td = document.createElement('td');
    if (i === 1) {
      td.classList.add('clickable-name');
      td.textContent = cell;
      td.style.cursor = 'pointer';
      td.addEventListener('click', () => {
        const name = row[1];
        const pcoID = row[0];
        const gradeGroup = row[2];
        openModal([name, pcoID, gradeGroup]);
      });
    } else {
      td.textContent = cell;
    }
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
});

table.appendChild(tbody);
tablesDiv.appendChild(table);

  
  // Add Reset Button
  if (printBtn) {
    printBtn.parentNode.insertBefore(resetBtn, printBtn);
  } else {
    tablesDiv.appendChild(resetBtn);
  }

  // Filter logic
  contactSearchInput.addEventListener('input', () => {
    const filter = contactSearchInput.value.toLowerCase();
    table.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  });

  contactSearchInput.addEventListener('input', () => {
  const filter = contactSearchInput.value.toLowerCase();
  
  // Filter mobile cards
  document.querySelectorAll('.attendance-list-mobile .student-card').forEach(card => {
    const nameEl = card.querySelector('.student-name');
    const name = nameEl ? nameEl.textContent.toLowerCase() : '';
    const match = name.includes(filter);
    card.style.display = match ? '' : 'none';
  });
});


resetBtn.addEventListener('click', () => {
  contactSearchInput.value = '';

  // Show desktop rows
  table.querySelectorAll('tbody tr').forEach(row => {
    row.style.display = '';
  });

  // Show mobile cards
  document.querySelectorAll('.attendance-list-mobile .student-card').forEach(card => {
    card.style.display = '';
  });

  contactSearchInput.focus();
});

}

if (isAttendance) {
   // const summary = document.getElementById('attendance-summary');
    if (summary) summary.style.display = 'block';
    initializeSummary();
  }

  function initializeSummary() {
  const table = document.querySelector('table.desktop-only');
  if (!table) return;

const headers = [...table.querySelectorAll('thead th')];
const weekHeaders = headers.slice(1); // Start from index 1 to keep "June 18, 2025"
const weekSelector = document.getElementById('weekSelector');

weekSelector.innerHTML = '';
weekHeaders.forEach((th, idx) => {
  const option = document.createElement('option');
  option.value = idx + 1; // Corresponds to column index in tbody
  option.textContent = th.textContent;
  weekSelector.appendChild(option);
});


  weekSelector.selectedIndex = 0;
  updateSummary();

  

  // Update on change or search input
  weekSelector.addEventListener('change', updateSummary);
  document.querySelector('.dataTables_filter input')?.addEventListener('input', () => {
    setTimeout(updateSummary, 200); // small delay for filter to apply
  });
}

function updateSummary() {
  const colIndex = parseInt(document.getElementById('weekSelector').value, 10);
  const rows = [...document.querySelectorAll('table.desktop-only tbody tr')];
  let trueCount = 0;
  let ftgCount = 0;

  rows.forEach(row => {
    // ✅ If the entire section is hidden, skip it
    const section = row.closest('.group-section');
    if (section && section.style.display === 'none') return;

    // ✅ If row itself is hidden, skip it
    if (row.style.display === 'none') return;

    const cell = row.children[colIndex];
    if (!cell) return;

    const text = cell.textContent.trim().toLowerCase();
    if (text === '🟢' || text === 'true') trueCount++;
    else if (text === '🔵' || text === 'ftg') ftgCount++;
  });

  document.getElementById('trueCount').textContent = `🟢 ${trueCount}`;
  document.getElementById('ftgCount').textContent = `🔵 ${ftgCount}`;
  document.getElementById('totalCount').textContent = `Total: ${trueCount + ftgCount}`;
}

window.updateSummary = updateSummary;



}


	</script>
  
  <!-- Student Follow-Up Modal -->
<div id="leaderNoteModal" class="modal" style="display:none; justify-content:center; align-items:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999;">
  <div class="modal-content" style="background:white; border-radius:12px; padding:30px 40px; max-width:500px; width:90%; box-shadow:0 8px 24px rgba(0,0,0,0.2);">

    <!-- Centered logo -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://pursuegen.com/logo/logobk.png" alt="Life Students Logo" style="max-width: 240px;">
    </div>

    <h2 style="text-align:center; margin-bottom: 20px;">Student Follow-Up Form</h2>

    <form id="leaderNoteForm" style="display:flex; flex-direction:column; gap:12px;">
      <label for="leaderName">Leader's Name (First and Last):</label>
      <input type="text" id="leaderName" name="leaderName" required>

      <label for="note">Note:</label>
      <textarea id="note" name="note" rows="4" required></textarea>

      <label for="studentName">Student's Name:</label>
      <input type="text" id="studentName" name="studentName" readonly>

      <label for="studentID">PCO ID:</label>
      <input type="text" id="ID" name="ID" readonly>

      <label for="gradeID">Grade ID:</label>
      <input type="text" id="gradeID" name="gradeID" readonly>

      <div style="display:flex; justify-content:space-between; margin-top: 20px;">
        <button type="submit" style="padding:10px 16px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer;">Submit</button>
        <button type="button" onclick="closeModal()" style="padding:10px 16px; background:#ccc; border:none; border-radius:6px; cursor:pointer;">Cancel</button>
      </div>
    </form>

    <div id="successMessage" style="display:none; margin-top:20px; font-weight:bold; color:green; text-align:center;"></div>

  </div>
</div>


<script>

if (!document.getElementById('fadeInStyle')) {
  const style = document.createElement('style');
  style.id = 'fadeInStyle';
  style.textContent = `
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}


// Get modal elements
document.addEventListener('DOMContentLoaded', function () {
  // Existing modal references
  const modal = document.getElementById('leaderNoteModal');
  const form = document.getElementById('leaderNoteForm');
  const successMessage = document.getElementById('successMessage');

  // NEW: Convert grade group ("6 Girls", "10 Boys", etc.) into GradeID buckets
  function getGradeIdFromGradeGroup(gradeGroup) {
    const s = (gradeGroup || "").toLowerCase().trim();

    // gender
    const gender = s.includes("girl") ? "girl" : s.includes("boy") ? "boy" : "";

    // grade number (handles "6 Girls", "6th Grade Girls", "6thgradegirls", etc.)
    const m = s.match(/(6|7|8|9|10|11|12)/);
    const gradeNum = m ? parseInt(m[1], 10) : null;

    // bucket
    let bucket = "";
    if (gradeNum >= 6 && gradeNum <= 8) bucket = "middleschool";
    else if (gradeNum >= 9 && gradeNum <= 12) bucket = "highschool";

    // fallback: keep old behavior if parsing fails so nothing breaks
    if (!bucket || !gender) {
      return s
        .replace(/\s+/g, "")
        .replace("girls", "girl")
        .replace("boys", "boy");
    }

    return `${bucket}${gender}`;
  }


  // Function to open the modal with populated data
  function openModal(studentData) {
    modal.style.display = 'flex';

    const name = studentData[0] || '';
    const pcoID = studentData[1] || '';
    const gradeGroup = studentData[2] || '';

    const gradeIDFormatted = getGradeIdFromGradeGroup(gradeGroup);

    document.getElementById('studentName').value = name;
    document.getElementById('ID').value = pcoID;
    document.getElementById('gradeID').value = gradeIDFormatted;

    form.leaderName.value = '';
    form.note.value = '';
    successMessage.style.display = 'none';
    form.querySelector('button[type="submit"]').disabled = false;
  }

  window.openModal = openModal;

  // Function to close modal and reset form
  function closeModal() {
    modal.style.display = 'none';
    form.reset();
    successMessage.textContent = '';
    successMessage.style.display = 'none';
    successMessage.style.color = 'green';
  }

  window.closeModal = closeModal;

  // Click listener on table rows
  document.querySelectorAll('.student-link').forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const row = this.closest('tr');
      const cells = row.querySelectorAll('td');
      const pcoID = cells[0].textContent.trim();
      const name = cells[1].textContent.trim();
      const gradeGroup = cells[2].textContent.trim();
      openModal([name, pcoID, gradeGroup]);
    });
  });

  // Submit form handler (unchanged from your existing code)
form.addEventListener('submit', function(event) {
  event.preventDefault();

  form.querySelector('button[type="submit"]').disabled = true;

  const dataToSend = {
    "Leader's Name (First and Last)": document.getElementById('leaderName').value.trim(),
    "Note": document.getElementById('note').value.trim(),
    "Name": document.getElementById('studentName').value,
    "ID": document.getElementById('ID').value,
    "GradeID": document.getElementById('gradeID').value
  };

  fetch('https://pursuegen.com/leader/tracker/submitNote.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend)
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(result => {
    successMessage.textContent = 'Note submitted successfully!';
    successMessage.style.color = 'green';
    successMessage.style.display = 'block';
    form.querySelector('button[type="submit"]').disabled = false;

    form.leaderName.value = '';
    form.note.value = '';

    setTimeout(closeModal, 2000);
  })
  .catch(error => {
    successMessage.textContent = 'Error submitting note. Please try again.';
    successMessage.style.color = 'red';
    successMessage.style.display = 'block';
    form.querySelector('button[type="submit"]').disabled = false;
  });
});

});


</script>    

<div id="mobileList" class="student-list"></div>

<script>
  function renderMobileAttendance(data, dates) {
    const container = document.getElementById('mobileList');
    container.innerHTML = '';
    data.forEach(student => {
      const card = document.createElement('div');
      card.className = 'student-card';

      const name = document.createElement('div');
      name.className = 'student-name';
      name.textContent = student.name;

      const recentDate = dates[0];
      const recentStatus = student[recentDate] || '';
      const summary = document.createElement('div');
      summary.className = 'attendance-summary';
      summary.textContent = `${getEmoji(recentStatus)} ${recentDate}: ${recentStatus}`;

      const toggle = document.createElement('div');
      toggle.className = 'expand-toggle';
      toggle.textContent = 'Show More ▼';
      toggle.addEventListener('click', () => {
        historyDiv.style.display = historyDiv.style.display === 'none' ? 'block' : 'none';
        toggle.textContent = historyDiv.style.display === 'none' ? 'Show More ▼' : 'Hide ▲';
      });

      const historyDiv = document.createElement('div');
      historyDiv.className = 'attendance-history';
      for (let i = 1; i < dates.length; i++) {
        const date = dates[i];
        const status = student[date] || '';
        const entry = document.createElement('div');
        entry.textContent = `${getEmoji(status)} ${date}: ${status}`;
        historyDiv.appendChild(entry);
      }

      card.appendChild(name);
      card.appendChild(summary);
      if (dates.length > 1) {
        card.appendChild(toggle);
        card.appendChild(historyDiv);
      }

      container.appendChild(card);
    });
  }

  function getEmoji(status) {
  const str = String(status).toLowerCase();
  if (str.includes('present') || str === 'true') return '🟢';
  if (str.includes('absent') || str === 'false') return '🔴';
  if (str === 'ftg') return '🔵';  // ✅ New case for FTG
  return '';
}


window.addEventListener('load', () => {
  // Reset search and cleanup
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const contactSearch = document.getElementById('searchInputContact');
  if (contactSearch) contactSearch.remove();

  loadSheet('Output'); // ✅ Auto-load Engagement Tracker
});

</script>

  
</body>
</html>
