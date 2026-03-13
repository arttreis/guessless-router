// ═══════════════ GUESSLESS IA — SHARED JS ═══════════════

(function () {
  // Detect current page from pathname
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var isHub = path === '/' || path === '/index.html';

  // OS-aware shortcut label
  var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  var shortcutLabel = isMac ? '\u2318F' : 'Ctrl+F';

  // Search bar — only shows on Hub page (where filterApps works)
  var searchBlock = isHub
    ? '<div class="sidebar-search">'
    + '  <span class="search-icon-wrap">'
    + '    <i data-lucide="search" style="width:15px;height:15px"></i>'
    + '  </span>'
    + '  <input type="text" placeholder="Buscar aplicações..." id="searchInput" oninput="filterApps(this.value)">'
    + '  <span class="search-shortcut">' + shortcutLabel + '</span>'
    + '</div>'
    : '';

  // Sidebar HTML
  var sidebarHTML = ''
    + '<div class="sidebar-brand">'
    + '  <div class="brand-icon">'
    + '    <i data-lucide="brain" style="width:20px;height:20px"></i>'
    + '  </div>'
    + '  <span class="brand-text">GuessLess</span>'
    + '  <span class="brand-badge">IA</span>'
    + '</div>'
    + searchBlock
    + '<div class="sidebar-section">'
    + '  <div class="sidebar-section-title">Plataforma</div>'
    + '  <ul class="sidebar-nav">'
    + '    <li><a href="/"' + (isHub ? ' class="active"' : '') + '>'
    + '      <span class="nav-icon"><i data-lucide="layout-grid"></i></span> Hub'
    + '    </a></li>'
    + '    <li><a href="/dashboard.html"' + (path === '/dashboard.html' ? ' class="active"' : '') + '>'
    + '      <span class="nav-icon"><i data-lucide="bar-chart-3"></i></span> Dashboard'
    + '    </a></li>'
    + '    <li><a href="https://n8n-n8n.yx8026.easypanel.host/" target="_blank" rel="noopener">'
    + '      <span class="nav-icon"><i data-lucide="zap"></i></span> Automações'
    + '      <span class="external-badge"><i data-lucide="external-link" style="width:12px;height:12px"></i></span>'
    + '    </a></li>'
    + '    <li><a href="/relatorios.html"' + (path === '/relatorios.html' ? ' class="active"' : '') + '>'
    + '      <span class="nav-icon"><i data-lucide="file-text"></i></span> Relatórios'
    + '    </a></li>'
    + '  </ul>'
    + '</div>'
    + '<div class="sidebar-section">'
    + '  <div class="sidebar-section-title">Aplicações</div>'
    + '  <ul class="sidebar-nav">'
    + '    <li><a href="/seo">'
    + '      <span class="nav-icon"><i data-lucide="search-check"></i></span> Auditoria de SEO'
    + '    </a></li>'
    + '    <li><a href="/erp">'
    + '      <span class="nav-icon"><i data-lucide="boxes"></i></span> ERP'
    + '    </a></li>'
    + '    <li><a href="/jarvis/meu-dia">'
    + '      <span class="nav-icon"><i data-lucide="bot"></i></span> Jarvis'
    + '    </a></li>'
    + '    <li><a href="/meivende">'
    + '      <span class="nav-icon"><i data-lucide="trending-up"></i></span> MeiVende'
    + '    </a></li>'
    + '    <li><a href="/atlas">'
    + '      <span class="nav-icon"><i data-lucide="globe"></i></span> Atlas'
    + '    </a></li>'
    + '    <li><a href="/dash">'
    + '      <span class="nav-icon"><i data-lucide="gauge"></i></span> Dash'
    + '    </a></li>'
    + '  </ul>'
    + '</div>'
    + '<div class="sidebar-section">'
    + '  <div class="sidebar-section-title">Configuração</div>'
    + '  <ul class="sidebar-nav">'
    + '    <li><a href="/settings.html"' + (path === '/settings.html' ? ' class="active"' : '') + '>'
    + '      <span class="nav-icon"><i data-lucide="settings"></i></span> Configurações'
    + '    </a></li>'
    + '    <li><a href="/integracoes.html"' + (path === '/integracoes.html' ? ' class="active"' : '') + '>'
    + '      <span class="nav-icon"><i data-lucide="plug"></i></span> Integrações'
    + '    </a></li>'
    + '  </ul>'
    + '</div>'
    + '<div class="sidebar-footer">'
    + '  <div class="sidebar-user">'
    + '    <div class="user-avatar">'
    + '      <i data-lucide="user" style="width:16px;height:16px"></i>'
    + '    </div>'
    + '    <div class="user-info">'
    + '      <div class="user-name">GuessLess</div>'
    + '      <div class="user-role">Workspace Admin</div>'
    + '    </div>'
    + '    <i data-lucide="chevrons-up-down" style="width:14px;height:14px;color:var(--text-muted)"></i>'
    + '  </div>'
    + '</div>';

  // Inject sidebar
  var sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = sidebarHTML;
  }

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Resize sidebar nav icons
  document.querySelectorAll('.nav-icon .lucide').forEach(function (el) {
    el.style.width = '18px';
    el.style.height = '18px';
  });
})();

// Toggle sidebar (mobile)
function toggleSidebar() {
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.classList.toggle('sidebar-open', sidebar.classList.contains('open'));
}

// Filter apps (used on Hub page)
function filterApps(query) {
  var cards = document.querySelectorAll('.app-card');
  var q = query.toLowerCase().trim();
  cards.forEach(function (card) {
    var name = card.getAttribute('data-name') || '';
    var text = card.textContent.toLowerCase();
    var match = !q || name.includes(q) || text.includes(q);
    card.style.display = match ? '' : 'none';
  });
}

// Keyboard shortcut — only intercept on Hub page where search exists
document.addEventListener('keydown', function (e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
    var input = document.getElementById('searchInput');
    if (input) {
      e.preventDefault();
      input.focus();
    }
  }
});
