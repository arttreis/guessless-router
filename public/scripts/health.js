/* GuessLess IA — Health Check Client */
(function () {
  'use strict';

  var REFRESH_INTERVAL = 45000;
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  // Bug #1 fix: match exact paths like shared.js does
  var isDashboard = path === '/dashboard' || path === '/dashboard.html';
  var isHub = path === '/' || path === '/index.html';

  var refreshTimer = null;

  function setLoading() {
    document.querySelectorAll('.perf-card[data-app]').forEach(function (card) {
      card.querySelectorAll('.perf-metric-value').forEach(function (el) {
        el.textContent = '';
        el.classList.add('skeleton');
      });
      var status = card.querySelector('.perf-status');
      if (status) {
        status.className = 'perf-status checking';
        status.innerHTML = '<span class="dot"></span> Verificando\u2026';
      }
    });

    document.querySelectorAll('.app-card[data-app]').forEach(function (card) {
      var status = card.querySelector('.app-status');
      if (status) {
        status.className = 'app-status checking';
        status.innerHTML = '<span class="dot"></span> Verificando\u2026';
      }
    });

    document.querySelectorAll('[data-health-stat]').forEach(function (el) {
      el.classList.add('skeleton');
      el.textContent = '';
    });
  }

  function setErrorState() {
    // Bug #15 fix: update ALL indicators on error, not just stats
    document.querySelectorAll('[data-health-stat]').forEach(function (el) {
      el.classList.remove('skeleton');
      el.textContent = 'Sem dados';
    });
    document.querySelectorAll('.perf-metric-value.skeleton').forEach(function (el) {
      el.classList.remove('skeleton');
      el.textContent = '\u2014';
    });
    document.querySelectorAll('.perf-status.checking').forEach(function (el) {
      el.className = 'perf-status offline';
      el.innerHTML = '<span class="dot"></span> Erro';
    });
    document.querySelectorAll('.app-status.checking').forEach(function (el) {
      el.className = 'app-status offline';
      el.innerHTML = '<span class="dot"></span> Erro';
    });
  }

  function renderDashboard(data) {
    if (!data || !data.apps) return;

    data.apps.forEach(function (app) {
      var card = document.querySelector('.perf-card[data-app="' + app.id + '"]');
      if (!card) return;

      var status = card.querySelector('.perf-status');
      if (status) {
        var isOnline = app.status === 'online';
        status.className = 'perf-status ' + (isOnline ? 'online' : 'offline');
        status.innerHTML = '<span class="dot"></span> ' + (isOnline ? 'Online' : 'Offline');
      }

      // Bug #12 fix: use data-metric attribute instead of text matching
      var metrics = card.querySelectorAll('.perf-metric');
      metrics.forEach(function (m) {
        var value = m.querySelector('.perf-metric-value');
        if (!value) return;
        value.classList.remove('skeleton');

        var metric = m.dataset.metric;
        if (metric === 'latency') {
          value.textContent = app.latency != null ? app.latency + 'ms' : '\u2014';
          value.className = 'perf-metric-value' + (app.latency == null ? ' muted' : '');
        } else {
          value.textContent = '\u2014';
          value.className = 'perf-metric-value muted';
        }
      });

      var barRow = card.querySelector('.perf-bar-row');
      if (barRow) barRow.style.display = 'none';
    });

    updateOverviewStats(data);
  }

  function renderHub(data) {
    if (!data || !data.apps) return;

    data.apps.forEach(function (app) {
      var card = document.querySelector('.app-card[data-app="' + app.id + '"]');
      if (!card) return;

      var status = card.querySelector('.app-status');
      if (status) {
        var isOnline = app.status === 'online';
        status.className = 'app-status ' + (isOnline ? 'online' : 'offline');
        status.innerHTML = '<span class="dot"></span> ' + (isOnline ? 'Online' : 'Offline');
      }
    });

    updateOverviewStats(data);
  }

  function updateOverviewStats(data) {
    var el = document.querySelector('[data-health-stat="apps-online"]');
    if (el) {
      el.classList.remove('skeleton');
      el.textContent = data.summary.online + '/' + data.summary.total;
    }

    el = document.querySelector('[data-health-stat="avg-latency"]');
    if (el) {
      el.classList.remove('skeleton');
      el.textContent = data.summary.avgLatency != null ? data.summary.avgLatency + 'ms' : '\u2014';
    }

    el = document.querySelector('[data-health-stat="last-check"]');
    if (el) {
      el.classList.remove('skeleton');
      var d = new Date(data.timestamp);
      el.textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    el = document.querySelector('[data-health-stat="status-msg"]');
    if (el) {
      el.classList.remove('skeleton');
      var allOnline = data.summary.online === data.summary.total;
      el.textContent = allOnline ? 'Todas operacionais' : data.summary.online + ' de ' + data.summary.total + ' online';
    }

    el = document.querySelector('[data-health-change="apps"]');
    if (el) {
      var allOn = data.summary.online === data.summary.total;
      el.className = 'stat-change ' + (allOn ? 'up' : 'neutral');
      el.innerHTML = '<i data-lucide="' + (allOn ? 'trending-up' : 'alert-triangle') + '"></i> ' +
        (allOn ? 'Todas operacionais' : data.summary.online + ' de ' + data.summary.total + ' online');
    }

    el = document.querySelector('[data-health-change="latency"]');
    if (el) {
      el.className = 'stat-change neutral';
      el.innerHTML = '<i data-lucide="minus"></i> Tempo real';
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function fetchHealth() {
    fetch('/api/health')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (isDashboard) renderDashboard(data);
        if (isHub) renderHub(data);
      })
      .catch(function () {
        setErrorState();
      });
  }

  // Init
  if (isDashboard || isHub) {
    setLoading();
    fetchHealth();

    // Bug #8 fix: use Page Visibility API to pause polling in background tabs
    refreshTimer = setInterval(fetchHealth, REFRESH_INTERVAL);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
      } else {
        fetchHealth();
        refreshTimer = setInterval(fetchHealth, REFRESH_INTERVAL);
      }
    });
  }
})();
