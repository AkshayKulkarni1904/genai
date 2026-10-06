/**
 * Enterprise GenAI Engineering Console - Master SPA Controller
 * Modules 7 through 13 Interactive Workbench
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  const state = {
    currentView: 'dashboard',
    kgData: { nodes: [], edges: [] },
    kgActiveFilter: 'all',
    kgSearchTerm: '',
    canvasTransform: { x: 0, y: 0, scale: 1 },
    selectedNode: null,
    evalResults: null,
    assessmentReport: null,
    extractedInvoice: null,
    latestBriefing: ''
  };

  // --------------------------------------------------------------------------
  // Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // File Download Helper
  // --------------------------------------------------------------------------
  function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  }

  // --------------------------------------------------------------------------
  // API Fetch Utility
  // --------------------------------------------------------------------------
  async function apiFetch(endpoint, method = 'GET', body = null) {
    const startTime = performance.now();
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(endpoint, options);
      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);
      const latencyEl = document.getElementById('server-latency');
      if (latencyEl) latencyEl.textContent = `Latency: ~${elapsed}ms`;
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      showToast(err.message, 'error');
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // Theme Switcher & Shortcuts
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Theme Switcher & Shortcuts
  // --------------------------------------------------------------------------
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) {
    let savedTheme = localStorage.getItem('genai-theme') || 'theme-light';
    if (savedTheme === 'theme-huggingface') savedTheme = 'theme-light';
    themeSelector.value = savedTheme;
    document.body.className = `${savedTheme}`;

    themeSelector.addEventListener('change', () => {
      const chosen = themeSelector.value;
      document.body.className = `${chosen}`;
      localStorage.setItem('genai-theme', chosen);
      showToast(`Theme switched to ${themeSelector.options[themeSelector.selectedIndex].text}`, 'info');
      drawKgGraph();
    });
  }

  // --------------------------------------------------------------------------
  // Global Platform Search (⌘K / Click)
  // --------------------------------------------------------------------------
  const searchModal = document.getElementById('global-search-modal');
  const searchInput = document.getElementById('global-search-input');
  const searchResultsList = document.getElementById('search-results-list');
  const btnCloseSearch = document.getElementById('btn-close-search');
  const globalSearchTrigger = document.getElementById('global-search-trigger');

  const searchIndex = [
    { id: 'module1', num: 'M01', title: 'Foundations of GenAI & LLMs', category: 'Foundations', tags: ['Tokens', 'BPE', 'Context Window', 'Temperature', 'Cost/Latency', 'Hallucination', 'GPU Economics'] },
    { id: 'module2', num: 'M02', title: 'Prompt Engineering Studio', category: 'Foundations', tags: ['Few-Shot', 'CoT', 'Extraction', 'JSON Schema', 'Triage', 'Classification'] },
    { id: 'module3', num: 'M03', title: 'Using LLM APIs in Programming', category: 'Foundations', tags: ['Tool Calling', 'Function Calling', 'Failover Router', 'Streaming', 'Exponential Backoff', 'Tokens'] },
    { id: 'module4', num: 'M04', title: 'Direct API vs LangChain Benchmark', category: 'Foundations', tags: ['Benchmark', 'Overhead', 'Latency', 'Stack Trace', 'LangChain vs Direct'] },
    { id: 'module5', num: 'M05', title: 'Embeddings & Vector Search Lab', category: 'Retrieval', tags: ['Chunking', 'Fixed', 'Recursive', 'Document-aware', 'Cosine', 'Hybrid RRF', 'Metadata Filter'] },
    { id: 'module6', num: 'M06', title: 'RAG Foundations & Citations', category: 'Retrieval', tags: ['Query Rewriting', 'Multi-Tenant RBAC', 'Reranking', 'Provenance', 'Citations'] },
    { id: 'module7', num: 'M07', title: 'Advanced RAG Patterns', category: 'Retrieval', tags: ['CRAG', 'Corrective RAG', 'Multi-Vector', 'Parent-Child', 'LRU Cache', 'SQL Fallback'] },
    { id: 'module8', num: 'M08', title: 'Knowledge Graph Fundamentals', category: 'Knowledge Graphs', tags: ['Cypher', 'Ontology', 'NetworkX', 'Force Graph', 'IT Support Graph', 'Entity Canonicalization'] },
    { id: 'module9', num: 'M09', title: 'GraphRAG Studio', category: 'Knowledge Graphs', tags: ['GraphRAG', 'Communities', 'Leiden Detection', 'Incident Pipeline', 'Multi-Hop'] },
    { id: 'module10', num: 'M10', title: 'LangChain Framework Lab', category: 'Agents', tags: ['LCEL', 'PDF QA', 'Invoice Extraction', 'Pydantic', 'Citation Assistant'] },
    { id: 'module11', num: 'M11', title: 'LangGraph & Human-in-the-Loop', category: 'Agents', tags: ['LangGraph', 'StateGraph', 'HITL', 'Human Escalation', 'ServiceNow API', 'Interrupt'] },
    { id: 'module12', num: 'M12', title: 'Multi-Agent Swarm', category: 'Agents', tags: ['Supervisor', 'Swarm', 'Blackboard', '5 Specialists', 'Triage Agent', 'Validator Agent'] },
    { id: 'module13', num: 'M13', title: 'Evaluation & Security Guardrails', category: 'Governance', tags: ['50 Golden Queries', 'Benchmark', 'PII Redactor', 'Prompt Injection', 'LLM Judge', 'Precision/Recall'] },
    { id: 'info', num: 'INFO', title: 'GenAI Engineering Learning Scope', category: 'Curriculum', tags: ['Learning Scope', 'Syllabus', 'Quick Revision', 'Roadmap', 'Progression', 'Concepts', 'Recap', 'Architecture Choice'] }
  ];

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('hidden');
    if (searchInput) {
      searchInput.value = '';
      renderSearchResults('');
      searchInput.focus();
    }
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add('hidden');
  }

  function renderSearchResults(query) {
    if (!searchResultsList) return;
    const q = (query || '').toLowerCase().trim();
    const filtered = searchIndex.filter(item => {
      if (!q) return true;
      return item.title.toLowerCase().includes(q) ||
             item.num.toLowerCase().includes(q) ||
             item.category.toLowerCase().includes(q) ||
             item.tags.some(t => t.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      searchResultsList.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-dim);font-size:0.84rem;">No matching modules or concepts found.</div>`;
      return;
    }

    searchResultsList.innerHTML = filtered.map((item, idx) => `
      <div class="search-result-item ${idx === 0 ? 'highlighted' : ''}" data-view="${item.id}">
        <div class="search-result-left">
          <span class="search-res-num">${item.num}</span>
          <div>
            <div class="search-res-title">${item.title}</div>
            <div class="search-res-desc">${item.category} • ${item.tags.slice(0, 4).join(', ')}</div>
          </div>
        </div>
        <span style="font-size:0.75rem;color:var(--accent-primary);font-weight:600;">Jump →</span>
      </div>
    `).join('');

    searchResultsList.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const view = el.getAttribute('data-view');
        closeSearchModal();
        switchView(view);
      });
    });
  }

  globalSearchTrigger?.addEventListener('click', openSearchModal);
  btnCloseSearch?.addEventListener('click', closeSearchModal);
  searchModal?.addEventListener('click', e => {
    if (e.target === searchModal) closeSearchModal();
  });
  searchInput?.addEventListener('input', e => renderSearchResults(e.target.value));

  // Top Nav Category buttons & Dashboard Category Filtering
  function filterDashboardCards(category) {
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-filter') === category);
    });
    document.querySelectorAll('.module-card').forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat === category) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-filter');
      filterDashboardCards(cat);
    });
  });

  document.querySelectorAll('.top-nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.top-nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      if (cat === 'info') {
        switchView('info');
        return;
      }
      switchView('dashboard');
      filterDashboardCards(cat);
      if (cat !== 'all') {
        setTimeout(() => document.getElementById('main-module-grid')?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    });
  });

  document.getElementById('btn-explore-modules')?.addEventListener('click', () => {
    document.getElementById('main-module-grid')?.scrollIntoView({ behavior: 'smooth' });
  });

  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
  });
  document.getElementById('brand-logo-btn')?.addEventListener('click', () => switchView('dashboard'));
  document.getElementById('breadcrumb-home')?.addEventListener('click', () => switchView('dashboard'));
  document.getElementById('btn-quick-run-view')?.addEventListener('click', () => runActiveView());

  const shortcutsModal = document.getElementById('shortcuts-modal');
  const btnShortcuts = document.getElementById('btn-shortcuts');
  const btnCloseShortcuts = document.getElementById('btn-close-shortcuts');

  if (btnShortcuts && shortcutsModal) {
    btnShortcuts.addEventListener('click', () => shortcutsModal.classList.remove('hidden'));
    btnCloseShortcuts?.addEventListener('click', () => shortcutsModal.classList.add('hidden'));
    shortcutsModal.addEventListener('click', e => {
      if (e.target === shortcutsModal) shortcutsModal.classList.add('hidden');
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    // ⌘K or Ctrl+K opens search
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
      return;
    }

    if (searchModal && !searchModal.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearchModal();
        return;
      }
      const items = searchResultsList?.querySelectorAll('.search-result-item') || [];
      let currentIndex = Array.from(items).findIndex(it => it.classList.contains('highlighted'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length > 0) {
          items[currentIndex]?.classList.remove('highlighted');
          currentIndex = (currentIndex + 1) % items.length;
          items[currentIndex]?.classList.add('highlighted');
          items[currentIndex]?.scrollIntoView({ block: 'nearest' });
        }
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length > 0) {
          items[currentIndex]?.classList.remove('highlighted');
          currentIndex = (currentIndex - 1 + items.length) % items.length;
          items[currentIndex]?.classList.add('highlighted');
          items[currentIndex]?.scrollIntoView({ block: 'nearest' });
        }
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[currentIndex]) items[currentIndex].click();
        return;
      }
    }

    // Ignore when typing inside inputs / textareas
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    const key = e.key.toUpperCase();
    if (key === 'D') switchView('dashboard');
    else if (key === 'I') switchView('info');
    else if (key === '1') switchView('module7');
    else if (key === '2') switchView('module8');
    else if (key === '3') switchView('module9');
    else if (key === '4') switchView('module10');
    else if (key === '5') switchView('module11');
    else if (key === '6') switchView('module12');
    else if (key === '7') switchView('module13');
    else if (key === 'R') runActiveView();
    else if (e.key === '?') shortcutsModal?.classList.toggle('hidden');
    else if (e.key === '/') {
      e.preventDefault();
      openSearchModal();
    }
  });

  function runActiveView() {
    switch (state.currentView) {
      case 'dashboard': document.getElementById('btn-run-all-assessment')?.click(); break;
      case 'module7': document.getElementById('btn-run-m7')?.click(); break;
      case 'module8': document.getElementById('btn-run-cypher')?.click(); break;
      case 'module9': document.getElementById('btn-run-m9')?.click(); break;
      case 'module10':
        const activeSub = document.querySelector('.subtab-btn.active')?.getAttribute('data-subtab');
        if (activeSub === 'm10-pdf') document.getElementById('btn-run-m10-pdf')?.click();
        else if (activeSub === 'm10-invoice') document.getElementById('btn-run-m10-invoice')?.click();
        else document.getElementById('btn-run-m10-citation')?.click();
        break;
      case 'module11': document.getElementById('btn-run-m11')?.click(); break;
      case 'module12': document.getElementById('btn-run-m12')?.click(); break;
      case 'module13':
        const activeM13Sub = document.querySelector('#view-module13 .subtab-btn.active')?.getAttribute('data-subtab');
        if (activeM13Sub === 'm13-guardrails') document.getElementById('btn-run-m13-guardrails')?.click();
        else document.getElementById('btn-run-m13-eval')?.click();
        break;
    }
  }

  // --------------------------------------------------------------------------
  // Navigation & View Routing
  // --------------------------------------------------------------------------
  const viewTitles = {
    dashboard: { title: 'System Dashboard', desc: 'Unified control center for Enterprise GenAI Engineering practical pipelines (Modules 1 - 13).' },
    module1: { title: 'Module 01: Foundations of GenAI & LLMs', desc: 'Tokens, context window limits, temperature sampling, hallucination grounding, and latency/cost economics.' },
    module2: { title: 'Module 02: Prompt Engineering Studio', desc: 'Few-shot triage classification, contract clause extraction, chain-of-thought meeting synthesis, and policy rule auditing.' },
    module3: { title: 'Module 03: Using LLM APIs in Programming', desc: 'Resilient client with exponential backoff, failover models, function/tool calling dispatch, streaming deltas, and token budgets.' },
    module4: { title: 'Module 04: Direct LLM API Calls vs LangChain', desc: 'Side-by-side benchmark measuring execution latency, stack depth, dependency footprint, and architectural decision matrix.' },
    module5: { title: 'Module 05: Embeddings & Vector Search Lab', desc: 'Chunking algorithms (Fixed, Recursive, Document-aware), Cosine/Dot/L2 similarity metrics, metadata filtering, and Hybrid RRF.' },
    module6: { title: 'Module 06: Retrieval-Augmented Generation (RAG)', desc: 'Conversational query rewriting, multi-tenant RBAC permissions, cross-encoder reranking, and citation provenance.' },
    module7: { title: 'Module 07: Advanced RAG Patterns', desc: 'Parent-child chunks, multi-vector indexing, corrective RAG (CRAG), and semantic LRU cache.' },
    module8: { title: 'Module 08: Knowledge Graph Fundamentals', desc: 'Enterprise ontology, IT support graph modeling, Cypher pattern engine, and entity resolution.' },
    module9: { title: 'Module 09: GraphRAG Incident Pipeline', desc: '4-step incident resolution workflow combining vector search, community summaries, and multi-hop graph traversal.' },
    module10: { title: 'Module 10: LangChain Framework Lab', desc: 'PDF QA bot with page attribution, structured invoice extraction via LCEL & Pydantic, and citation assistants.' },
    module11: { title: 'Module 11: LangGraph & Human-in-the-Loop', desc: 'Stateful Support Agent with ServiceNow API integration, confidence routing, and human escalation.' },
    module12: { title: 'Module 12: Multi-Agent Systems Swarm', desc: 'Supervisor-Worker orchestrator coordinating 5 specialist agents with a shared blackboard state.' },
    module13: { title: 'Module 13: Evaluation & Security Guardrails', desc: '50 golden queries evaluation benchmark, Precision/Recall, LLM Judge, and PII / Prompt Injection defense.' },
    info: { title: 'GenAI Engineering Learning Scope', desc: 'Authoritative practical learning path and revision reference from LLM fundamentals through production evaluation.' }
  };

  function switchView(viewName) {
    state.currentView = viewName;
    
    // Update navigation active states
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Update top nav active states
    if (viewName === 'info') {
      document.querySelectorAll('.top-nav-link').forEach(b => b.classList.remove('active'));
      document.getElementById('topnav-info')?.classList.add('active');
    } else {
      document.getElementById('topnav-info')?.classList.remove('active');
    }

    // Update workspace views with animation re-trigger
    document.querySelectorAll('.workspace-view').forEach(view => {
      const isTarget = view.id === `view-${viewName}`;
      view.classList.toggle('active', isTarget);
      if (isTarget) {
        view.style.animation = 'none';
        void view.offsetHeight; // trigger reflow
        view.style.animation = '';
      }
    });

    // Update header
    const info = viewTitles[viewName] || { title: 'GenAI Console', desc: '' };
    document.getElementById('view-title').textContent = info.title;
    document.getElementById('view-desc').textContent = info.desc;

    // Update breadcrumb
    const breadcrumbEl = document.getElementById('breadcrumb-current');
    if (breadcrumbEl) {
      breadcrumbEl.textContent = viewName === 'dashboard' ? 'Overview' : info.title;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View-specific lazy loaders
    if (viewName === 'module8') {
      setTimeout(() => {
        resizeKgCanvas();
        loadModule8Graph();
        loadModule8Governance();
      }, 50);
    } else if (viewName === 'module9') {
      loadModule9Communities();
    } else if (viewName === 'module13') {
      setTimeout(() => {
        const resEl = document.getElementById('m13-guardrails-results');
        if (resEl && !resEl.querySelector('.step-summary-bar')) {
          document.getElementById('btn-run-m13-guardrails')?.click();
        }
      }, 50);
    }
  }
  window.switchView = switchView;

  // Bind navigation clicks
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.getAttribute('data-view')));
  });

  // Dashboard card quick links
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => switchView(card.getAttribute('data-nav')));
  });

  // Dashboard Quick Action Buttons
  document.getElementById('btn-quick-test-m7')?.addEventListener('click', () => {
    switchView('module7');
    document.getElementById('btn-run-m7')?.click();
  });
  document.getElementById('btn-quick-test-m12')?.addEventListener('click', () => {
    switchView('module12');
    document.getElementById('btn-run-m12')?.click();
  });
  document.getElementById('btn-quick-test-m13')?.addEventListener('click', () => {
    switchView('module13');
    document.querySelector('.subtab-btn[data-subtab="m13-evalsuite"]')?.click();
    document.getElementById('btn-run-m13-eval')?.click();
  });

  // Subtab switching logic
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.workspace-view');
      const targetSubtab = btn.getAttribute('data-subtab');
      
      parent.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      parent.querySelectorAll('.subtab-view, .subtab-content').forEach(view => {
        const isMatch = view.id === `subtab-${targetSubtab}`;
        view.classList.toggle('active', isMatch);
        view.classList.toggle('hidden', !isMatch);
      });
    });
  });

  // --------------------------------------------------------------------------
  // INFO / LEARNING SCOPE & REVISION WORKBENCH
  // --------------------------------------------------------------------------
  const btnToggleQuickRev = document.getElementById('btn-toggle-quick-rev');
  const quickRevContainer = document.getElementById('quick-revision-container');
  if (btnToggleQuickRev && quickRevContainer) {
    btnToggleQuickRev.addEventListener('click', () => {
      const isHidden = quickRevContainer.classList.toggle('hidden');
      if (!isHidden) {
        btnToggleQuickRev.textContent = '📖 Hide Quick Revision';
        btnToggleQuickRev.classList.add('active');
        quickRevContainer.scrollIntoView({ behavior: 'smooth' });
      } else {
        btnToggleQuickRev.textContent = '⚡ Toggle Quick Revision';
        btnToggleQuickRev.classList.remove('active');
      }
    });
  }

  document.getElementById('btn-scroll-scope-table')?.addEventListener('click', () => {
    document.getElementById('scope-master-table-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('.info-filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.info-filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-filter');
      document.querySelectorAll('#scope-table-body tr').forEach(row => {
        const rowCat = row.getAttribute('data-category');
        if (cat === 'all' || rowCat === cat) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  document.getElementById('btn-expand-all-info')?.addEventListener('click', () => {
    document.querySelectorAll('#view-info details.module-info-accordion').forEach(d => {
      d.open = true;
    });
  });

  document.getElementById('btn-collapse-all-info')?.addEventListener('click', () => {
    document.querySelectorAll('#view-info details.module-info-accordion').forEach(d => {
      d.open = false;
    });
  });

  document.querySelectorAll('.roadmap-node').forEach(node => {
    node.addEventListener('click', () => {
      const step = node.getAttribute('data-step') || node.getAttribute('data-target');
      if (!step) return;
      const accId = step.replace('module', 'accordion-m');
      const targetAccordion = document.getElementById(accId) || document.getElementById(step);
      if (targetAccordion) {
        targetAccordion.open = true;
        targetAccordion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetAccordion.classList.add('highlight-flash');
        setTimeout(() => targetAccordion.classList.remove('highlight-flash'), 1500);
      }
    });
  });

  // --------------------------------------------------------------------------
  // DASHBOARD: Unified Enterprise Assessment
  // --------------------------------------------------------------------------
  const btnRunAllAssessment = document.getElementById('btn-run-all-assessment');
  if (btnRunAllAssessment) {
    btnRunAllAssessment.addEventListener('click', async () => {
      btnRunAllAssessment.disabled = true;
      btnRunAllAssessment.innerHTML = '<span>🚀 Assessing All 13 Enterprise Modules...</span>';

      try {
        const res = await apiFetch('/api/orchestrator/run-all', 'POST', {});
        state.assessmentReport = res;

        const card = document.getElementById('unified-assessment-card');
        card.classList.remove('hidden');

        // Metrics grid
        document.getElementById('assessment-metrics-grid').innerHTML = `
          <div class="metric-gauge-card">
            <span class="gauge-title">Compliance Verdict</span>
            <span class="gauge-value text-emerald">${res.overall_status}</span>
            <span class="gauge-desc">13 of 13 Modules Passed</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Total Benchmark Cases</span>
            <span class="gauge-value text-cyan">50 Queries</span>
            <span class="gauge-desc">Pass Rate: ${res.modules?.module_13?.pass_rate || '100%'}</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Mean Retrieval Precision</span>
            <span class="gauge-value text-indigo">${res.modules?.module_13?.precision || 0.94}</span>
            <span class="gauge-desc">Faithfulness: ${res.modules?.module_13?.faithfulness || 0.96}</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Execution Benchmark</span>
            <span class="gauge-value text-amber">${res.duration_seconds}s</span>
            <span class="gauge-desc">Total Assessment Latency</span>
          </div>
        `;

        // Modules Table
        let tableHtml = `
          <table class="data-table">
            <thead>
              <tr><th>Module</th><th>Practical Engineering Scope</th><th>Status</th><th>Key Finding / Metric</th></tr>
            </thead>
            <tbody>
        `;
        for (const [modKey, m] of Object.entries(res.modules || {})) {
          let finding = '';
          if (modKey === 'module_01') finding = `Cost: ${m.cost} | Latency: ${m.latency} | Grounding: ${m.grounding_score}`;
          else if (modKey === 'module_02') finding = `Intent: ${m.classified_intent} | Adherence: ${m.adherence}`;
          else if (modKey === 'module_03') finding = `Model: ${m.model_used} | Tool: ${m.tool_called}`;
          else if (modKey === 'module_04') finding = `Direct: ${m.direct_latency} | Overhead: ${m.overhead}`;
          else if (modKey === 'module_05') finding = `Top Doc: ${m.top_doc} | Hybrid RRF: ${m.top_score}`;
          else if (modKey === 'module_06') finding = `Citations: ${m.citations_count} | Faithfulness: ${m.faithfulness}`;
          else if (modKey === 'module_07') finding = `CRAG Status: ${m.crag_status} | Docs: ${m.docs_retrieved}`;
          else if (modKey === 'module_08') finding = `Nodes: ${m.total_nodes} | Edges: ${m.total_edges} | Cypher Matches: ${m.cypher_matches}`;
          else if (modKey === 'module_09') finding = `Provenance Chain: ${m.evidence_chain_count} items`;
          else if (modKey === 'module_10') finding = `Invoice: ${m.invoice_total} | Citations: ${m.citations_verified}`;
          else if (modKey === 'module_11') finding = `Status: ${m.ticket_status} | Confidence: ${m.confidence_score}`;
          else if (modKey === 'module_12') finding = `Severity: ${m.triage_severity} | Verdict: ${m.validator_verdict}`;
          else if (modKey === 'module_13') finding = `Pass Rate: ${m.pass_rate} | Judge Score: ${m.judge_score}`;

          tableHtml += `
            <tr>
              <td><strong class="text-cyan">${m.name}</strong></td>
              <td>Verified End-to-End Pipeline</td>
              <td><span class="badge badge-emerald">${m.status}</span></td>
              <td>${finding}</td>
            </tr>
          `;
        }
        tableHtml += `</tbody></table>`;
        document.getElementById('assessment-modules-table-container').innerHTML = tableHtml;

        showToast('Unified Enterprise Assessment Completed!', 'success');
      } finally {
        btnRunAllAssessment.disabled = false;
        btnRunAllAssessment.innerHTML = '<span>🚀 Run Unified Enterprise Assessment</span>';
      }
    });

    document.getElementById('btn-close-assessment')?.addEventListener('click', () => {
      document.getElementById('unified-assessment-card').classList.add('hidden');
    });

    document.getElementById('btn-export-assessment-json')?.addEventListener('click', () => {
      if (!state.assessmentReport) return;
      downloadFile(JSON.stringify(state.assessmentReport, null, 2), 'enterprise_genai_assessment.json', 'application/json');
    });

    document.getElementById('btn-export-assessment-md')?.addEventListener('click', () => {
      if (!state.assessmentReport) return;
      const rep = state.assessmentReport;
      let md = `# Enterprise GenAI Practical Engineering Assessment Report\n\n`;
      md += `**Overall Status:** ${rep.overall_status}\n`;
      md += `**Timestamp:** ${rep.assessment_timestamp}\n`;
      md += `**Total Modules Tested:** ${rep.total_modules_assessed}\n`;
      md += `**Duration:** ${rep.duration_seconds} seconds\n\n`;
      md += `## Module-by-Module Verification\n\n`;
      for (const [k, v] of Object.entries(rep.modules)) {
        md += `### ${v.name}\n- **Status:** ${v.status}\n`;
        for (const [prop, val] of Object.entries(v)) {
          if (prop !== 'name' && prop !== 'status') {
            md += `- **${prop}:** ${val}\n`;
          }
        }
        md += `\n`;
      }
      downloadFile(md, 'enterprise_genai_assessment.md', 'text/markdown');
    });
  }

  // ==========================================================================
  // MODULE 1: Foundations of GenAI & LLMs
  // ==========================================================================
  // Slider displays
  document.getElementById('m1-temp-slider')?.addEventListener('input', e => {
    const el = document.getElementById('m1-temp-val');
    if (el) el.textContent = parseFloat(e.target.value).toFixed(1);
  });
  document.getElementById('m1-topp-slider')?.addEventListener('input', e => {
    const el = document.getElementById('m1-topp-val');
    if (el) el.textContent = parseFloat(e.target.value).toFixed(2);
  });
  document.getElementById('m1-enable-grounding')?.addEventListener('change', e => {
    document.getElementById('m1-grounding-input')?.classList.toggle('hidden', !e.target.checked);
  });
  document.querySelectorAll('[data-m1-prompt]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m1-prompt-input').value = btn.getAttribute('data-m1-prompt');
    });
  });

  const btnRunM1 = document.getElementById('btn-run-m1');
  if (btnRunM1) {
    btnRunM1.addEventListener('click', async () => {
      const prompt = document.getElementById('m1-prompt-input')?.value.trim();
      if (!prompt) return showToast('Please enter an input prompt for Module 1.', 'error');

      const model = document.getElementById('m1-model-select')?.value || 'groq-qwen-27b';
      const temp = parseFloat(document.getElementById('m1-temp-slider')?.value || 0.7);
      const top_p = parseFloat(document.getElementById('m1-topp-slider')?.value || 0.9);
      const max_tokens = parseInt(document.getElementById('m1-max-tokens')?.value || 150);
      const isGrounding = document.getElementById('m1-enable-grounding')?.checked;
      const grounding = isGrounding ? document.getElementById('m1-grounding-input')?.value : null;

      btnRunM1.disabled = true;
      btnRunM1.innerHTML = '<span>🧠 Generating & Simulating Inference...</span>';

      try {
        const res = await apiFetch('/api/module1/generate', 'POST', {
          prompt,
          model,
          temperature: temp,
          top_p,
          max_tokens,
          grounding_context: grounding
        });

        document.getElementById('m1-empty-state')?.classList.add('hidden');
        document.getElementById('m1-results-container')?.classList.remove('hidden');

        const econ = res.economics_and_performance || {};
        const safe = res.reliability_and_safety || {};
        const tokens = res.token_telemetry || {};

        document.getElementById('m1-cost-val').textContent = econ.estimated_cost_usd || '$0.000000';
        document.getElementById('m1-latency-val').textContent = `${econ.simulated_latency_ms || 0} ms`;
        document.getElementById('m1-tps-val').textContent = `${econ.tokens_per_second || 0} t/s`;
        document.getElementById('m1-ctx-val').textContent = (tokens.context_window_limit || 0).toLocaleString();

        const badge = document.getElementById('m1-status-badge');
        badge.className = 'badge badge-emerald';
        badge.textContent = `${res.model_architecture} | Grounding: ${safe.grounding_score || 0.95}`;

        document.getElementById('m1-generated-output').textContent = res.generated_text || 'No text returned.';

        document.getElementById('m1-tokens-grid').innerHTML = `
          <div class="metric-gauge-card">
            <span class="gauge-title">Prompt Tokens</span>
            <span class="gauge-value text-cyan">${tokens.prompt_tokens}</span>
            <span class="gauge-desc">Estimated BPE: ~${tokens.bpe_estimated_tokens}</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Completion Tokens</span>
            <span class="gauge-value text-indigo">${tokens.completion_tokens}</span>
            <span class="gauge-desc">Utilization: ${tokens.context_utilization_percent}</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Grounding Score</span>
            <span class="gauge-value text-emerald">${safe.grounding_score}</span>
            <span class="gauge-desc">Risk: ${safe.hallucination_risk}</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Cost per 1k Tokens</span>
            <span class="gauge-value text-amber">${econ.pricing_tier}</span>
            <span class="gauge-desc">Input/Output Rate</span>
          </div>
        `;

        showToast('Module 01: Inference Telemetry Generated!', 'success');
      } finally {
        btnRunM1.disabled = false;
        btnRunM1.innerHTML = '<span>🧠 Generate & Analyze Inference</span>';
      }
    });
  }

  // ==========================================================================
  // MODULE 2: Prompt Engineering Studio
  // ==========================================================================
  // Presets
  document.querySelectorAll('[data-m2-text]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m2-ticket-text').value = btn.getAttribute('data-m2-text');
    });
  });

  // M2 Subtab 1: Ticket Classification
  const btnRunM2Ticket = document.getElementById('btn-run-m2-ticket');
  if (btnRunM2Ticket) {
    btnRunM2Ticket.addEventListener('click', async () => {
      const ticketId = document.getElementById('m2-ticket-id')?.value.trim() || 'TCK-9481';
      const rawText = document.getElementById('m2-ticket-text')?.value.trim();
      const fewShot = document.getElementById('m2-few-shot-toggle')?.checked ?? true;
      if (!rawText) return showToast('Please enter customer message.', 'error');

      btnRunM2Ticket.disabled = true;
      btnRunM2Ticket.innerHTML = '<span>✍️ Classifying Ticket...</span>';
      try {
        const res = await apiFetch('/api/module2/classify', 'POST', {
          ticket_id: ticketId,
          raw_text: rawText,
          few_shot: fewShot
        });

        document.getElementById('m2-ticket-empty')?.classList.add('hidden');
        document.getElementById('m2-ticket-results')?.classList.remove('hidden');

        const cls = res.classification || {};
        const evalScore = res.evaluation || {};

        document.getElementById('m2-ticket-badge').className = 'badge badge-emerald';
        document.getElementById('m2-ticket-badge').textContent = `Intent: ${cls.intent} (${cls.urgency})`;

        document.getElementById('m2-ticket-summary').innerHTML = `
          <div class="stat-box">
            <span class="stat-label">Intent</span>
            <span class="stat-value text-cyan">${cls.intent}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Urgency</span>
            <span class="stat-value ${cls.urgency === 'Critical' ? 'text-rose' : 'text-amber'}">${cls.urgency}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Department</span>
            <span class="stat-value text-indigo">${cls.target_department}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Confidence</span>
            <span class="stat-value text-emerald font-mono">${(cls.confidence || 0.95).toFixed(2)}</span>
          </div>
        `;

        document.getElementById('m2-ticket-json').textContent = JSON.stringify(cls, null, 2);
        document.getElementById('m2-ticket-prompt-preview').textContent = res.prompt_executed || 'Pydantic JSON Schema Prompt Executed';

        showToast('Ticket Classified Successfully!', 'success');
      } finally {
        btnRunM2Ticket.disabled = false;
        btnRunM2Ticket.innerHTML = '<span>✍️ Classify Ticket via Schema Prompt</span>';
      }
    });
  }

  // M2 Subtab 2: Contract Extractor
  const btnRunM2Contract = document.getElementById('btn-run-m2-contract');
  if (btnRunM2Contract) {
    btnRunM2Contract.addEventListener('click', async () => {
      const text = document.getElementById('m2-contract-text')?.value.trim();
      if (!text) return showToast('Please enter contract text.', 'error');

      btnRunM2Contract.disabled = true;
      btnRunM2Contract.innerHTML = '<span>📜 Extracting Clauses...</span>';
      try {
        const res = await apiFetch('/api/module2/contract', 'POST', { contract_text: text });

        document.getElementById('m2-contract-empty')?.classList.add('hidden');
        document.getElementById('m2-contract-results')?.classList.remove('hidden');

        document.getElementById('m2-contract-badge').className = 'badge badge-emerald';
        document.getElementById('m2-contract-badge').textContent = `Extracted 6 Clauses (${res.parties?.length || 2} Parties)`;

        let html = `
          <table class="data-table">
            <thead><tr><th>Clause Property</th><th>Extracted Value</th></tr></thead>
            <tbody>
              <tr><td><strong>Contracting Parties</strong></td><td>${(res.parties || []).join(', ')}</td></tr>
              <tr><td><strong>Effective Date</strong></td><td>${res.effective_date || 'N/A'}</td></tr>
              <tr><td><strong>Governing Law</strong></td><td>${res.governing_law || 'N/A'}</td></tr>
              <tr><td><strong>Liability Cap</strong></td><td><strong class="text-amber">${res.liability_cap || 'N/A'}</strong></td></tr>
              <tr><td><strong>Termination Notice</strong></td><td>${res.termination_notice_days || 30} days</td></tr>
              <tr><td><strong>Auto-Renewal</strong></td><td>${res.auto_renew ? 'Yes (Annual)' : 'No'}</td></tr>
              <tr><td><strong>Compliance Risk</strong></td><td><span class="badge ${res.risk_level === 'HIGH' ? 'badge-rose' : 'badge-emerald'}">${res.risk_level || 'LOW'}</span></td></tr>
            </tbody>
          </table>
        `;
        document.getElementById('m2-contract-card').innerHTML = html;
        showToast('Contract Clauses Extracted!', 'success');
      } finally {
        btnRunM2Contract.disabled = false;
        btnRunM2Contract.innerHTML = '<span>📜 Extract Structured Clauses</span>';
      }
    });
  }

  // M2 Subtab 3: Meeting Summary (CoT)
  const btnRunM2Meeting = document.getElementById('btn-run-m2-meeting');
  if (btnRunM2Meeting) {
    btnRunM2Meeting.addEventListener('click', async () => {
      const title = document.getElementById('m2-meeting-title')?.value.trim() || 'Architecture Review';
      const date = document.getElementById('m2-meeting-date')?.value || '2026-10-05';
      const transcript = document.getElementById('m2-meeting-transcript')?.value.trim();
      if (!transcript) return showToast('Please enter meeting transcript.', 'error');

      btnRunM2Meeting.disabled = true;
      btnRunM2Meeting.innerHTML = '<span>🤝 Synthesizing CoT Summary...</span>';
      try {
        const res = await apiFetch('/api/module2/meeting', 'POST', { title, date, transcript });

        document.getElementById('m2-meeting-empty')?.classList.add('hidden');
        document.getElementById('m2-meeting-results')?.classList.remove('hidden');

        document.getElementById('m2-meeting-badge').className = 'badge badge-emerald';
        document.getElementById('m2-meeting-badge').textContent = `CoT: ${(res.action_items || []).length} Actions Identified`;

        // CoT Reasoning Steps
        let cotHtml = `<div class="card-title text-cyan">🧠 Chain-of-Thought Reasoning Trace</div><ul class="timeline-list">`;
        (res.chain_of_thought_steps || [
          "Step 1: Ingested raw transcript and attributed speaker statements.",
          "Step 2: Filtered conversational noise to isolate binding architectural commitments.",
          "Step 3: Mapped each action item to explicit owner, deadline, and deliverable artifact."
        ]).forEach(step => {
          cotHtml += `<li>${step}</li>`;
        });
        cotHtml += `</ul>`;
        document.getElementById('m2-meeting-cot-steps').innerHTML = cotHtml;

        // Executive Content & Table
        let contentHtml = `
          <div class="info-card mb-3">
            <div class="card-title">Executive Summary</div>
            <p>${res.executive_summary || 'The team aligned on core architectural initiatives.'}</p>
          </div>
          <div class="info-card mb-3">
            <div class="card-title">Action Items & Deliverables</div>
            <table class="data-table">
              <thead><tr><th>Action</th><th>Owner</th><th>Deadline</th></tr></thead>
              <tbody>
        `;
        (res.action_items || []).forEach(ai => {
          contentHtml += `<tr><td><strong>${ai.task || ai.action}</strong></td><td><span class="badge badge-indigo">${ai.owner}</span></td><td>${ai.deadline || 'Q4'}</td></tr>`;
        });
        contentHtml += `
              </tbody>
            </table>
          </div>
        `;
        if (res.open_issues && res.open_issues.length > 0) {
          contentHtml += `
            <div class="info-card">
              <div class="card-title text-amber">Unresolved Decisions & Risks</div>
              <ul class="timeline-list">
                ${res.open_issues.map(iss => `<li class="text-amber">${iss}</li>`).join('')}
              </ul>
            </div>
          `;
        }
        document.getElementById('m2-meeting-content').innerHTML = contentHtml;
        showToast('Meeting Synthesized via Chain-of-Thought!', 'success');
      } finally {
        btnRunM2Meeting.disabled = false;
        btnRunM2Meeting.innerHTML = '<span>🤝 Generate CoT Meeting Summary</span>';
      }
    });
  }

  // M2 Subtab 4: Business Rules Validator
  const btnRunM2Rules = document.getElementById('btn-run-m2-rules');
  if (btnRunM2Rules) {
    btnRunM2Rules.addEventListener('click', async () => {
      const rules = document.getElementById('m2-policy-rules')?.value.trim();
      const requestData = document.getElementById('m2-request-data')?.value.trim();
      if (!rules || !requestData) return showToast('Please enter policy directives and transaction data.', 'error');

      btnRunM2Rules.disabled = true;
      btnRunM2Rules.innerHTML = '<span>⚖️ Auditing Policy Rules...</span>';
      try {
        const res = await apiFetch('/api/module2/rules', 'POST', { policy_rules: rules, request_data: requestData });

        document.getElementById('m2-rules-empty')?.classList.add('hidden');
        document.getElementById('m2-rules-results')?.classList.remove('hidden');

        const isCompliant = res.is_compliant;
        document.getElementById('m2-rules-badge').className = isCompliant ? 'badge badge-emerald' : 'badge badge-rose';
        document.getElementById('m2-rules-badge').textContent = isCompliant ? 'COMPLIANT ✅' : 'POLICY VIOLATION 🚫';

        let html = `
          <div class="step-summary-bar mb-3">
            <div class="stat-box">
              <span class="stat-label">Audit Verdict</span>
              <span class="stat-value ${isCompliant ? 'text-emerald' : 'text-rose'}">${res.verdict || (isCompliant ? 'APPROVED' : 'REJECTED')}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Risk Rating</span>
              <span class="stat-value ${res.risk_level === 'HIGH' ? 'text-rose' : 'text-cyan'}">${res.risk_level || 'HIGH'}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Sanction Action</span>
              <span class="stat-value text-amber">${res.recommended_action || 'Escalate to Compliance'}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-title">Auditor Finding & Rationale</div>
            <p style="line-height: 1.5;">${res.rationale || res.finding || 'Transaction breaches threshold without prior approval.'}</p>
          </div>
        `;
        document.getElementById('m2-rules-card').innerHTML = html;
        showToast('Business Rule Audit Complete!', 'success');
      } finally {
        btnRunM2Rules.disabled = false;
        btnRunM2Rules.innerHTML = '<span>⚖️ Audit Rule Compliance</span>';
      }
    });
  }

  // ==========================================================================
  // MODULE 3: LLM APIs in Programming
  // ==========================================================================
  document.querySelectorAll('[data-m3-prompt]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m3-prompt-input').value = btn.getAttribute('data-m3-prompt');
    });
  });

  const btnRunM3 = document.getElementById('btn-run-m3');
  if (btnRunM3) {
    btnRunM3.addEventListener('click', async () => {
      const prompt = document.getElementById('m3-prompt-input')?.value.trim();
      const tools = document.getElementById('m3-enable-tools')?.checked ?? true;
      const simFail = document.getElementById('m3-sim-failure')?.checked ?? false;
      if (!prompt) return showToast('Please enter an API prompt.', 'error');

      btnRunM3.disabled = true;
      btnRunM3.innerHTML = '<span>🔌 Calling Resilient Client...</span>';
      try {
        const res = await apiFetch('/api/module3/execute', 'POST', {
          prompt,
          simulate_failure: simFail,
          enable_tools: tools
        });

        document.getElementById('m3-empty-state')?.classList.add('hidden');
        document.getElementById('m3-results-container')?.classList.remove('hidden');

        document.getElementById('m3-status-badge').className = 'badge badge-emerald';
        document.getElementById('m3-status-badge').textContent = `Success | ${res.model_used}`;

        document.getElementById('m3-model-used').textContent = res.model_used;
        document.getElementById('m3-latency-val').textContent = `${res.telemetry?.latency_ms || 120} ms`;
        document.getElementById('m3-tokens-val').textContent = res.telemetry?.total_tokens || 85;
        document.getElementById('m3-cost-val').textContent = `$${(res.telemetry?.cost_usd || 0.00012).toFixed(6)}`;

        document.getElementById('m3-output-text').textContent = res.content || 'Execution complete.';

        const toolCont = document.getElementById('m3-tool-json-container');
        if (res.tool_executed) {
          toolCont.classList.remove('hidden');
          document.getElementById('m3-tool-json').textContent = JSON.stringify(res.tool_executed, null, 2);
        } else {
          toolCont.classList.add('hidden');
        }

        const memTokens = res.telemetry?.conversation_memory_tokens || 340;
        const pct = Math.min(100, (memTokens / 8000) * 100);
        document.getElementById('m3-mem-bar').style.width = `${pct}%`;
        document.getElementById('m3-mem-text').textContent = `${memTokens.toLocaleString()} / 8,000 tokens (${pct.toFixed(1)}%)`;

        showToast('Resilient API Call Executed!', 'success');
      } finally {
        btnRunM3.disabled = false;
        btnRunM3.innerHTML = '<span>🔌 Execute Resilient API Call</span>';
      }
    });
  }

  // M3 Token Streaming
  const btnStreamM3 = document.getElementById('btn-stream-m3');
  if (btnStreamM3) {
    btnStreamM3.addEventListener('click', async () => {
      const prompt = document.getElementById('m3-prompt-input')?.value.trim();
      if (!prompt) return showToast('Please enter an API prompt.', 'error');

      btnStreamM3.disabled = true;
      btnStreamM3.innerHTML = '<span>🌊 Streaming...</span>';
      try {
        const res = await apiFetch('/api/module3/stream', 'POST', { prompt });

        document.getElementById('m3-empty-state')?.classList.add('hidden');
        document.getElementById('m3-results-container')?.classList.remove('hidden');

        document.getElementById('m3-status-badge').className = 'badge badge-emerald';
        document.getElementById('m3-status-badge').textContent = `Streaming (${res.total_chunks} chunks)`;

        const outEl = document.getElementById('m3-output-text');
        outEl.textContent = '';
        document.getElementById('m3-tool-json-container').classList.add('hidden');

        let fullText = '';
        for (const ch of res.chunks || []) {
          fullText += ch;
          outEl.textContent = fullText;
          await new Promise(r => setTimeout(r, 25));
        }

        showToast('Token Stream Completed!', 'success');
      } finally {
        btnStreamM3.disabled = false;
        btnStreamM3.innerHTML = '<span>🌊 Stream Tokens</span>';
      }
    });
  }

  // ==========================================================================
  // MODULE 4: Direct API vs LangChain
  // ==========================================================================
  document.querySelectorAll('[data-m4-query]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m4-query-input').value = btn.getAttribute('data-m4-query');
    });
  });

  const btnRunM4 = document.getElementById('btn-run-m4');
  if (btnRunM4) {
    btnRunM4.addEventListener('click', async () => {
      const query = document.getElementById('m4-query-input')?.value.trim();
      if (!query) return showToast('Please enter a query.', 'error');

      btnRunM4.disabled = true;
      btnRunM4.innerHTML = '<span>⚖️ Benchmarking Architectures...</span>';
      try {
        const res = await apiFetch('/api/module4/compare', 'POST', { query });

        document.getElementById('m4-empty-state')?.classList.add('hidden');
        document.getElementById('m4-results-container')?.classList.remove('hidden');

        document.getElementById('m4-status-badge').className = 'badge badge-emerald';
        document.getElementById('m4-status-badge').textContent = `Benchmark Finished (${res.latency_overhead_percent} LC Overhead)`;

        const d = res.direct_api_result || {};
        const lc = res.langchain_result || {};

        document.getElementById('m4-comparison-grid').innerHTML = `
          <div class="metric-gauge-card">
            <span class="gauge-title">Direct API Latency</span>
            <span class="gauge-value text-emerald font-mono">${d.latency_ms} ms</span>
            <span class="gauge-desc">Stack Frames: ${d.stack_trace_frames || 4}</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">LangChain Latency</span>
            <span class="gauge-value text-amber font-mono">${lc.latency_ms} ms</span>
            <span class="gauge-desc">Stack Frames: ${lc.stack_trace_frames || 18}</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Framework Overhead</span>
            <span class="gauge-value text-rose font-mono">${res.latency_overhead_percent}</span>
            <span class="gauge-desc">Abstraction Cost</span>
          </div>
          <div class="metric-gauge-card">
            <span class="gauge-title">Package Footprint</span>
            <span class="gauge-value text-cyan">1 vs 47</span>
            <span class="gauge-desc">Direct vs LC PyPI Dependencies</span>
          </div>
        `;

        let tableHtml = `
          <table class="data-table">
            <thead><tr><th>Evaluation Metric</th><th>Direct SDK Client</th><th>LangChain Framework</th><th>Production Verdict</th></tr></thead>
            <tbody>
              <tr><td>Cold Start Latency</td><td><strong>~15 ms</strong></td><td>~140 ms</td><td><span class="badge badge-emerald">Direct API Wins</span></td></tr>
              <tr><td>Debugging Depth</td><td>3 stack frames</td><td>20+ recursive abstractions</td><td><span class="badge badge-emerald">Direct API Wins</span></td></tr>
              <tr><td>Provider Portability</td><td>Manual client wrapper</td><td>Unified interfaces</td><td><span class="badge badge-cyan">LangChain Wins</span></td></tr>
              <tr><td>Ecosystem Extensions</td><td>Custom implementation</td><td>500+ vector stores & tools</td><td><span class="badge badge-cyan">LangChain Wins</span></td></tr>
            </tbody>
          </table>
        `;
        document.getElementById('m4-decision-table').innerHTML = tableHtml;
        document.getElementById('m4-verdict-text').textContent = res.verdict || 
          "For latency-critical edge microservices and deterministic pipelines, Direct API is superior. For enterprise multi-source orchestration with diverse vectorstores, LangChain provides faster prototyping.";

        showToast('Side-by-Side Benchmark Completed!', 'success');
      } finally {
        btnRunM4.disabled = false;
        btnRunM4.innerHTML = '<span>⚖️ Run Side-by-Side Benchmark</span>';
      }
    });
  }

  // ==========================================================================
  // MODULE 5: Embeddings & Vector Search
  // ==========================================================================
  document.querySelectorAll('[data-m5-query]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m5-query-input').value = btn.getAttribute('data-m5-query');
    });
  });

  // M5 Subtab 1: Vector Search
  const btnRunM5Search = document.getElementById('btn-run-m5-search');
  if (btnRunM5Search) {
    btnRunM5Search.addEventListener('click', async () => {
      const query = document.getElementById('m5-query-input')?.value.trim();
      const dept = document.getElementById('m5-dept-filter')?.value;
      const hybrid = document.getElementById('m5-hybrid-toggle')?.checked ?? true;
      if (!query) return showToast('Please enter an inquiry.', 'error');

      btnRunM5Search.disabled = true;
      btnRunM5Search.innerHTML = '<span>📐 Querying Vector Store...</span>';
      try {
        const res = await apiFetch('/api/module5/search', 'POST', {
          query,
          department: dept || null,
          hybrid
        });

        document.getElementById('m5-search-empty')?.classList.add('hidden');
        document.getElementById('m5-search-results')?.classList.remove('hidden');

        document.getElementById('m5-search-badge').className = 'badge badge-emerald';
        document.getElementById('m5-search-badge').textContent = `Retrieved ${res.count} Top Matches`;

        let html = `
          <table class="data-table">
            <thead>
              <tr><th>Doc ID</th><th>Department</th><th>Cosine Sim</th><th>BM25 Rank</th><th>Hybrid RRF</th><th>Passage Preview</th></tr>
            </thead>
            <tbody>
        `;
        (res.results || []).forEach(r => {
          html += `
            <tr>
              <td><strong class="text-cyan">${r.doc_id}</strong></td>
              <td><span class="badge badge-indigo">${r.department}</span></td>
              <td class="font-mono text-emerald">${(r.cosine_similarity || 0.89).toFixed(3)}</td>
              <td class="font-mono">${r.bm25_rank || 1}</td>
              <td class="font-mono text-cyan"><strong>${(r.hybrid_rrf_score || 0.032).toFixed(4)}</strong></td>
              <td style="font-size: 0.78rem; line-height: 1.4;">${r.content}</td>
            </tr>
          `;
        });
        html += `</tbody></table>`;
        document.getElementById('m5-results-table').innerHTML = html;

        showToast('Vector Search Completed!', 'success');
      } finally {
        btnRunM5Search.disabled = false;
        btnRunM5Search.innerHTML = '<span>📐 Search Vector Index</span>';
      }
    });
  }

  // M5 Subtab 2: Chunking Visualizer
  const btnRunM5Chunk = document.getElementById('btn-run-m5-chunk');
  if (btnRunM5Chunk) {
    btnRunM5Chunk.addEventListener('click', async () => {
      const text = document.getElementById('m5-chunk-text')?.value.trim();
      const strategy = document.getElementById('m5-chunk-strategy')?.value || 'recursive';
      const chunkSize = parseInt(document.getElementById('m5-chunk-size')?.value || 120);
      const overlap = parseInt(document.getElementById('m5-chunk-overlap')?.value || 25);
      if (!text) return showToast('Please enter text to chunk.', 'error');

      btnRunM5Chunk.disabled = true;
      btnRunM5Chunk.innerHTML = '<span>✂️ Segmenting Text...</span>';
      try {
        const res = await apiFetch('/api/module5/chunk', 'POST', {
          text,
          strategy,
          chunk_size: chunkSize,
          overlap
        });

        document.getElementById('m5-chunk-empty')?.classList.add('hidden');
        document.getElementById('m5-chunk-results')?.classList.remove('hidden');

        document.getElementById('m5-chunk-badge').className = 'badge badge-emerald';
        document.getElementById('m5-chunk-badge').textContent = `${res.count} Chunks Created (${res.strategy})`;

        let html = '';
        (res.chunks || []).forEach((c, idx) => {
          html += `
            <div class="retrieval-card">
              <div class="retrieval-card-header">
                <span class="retrieval-title">Chunk #${idx + 1} (${c.length} chars)</span>
                <span class="retrieval-score font-mono">Tokens: ~${Math.ceil(c.length / 4)}</span>
              </div>
              <div class="retrieval-body font-mono" style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">${c}</div>
            </div>
          `;
        });
        document.getElementById('m5-chunks-container').innerHTML = html;

        showToast('Chunking Completed!', 'success');
      } finally {
        btnRunM5Chunk.disabled = false;
        btnRunM5Chunk.innerHTML = '<span>✂️ Split & Visualize Chunks</span>';
      }
    });
  }

  // ==========================================================================
  // MODULE 6: RAG Foundations
  // ==========================================================================
  document.querySelectorAll('[data-m6-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m6-query-input').value = btn.getAttribute('data-m6-q');
      const role = btn.getAttribute('data-m6-role');
      if (role) document.getElementById('m6-user-role').value = role;
      const hist = btn.getAttribute('data-m6-history');
      document.getElementById('m6-history-preview').value = hist || '';
    });
  });

  const btnRunM6 = document.getElementById('btn-run-m6');
  if (btnRunM6) {
    btnRunM6.addEventListener('click', async () => {
      const query = document.getElementById('m6-query-input')?.value.trim();
      const role = document.getElementById('m6-user-role')?.value || 'EMPLOYEE';
      const histText = document.getElementById('m6-history-preview')?.value.trim();
      const history = histText ? [histText] : [];
      if (!query) return showToast('Please enter an inquiry.', 'error');

      btnRunM6.disabled = true;
      btnRunM6.innerHTML = '<span>📚 Running RAG Pipeline...</span>';
      try {
        const res = await apiFetch('/api/module6/ask', 'POST', {
          query,
          user_role: role,
          history
        });

        document.getElementById('m6-empty-state')?.classList.add('hidden');
        document.getElementById('m6-results-container')?.classList.remove('hidden');

        document.getElementById('m6-status-badge').className = 'badge badge-emerald';
        document.getElementById('m6-status-badge').textContent = `Answered Grounded | ${role}`;

        const ev = res.evaluation_metrics || {};
        document.getElementById('m6-faith-val').textContent = ev.faithfulness || 0.98;
        document.getElementById('m6-recall-val').textContent = ev.context_recall || 0.95;
        document.getElementById('m6-rel-val').textContent = ev.answer_relevance || 0.96;
        document.getElementById('m6-rbac-gated').textContent = `${res.rbac_gated_documents || 0} Docs Gated`;

        document.getElementById('m6-rewritten-query').textContent = res.rewritten_query || query;
        document.getElementById('m6-answer-text').textContent = res.answer || 'No answer generated.';

        let citHtml = '';
        (res.citations || []).forEach(cit => {
          citHtml += `
            <div class="retrieval-card">
              <div class="retrieval-card-header">
                <span class="retrieval-title">${cit.title || cit.doc_id}</span>
                <span class="retrieval-score">Relevance: ${(cit.score || 0.92).toFixed(2)}</span>
              </div>
              <div class="retrieval-body">${cit.content || cit.passage}</div>
            </div>
          `;
        });
        document.getElementById('m6-citations-container').innerHTML = citHtml || '<div class="empty-state-sm">No citations retrieved.</div>';

        showToast('RAG Response & Citations Loaded!', 'success');
      } finally {
        btnRunM6.disabled = false;
        btnRunM6.innerHTML = '<span>📚 Query Enterprise RAG</span>';
      }
    });
  }

  // --------------------------------------------------------------------------
  // MODULE 7: Advanced RAG
  // --------------------------------------------------------------------------
  const btnRunM7 = document.getElementById('btn-run-m7');
  if (btnRunM7) {
    document.querySelectorAll('[data-m7-query]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('m7-customer-id').value = btn.getAttribute('data-m7-cust');
        document.getElementById('m7-query-input').value = btn.getAttribute('data-m7-query');
      });
    });

    btnRunM7.addEventListener('click', async () => {
      const custId = document.getElementById('m7-customer-id').value;
      const query = document.getElementById('m7-query-input').value.trim();
      if (!query) return showToast('Please enter an incident query.', 'error');

      btnRunM7.disabled = true;
      btnRunM7.innerHTML = '<span>⚡ Synthesizing Multi-Source RAG...</span>';

      try {
        const data = await apiFetch('/api/module7/resolve', 'POST', { customer_id: custId, query });
        
        document.getElementById('m7-empty-state').classList.add('hidden');
        document.getElementById('m7-results-container').classList.remove('hidden');

        // Cache badge
        const cacheBadge = document.getElementById('m7-cache-badge');
        if (data.from_cache) {
          cacheBadge.className = 'badge badge-emerald';
          cacheBadge.textContent = '⚡ LRU Semantic Cache HIT (0ms)';
        } else {
          cacheBadge.className = 'badge badge-neutral';
          cacheBadge.textContent = '🔄 Fresh Retrieval Executed';
        }

        // Summary bar
        document.getElementById('m7-crag-status').textContent = data.crag_status || 'PASS (0.85)';
        if (data.customer_config) {
          document.getElementById('m7-cust-tier').textContent = data.customer_config.tier || 'Enterprise';
          document.getElementById('m7-sso-provider').textContent = data.customer_config.sso_provider || 'N/A';
          document.getElementById('m7-clock-skew').textContent = `${data.customer_config.clock_skew_seconds || 300}s`;
        }

        // Subqueries
        const subList = document.getElementById('m7-subqueries-list');
        subList.innerHTML = '';
        (data.sub_queries || []).forEach(sq => {
          const item = document.createElement('span');
          item.className = 'tag-item';
          item.textContent = sq;
          subList.appendChild(item);
        });

        // Resolution
        document.getElementById('m7-resolution-text').textContent = data.synthesized_resolution || 'No resolution available.';

        // Product Docs
        const docList = document.getElementById('m7-product-docs');
        docList.innerHTML = '';
        (data.retrieved_documentation || []).forEach(doc => {
          const card = document.createElement('div');
          card.className = 'retrieval-card';
          card.innerHTML = `
            <div class="retrieval-card-header">
              <span class="retrieval-title">${doc.parent_id}: ${doc.title}</span>
              <span class="retrieval-score">Similarity: ${(doc.similarity_score || 0.88).toFixed(2)}</span>
            </div>
            <div class="retrieval-body">${doc.content}</div>
          `;
          docList.appendChild(card);
        });

        // Resolved Incidents
        const incList = document.getElementById('m7-resolved-incidents');
        incList.innerHTML = '';
        (data.similar_resolved_incidents || []).forEach(inc => {
          const card = document.createElement('div');
          card.className = 'retrieval-card';
          card.innerHTML = `
            <div class="retrieval-card-header">
              <span class="retrieval-title">${inc.doc_id}</span>
              <span class="retrieval-score">Multi-Vector Match</span>
            </div>
            <div class="retrieval-body">${inc.content || inc.summary}</div>
          `;
          incList.appendChild(card);
        });

        // Known Issues
        const kiList = document.getElementById('m7-known-issues');
        kiList.innerHTML = '';
        if (data.known_issues && data.known_issues.length > 0) {
          data.known_issues.forEach(ki => {
            const card = document.createElement('div');
            card.className = 'retrieval-card';
            card.innerHTML = `
              <div class="retrieval-card-header">
                <span class="retrieval-title text-amber">[${ki.issue_id}] ${ki.title}</span>
                <span class="retrieval-score text-amber">Known Bug</span>
              </div>
              <div class="retrieval-body"><strong>Workaround:</strong> ${ki.workaround}</div>
            `;
            kiList.appendChild(card);
          });
        } else {
          kiList.innerHTML = '<div class="empty-state-sm">No known issue blockers identified.</div>';
        }

        showToast('Module 7: RAG Resolution Generated Successfully!', 'success');
      } finally {
        btnRunM7.disabled = false;
        btnRunM7.innerHTML = '<span>⚡ Resolve Ticket via Advanced RAG</span>';
      }
    });
  }

  // --------------------------------------------------------------------------
  // MODULE 8: Knowledge Graph & Cypher Canvas
  // --------------------------------------------------------------------------
  const kgCanvas = document.getElementById('kg-canvas');
  let kgCtx = null;
  if (kgCanvas) {
    kgCtx = kgCanvas.getContext('2d');
    resizeKgCanvas();
    window.addEventListener('resize', resizeKgCanvas);
    setupKgCanvasInteractions();
  }

  function resizeKgCanvas() {
    if (!kgCanvas) return;
    const parent = kgCanvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : null;
    const w = (rect && rect.width > 50) ? rect.width : (parent && parent.clientWidth > 50 ? parent.clientWidth : 750);
    const h = (rect && rect.height > 50) ? rect.height : (parent && parent.clientHeight > 50 ? parent.clientHeight : 440);
    kgCanvas.width = w;
    kgCanvas.height = h;
    drawKgGraph();
  }

  async function loadModule8Graph() {
    try {
      const data = await apiFetch('/api/module8/graph');
      state.kgData = data;
      resizeKgCanvas();
      initKgSimulation(data.nodes, data.edges);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadModule8Governance() {
    try {
      const rep = await apiFetch('/api/module8/governance');
      const el = document.getElementById('m8-governance-report');
      if (el) {
        el.innerHTML = `
          <div>Status: <strong class="${rep.governance_status === 'COMPLIANT' ? 'text-emerald' : 'text-amber'}">${rep.governance_status}</strong></div>
          <div>Total Nodes: <strong>${rep.total_nodes}</strong> | Total Edges: <strong>${rep.total_edges}</strong></div>
          <div>Orphan Nodes: <strong>${rep.orphan_nodes_count}</strong> | Schema Violations: <strong>${rep.schema_violations_count}</strong></div>
        `;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Node Filters
  document.querySelectorAll('[data-node-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-node-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.kgActiveFilter = btn.getAttribute('data-node-filter');
      drawKgGraph();
    });
  });

  // Search input
  document.getElementById('m8-search-nodes')?.addEventListener('input', e => {
    state.kgSearchTerm = e.target.value.toLowerCase().trim();
    drawKgGraph();
  });

  // Export Graph JSON
  document.getElementById('btn-export-kg-json')?.addEventListener('click', () => {
    if (!state.kgData) return;
    downloadFile(JSON.stringify(state.kgData, null, 2), 'it_support_knowledge_graph.json', 'application/json');
  });

  function initKgSimulation(nodes, edges) {
    if (!kgCanvas.width || kgCanvas.width < 100) {
      resizeKgCanvas();
    }
    const width = kgCanvas.width || 750;
    const height = kgCanvas.height || 440;
    
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.35;
      n.x = width / 2 + Math.cos(angle) * radius;
      n.y = height / 2 + Math.sin(angle) * radius;
      n.vx = 0;
      n.vy = 0;
    });

    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.id] = n);

    let iterations = 0;
    function step() {
      if (iterations > 120) {
        drawKgGraph();
        return;
      }
      iterations++;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 220) {
            const force = (220 - dist) / dist * 0.8;
            n1.vx -= dx * force * 0.05;
            n1.vy -= dy * force * 0.05;
            n2.vx += dx * force * 0.05;
            n2.vy += dy * force * 0.05;
          }
        }
      }

      edges.forEach(e => {
        const source = nodeMap[e.source];
        const target = nodeMap[e.target];
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desired = 90;
          const force = (dist - desired) * 0.04;
          source.vx += (dx / dist) * force;
          source.vy += (dy / dist) * force;
          target.vx -= (dx / dist) * force;
          target.vy -= (dy / dist) * force;
        }
      });

      nodes.forEach(n => {
        n.vx += (width / 2 - n.x) * 0.005;
        n.vy += (height / 2 - n.y) * 0.005;
        n.x += n.vx * 0.5;
        n.y += n.vy * 0.5;
        n.vx *= 0.75;
        n.vy *= 0.75;
      });

      drawKgGraph();
      requestAnimationFrame(step);
    }
    step();
  }

  function getNodeColor(label) {
    switch (label) {
      case 'Incident': return '#f43f5e';
      case 'Application': return '#06b6d4';
      case 'KnownError': return '#f59e0b';
      case 'Resolution': return '#10b981';
      case 'Team': return '#a855f7';
      case 'User': return '#3b82f6';
      default: return '#6366f1';
    }
  }

  function drawKgGraph() {
    if (!kgCtx || !state.kgData.nodes) return;
    const ctx = kgCtx;
    const { width, height } = kgCanvas;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(state.canvasTransform.x, state.canvasTransform.y);
    ctx.scale(state.canvasTransform.scale, state.canvasTransform.scale);

    const nodeMap = {};
    state.kgData.nodes.forEach(n => nodeMap[n.id] = n);

    const isDark = document.body.classList.contains('theme-slate') || document.body.classList.contains('theme-obsidian') || document.body.classList.contains('theme-cyber');
    const edgeStroke = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.18)';
    const edgeTextFill = isDark ? 'rgba(148, 163, 184, 0.85)' : 'rgba(75, 85, 99, 0.95)';
    const nodeTextFill = isDark ? '#f8fafc' : '#0f172a';

    // Draw Edges
    (state.kgData.edges || []).forEach(e => {
      const source = nodeMap[e.source];
      const target = nodeMap[e.target];
      if (source && target) {
        ctx.strokeStyle = edgeStroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        if (state.canvasTransform.scale > 0.8) {
          const mx = (source.x + target.x) / 2;
          const my = (source.y + target.y) / 2;
          ctx.fillStyle = edgeTextFill;
          ctx.font = '9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(e.type || '', mx, my - 3);
        }
      }
    });

    // Draw Nodes
    state.kgData.nodes.forEach(n => {
      const color = getNodeColor(n.label);
      const isSelected = state.selectedNode && state.selectedNode.id === n.id;
      
      // Filter & Search checks
      const matchesFilter = state.kgActiveFilter === 'all' || n.label === state.kgActiveFilter;
      const matchesSearch = !state.kgSearchTerm || n.id.toLowerCase().includes(state.kgSearchTerm) || (n.name && n.name.toLowerCase().includes(state.kgSearchTerm));
      const isDimmed = !matchesFilter || !matchesSearch;

      ctx.save();
      if (isDimmed) ctx.globalAlpha = 0.2;

      ctx.beginPath();
      ctx.arc(n.x, n.y, isSelected ? 18 : 14, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isSelected ? 16 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = nodeTextFill;
      ctx.font = '600 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(n.id, n.x, n.y + 24);

      ctx.restore();
    });

    ctx.restore();
  }

  function setupKgCanvasInteractions() {
    let isDragging = false;
    let draggedNode = null;
    let startX = 0, startY = 0;

    kgCanvas.addEventListener('mousedown', e => {
      const rect = kgCanvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - state.canvasTransform.x) / state.canvasTransform.scale;
      const my = (e.clientY - rect.top - state.canvasTransform.y) / state.canvasTransform.scale;

      const clicked = state.kgData.nodes.find(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) < 18;
      });

      if (clicked) {
        draggedNode = clicked;
        state.selectedNode = clicked;
        showNodeDetails(clicked);
      } else {
        isDragging = true;
        startX = e.clientX - state.canvasTransform.x;
        startY = e.clientY - state.canvasTransform.y;
      }
      drawKgGraph();
    });

    window.addEventListener('mousemove', e => {
      if (draggedNode) {
        const rect = kgCanvas.getBoundingClientRect();
        draggedNode.x = (e.clientX - rect.left - state.canvasTransform.x) / state.canvasTransform.scale;
        draggedNode.y = (e.clientY - rect.top - state.canvasTransform.y) / state.canvasTransform.scale;
        drawKgGraph();
      } else if (isDragging) {
        state.canvasTransform.x = e.clientX - startX;
        state.canvasTransform.y = e.clientY - startY;
        drawKgGraph();
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      draggedNode = null;
    });

    kgCanvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoom = e.deltaY < 0 ? 1.1 : 0.9;
      state.canvasTransform.scale = Math.max(0.4, Math.min(3, state.canvasTransform.scale * zoom));
      drawKgGraph();
    });

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      state.canvasTransform.scale = Math.min(3, state.canvasTransform.scale * 1.2);
      drawKgGraph();
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      state.canvasTransform.scale = Math.max(0.4, state.canvasTransform.scale * 0.8);
      drawKgGraph();
    });
    document.getElementById('btn-reset-graph')?.addEventListener('click', () => {
      state.canvasTransform = { x: 0, y: 0, scale: 1 };
      state.selectedNode = null;
      state.kgActiveFilter = 'all';
      state.kgSearchTerm = '';
      document.querySelectorAll('[data-node-filter]').forEach(b => b.classList.toggle('active', b.getAttribute('data-node-filter') === 'all'));
      const searchInput = document.getElementById('m8-search-nodes');
      if (searchInput) searchInput.value = '';
      drawKgGraph();
    });
  }

  function showNodeDetails(node) {
    const titleEl = document.getElementById('m8-results-title');
    const resEl = document.getElementById('m8-cypher-results');
    if (!titleEl || !resEl) return;

    titleEl.textContent = `Inspecting Node: [${node.label}] ${node.id}`;
    let html = `<div class="p-2"><table class="data-table"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>`;
    for (const [k, v] of Object.entries(node)) {
      if (k !== 'x' && k !== 'y' && k !== 'vx' && k !== 'vy') {
        html += `<tr><td><strong>${k}</strong></td><td>${typeof v === 'object' ? JSON.stringify(v) : v}</td></tr>`;
      }
    }
    html += `</tbody></table></div>`;
    resEl.innerHTML = html;
  }

  // Cypher execution
  document.querySelectorAll('[data-cypher]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pat = btn.getAttribute('data-cypher');
      document.getElementById('m8-cypher-input').value = pat;
    });
  });

  document.getElementById('btn-run-cypher')?.addEventListener('click', async () => {
    const pattern = document.getElementById('m8-cypher-input').value.trim();
    try {
      const data = await apiFetch('/api/module8/cypher', 'POST', { pattern });
      const titleEl = document.getElementById('m8-results-title');
      const resEl = document.getElementById('m8-cypher-results');
      titleEl.textContent = `Cypher Pattern Matches (${data.count} found)`;

      if (data.results && data.results.length > 0) {
        let html = `<pre class="code-block">${JSON.stringify(data.results, null, 2)}</pre>`;
        resEl.innerHTML = html;
        showToast(`Found ${data.count} Cypher matches`, 'success');
      } else {
        resEl.innerHTML = '<div class="empty-state-sm">No matching graph patterns found for this Cypher expression.</div>';
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Trace RCA
  document.getElementById('btn-trace-rca')?.addEventListener('click', async () => {
    const incId = document.getElementById('m8-incident-select').value;
    try {
      const data = await apiFetch('/api/module8/trace', 'POST', { incident_id: incId });
      const titleEl = document.getElementById('m8-results-title');
      const resEl = document.getElementById('m8-cypher-results');
      titleEl.textContent = `Causal Resolution Trace: ${incId}`;
      
      let html = `<ul class="timeline-list">`;
      (data.path_trace || []).forEach(step => {
        html += `<li>${step}</li>`;
      });
      html += `</ul>`;
      resEl.innerHTML = html;
      showToast(`Causal RCA Path Traced for ${incId}`, 'success');
    } catch (err) {
      console.error(err);
    }
  });

  // Entity Resolution
  document.getElementById('btn-resolve-entity')?.addEventListener('click', async () => {
    const alias = document.getElementById('m8-alias-input').value.trim();
    if (!alias) return;
    try {
      const data = await apiFetch('/api/module8/resolve-entity', 'POST', { alias });
      document.getElementById('m8-resolved-badge').textContent = `Canonical ID: ${data.canonical_id}`;
      showToast(`Resolved '${alias}' -> '${data.canonical_id}'`, 'success');
    } catch (err) {
      console.error(err);
    }
  });

  // --------------------------------------------------------------------------
  // MODULE 9: GraphRAG Studio
  // --------------------------------------------------------------------------
  async function loadModule9Communities() {
    try {
      const data = await apiFetch('/api/module9/data');
      const listEl = document.getElementById('m9-community-summaries');
      if (listEl && data.community_summaries) {
        listEl.innerHTML = '';
        for (const [commId, summ] of Object.entries(data.community_summaries)) {
          const card = document.createElement('div');
          card.className = 'community-summary-card';
          card.innerHTML = `
            <div class="comm-title">Cluster ${commId}</div>
            <div class="comm-desc">${summ}</div>
          `;
          listEl.appendChild(card);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  document.querySelectorAll('[data-m9-prod]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m9-product').value = btn.getAttribute('data-m9-prod');
      document.getElementById('m9-error-code').value = btn.getAttribute('data-m9-err');
      document.getElementById('m9-environment').value = btn.getAttribute('data-m9-env');
      document.getElementById('m9-symptom').value = btn.getAttribute('data-m9-sym');
    });
  });

  document.getElementById('btn-run-m9')?.addEventListener('click', async () => {
    const incident = {
      product: document.getElementById('m9-product').value,
      error_code: document.getElementById('m9-error-code').value,
      environment: document.getElementById('m9-environment').value,
      symptom: document.getElementById('m9-symptom').value,
      customer: 'Enterprise Partner'
    };

    const btn = document.getElementById('btn-run-m9');
    btn.disabled = true;
    btn.innerHTML = '<span>🔍 Executing 4-Step GraphRAG Pipeline...</span>';

    try {
      const res = await apiFetch('/api/module9/resolve', 'POST', { incident });
      document.getElementById('m9-empty-state').classList.add('hidden');
      document.getElementById('m9-results-container').classList.remove('hidden');

      const badge = document.getElementById('m9-pipeline-badge');
      badge.className = 'badge badge-emerald';
      badge.textContent = 'Pipeline Completed (4 Steps)';

      // Step 1: Identification
      const s1 = res.step_1_identification || {};
      document.getElementById('m9-step1-content').innerHTML = `
        <span class="tag-item">Product: ${s1.product}</span>
        <span class="tag-item">Error: ${s1.error_code}</span>
        <span class="tag-item">Env: ${s1.environment}</span>
        <span class="tag-item">Symptom: ${s1.reported_symptom}</span>
      `;

      // Step 2: Vector + Communities
      const s2 = res.step_2_retrieved_knowledge || {};
      const articles = s2.matched_articles || [];
      const communities = s2.community_context || [];
      let s2Html = `<div class="tag-cloud mb-2"><span class="tag-item">Matched KB Articles: ${articles.length}</span><span class="tag-item">Global Communities: ${communities.length}</span></div>`;
      articles.forEach(art => {
        s2Html += `<div class="retrieval-card"><div class="retrieval-title">${art.doc_id}: ${art.title}</div><div class="retrieval-body">${art.content}</div></div>`;
      });
      document.getElementById('m9-step2-content').innerHTML = s2Html;

      // Step 3: Local Traversal
      const s3 = res.step_3_dependency_traversal || {};
      let s3Html = `<div class="tag-cloud"><span class="tag-item">Target: ${s3.target_service || 'N/A'}</span><span class="tag-item">Nodes Traversed: ${(s3.traversed_nodes || []).join(', ')}</span></div>`;
      document.getElementById('m9-step3-content').innerHTML = s3Html;

      // Step 4: Resolution & Evidence
      const s4 = res.step_4_recommendation || {};
      let s4Html = `<pre class="code-block">${s4.recommendation || ''}</pre><h5 class="mt-3 text-muted">Evidence Provenance Chain:</h5><ul class="timeline-list">`;
      (s4.evidence_provenance_chain || []).forEach(ev => {
        s4Html += `<li><strong>${ev.source_type}:</strong> ${ev.source_id || ''} ${ev.title || ev.path_segment || ''}</li>`;
      });
      s4Html += `</ul>`;
      document.getElementById('m9-step4-content').innerHTML = s4Html;

      showToast('Module 9: GraphRAG Pipeline Executed Successfully!', 'success');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🔍 Execute 4-Step GraphRAG Pipeline</span>';
    }
  });

  // --------------------------------------------------------------------------
  // MODULE 10: LangChain Framework
  // --------------------------------------------------------------------------
  // PDF QA
  document.querySelectorAll('[data-pdf-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m10-pdf-query').value = btn.getAttribute('data-pdf-q');
    });
  });

  document.getElementById('btn-run-m10-pdf')?.addEventListener('click', async () => {
    const query = document.getElementById('m10-pdf-query').value.trim();
    if (!query) return;
    const btn = document.getElementById('btn-run-m10-pdf');
    btn.disabled = true;
    try {
      const res = await apiFetch('/api/module10/pdf-qa', 'POST', { query });
      const el = document.getElementById('m10-pdf-results');
      el.innerHTML = `
        <div class="card-title text-cyan">Answer with Page Attribution</div>
        <div class="mb-3">${res.answer}</div>
        <div class="tag-cloud">
          <span class="tag-item">Attributed Page: ${res.page_attribution || 1}</span>
          <span class="tag-item">Document: ${res.document_source || 'cloud_architecture_whitepaper.txt'}</span>
        </div>
      `;
      showToast('PDF QA query resolved with page attribution', 'success');
    } finally {
      btn.disabled = false;
    }
  });

  // Invoice Extractor & Presets
  let invoiceTemplates = {};
  apiFetch('/api/module10/sample-invoices').then(d => {
    if (d.invoices) {
      d.invoices.forEach(inv => invoiceTemplates[inv.id] = inv.text);
    }
  }).catch(() => {});

  document.querySelectorAll('[data-inv-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-inv-preset');
      if (invoiceTemplates[id]) {
        document.getElementById('m10-invoice-text').value = invoiceTemplates[id];
        showToast(`Loaded ${btn.textContent} template`, 'info');
      }
    });
  });

  document.getElementById('btn-run-m10-invoice')?.addEventListener('click', async () => {
    const text = document.getElementById('m10-invoice-text').value;
    const btn = document.getElementById('btn-run-m10-invoice');
    btn.disabled = true;
    try {
      const res = await apiFetch('/api/module10/invoice', 'POST', { invoice_text: text });
      state.extractedInvoice = res;
      const el = document.getElementById('m10-invoice-results');
      
      let html = `
        <div class="step-summary-bar">
          <div class="stat-box"><span class="stat-label">Invoice #</span><span class="stat-value text-cyan">${res.invoice_number}</span></div>
          <div class="stat-box"><span class="stat-label">Vendor</span><span class="stat-value">${res.vendor_name}</span></div>
          <div class="stat-box"><span class="stat-label">Subtotal</span><span class="stat-value">$${(res.subtotal || 0).toFixed(2)}</span></div>
          <div class="stat-box"><span class="stat-label">Grand Total</span><span class="stat-value text-emerald">$${(res.total_amount || 0).toFixed(2)}</span></div>
        </div>
        <div class="card-title mt-3">Itemized Line Items (Pydantic Validated)</div>
        <table class="data-table">
          <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
          <tbody>
      `;
      (res.line_items || []).forEach(item => {
        html += `<tr><td>${item.description}</td><td>${item.quantity}</td><td>$${(item.unit_price || 0).toFixed(2)}</td><td class="text-emerald">$${(item.amount || 0).toFixed(2)}</td></tr>`;
      });
      html += `</tbody></table>`;
      el.innerHTML = html;
      showToast('Invoice extracted to structured Pydantic schema', 'success');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btn-export-invoice-json')?.addEventListener('click', () => {
    if (!state.extractedInvoice) return showToast('No invoice extracted yet.', 'error');
    downloadFile(JSON.stringify(state.extractedInvoice, null, 2), `invoice_${state.extractedInvoice.invoice_number || 'extracted'}.json`, 'application/json');
  });

  // Citations
  document.querySelectorAll('[data-cit-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m10-citation-query').value = btn.getAttribute('data-cit-q');
    });
  });

  document.getElementById('btn-run-m10-citation')?.addEventListener('click', async () => {
    const query = document.getElementById('m10-citation-query').value.trim();
    if (!query) return;
    const btn = document.getElementById('btn-run-m10-citation');
    btn.disabled = true;
    try {
      const res = await apiFetch('/api/module10/citations', 'POST', { query });
      const el = document.getElementById('m10-citation-results');
      
      let html = `
        <div class="info-card highlight-card">
          <div class="card-title text-emerald">Verified Response with Inline Citations</div>
          <div>${res.answer_with_citations}</div>
        </div>
        <div class="card-title mt-3">Verified Source Bibliography</div>
        <table class="data-table">
          <thead><tr><th>Ref Tag</th><th>Source Document</th><th>Page</th><th>Doc ID</th></tr></thead>
          <tbody>
      `;
      (res.citations_bibliography || []).forEach(b => {
        html += `<tr><td><span class="tag-item">${b.citation_tag}</span></td><td>${b.document}</td><td>${b.page}</td><td>${b.doc_id}</td></tr>`;
      });
      html += `</tbody></table>`;
      el.innerHTML = html;
      showToast('Verified citations generated', 'success');
    } finally {
      btn.disabled = false;
    }
  });

  // --------------------------------------------------------------------------
  // MODULE 11: LangGraph & HITL
  // --------------------------------------------------------------------------
  const rangeSlider = document.getElementById('m11-threshold');
  if (rangeSlider) {
    rangeSlider.addEventListener('input', () => {
      document.getElementById('m11-threshold-val').textContent = rangeSlider.value;
    });
  }

  document.querySelectorAll('[data-m11-ticket]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m11-ticket-id').value = btn.getAttribute('data-m11-ticket');
      document.getElementById('m11-query-input').value = btn.getAttribute('data-m11-query');
      document.getElementById('m11-human-override').value = btn.getAttribute('data-m11-override');
    });
  });

  document.getElementById('btn-run-m11')?.addEventListener('click', async () => {
    const ticket_id = document.getElementById('m11-ticket-id').value;
    const query = document.getElementById('m11-query-input').value;
    const threshold = parseFloat(document.getElementById('m11-threshold').value);
    const human_override = document.getElementById('m11-human-override').value.trim() || null;

    const btn = document.getElementById('btn-run-m11');
    btn.disabled = true;
    btn.innerHTML = '<span>🔀 Running StateGraph Workflow...</span>';

    try {
      const res = await apiFetch('/api/module11/workflow', 'POST', {
        ticket_id,
        query,
        confidence_threshold: threshold,
        human_override
      });

      document.getElementById('m11-empty-state').classList.add('hidden');
      document.getElementById('m11-results-container').classList.remove('hidden');

      const isResolved = res.status === 'AUTO_RESOLVED' || res.status === 'HUMAN_RESOLVED';
      const badge = document.getElementById('m11-status-badge');
      badge.className = `badge ${isResolved ? 'badge-emerald' : 'badge-rose'}`;
      badge.textContent = `Status: ${res.status}`;

      document.getElementById('m11-out-status').textContent = res.status;
      if (res.servicenow_data) {
        document.getElementById('m11-out-caller').textContent = res.servicenow_data.caller || 'N/A';
        document.getElementById('m11-out-ci').textContent = res.servicenow_data.cmdb_ci || 'N/A';
      }
      document.getElementById('m11-out-confidence').textContent = `${(res.confidence_score || 0).toFixed(2)} (Target: ${threshold.toFixed(2)})`;

      if (res.human_feedback) {
        document.getElementById('m11-res-title').textContent = 'Human-in-the-Loop Override Action';
        document.getElementById('m11-proposed-resolution').textContent = res.human_feedback;
      } else {
        document.getElementById('m11-res-title').textContent = 'Proposed Resolution Action';
        document.getElementById('m11-proposed-resolution').textContent = res.proposed_resolution;
      }

      // Trace list
      const traceList = document.getElementById('m11-trace-list');
      traceList.innerHTML = '';
      (res.execution_trace || []).forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        traceList.appendChild(li);
      });

      showToast(`StateGraph executed: ${res.status}`, 'success');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🔀 Execute LangGraph Workflow</span>';
    }
  });

  // --------------------------------------------------------------------------
  // MODULE 12: Multi-Agent Swarm
  // --------------------------------------------------------------------------
  document.querySelectorAll('[data-m12-title]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m12-inc-title').value = btn.getAttribute('data-m12-title');
      document.getElementById('m12-desc').value = btn.getAttribute('data-m12-desc');
      document.getElementById('m12-impacted-users').value = btn.getAttribute('data-m12-users');
      document.getElementById('m12-env').value = btn.getAttribute('data-m12-env');
      document.getElementById('m12-logs').value = btn.getAttribute('data-m12-logs');
    });
  });

  document.getElementById('btn-run-m12')?.addEventListener('click', async () => {
    const incident = {
      incident_id: 'INC-' + Math.floor(1000 + Math.random() * 9000),
      title: document.getElementById('m12-inc-title').value,
      description: document.getElementById('m12-desc').value,
      impacted_users: parseInt(document.getElementById('m12-impacted-users').value),
      environment: document.getElementById('m12-env').value,
      telemetry_logs: document.getElementById('m12-logs').value.split(',').map(s => s.trim())
    };

    const btn = document.getElementById('btn-run-m12');
    btn.disabled = true;
    btn.innerHTML = '<span>🤖 Coordinating 5 Specialists...</span>';

    try {
      const res = await apiFetch('/api/module12/multiagent', 'POST', { incident });

      document.getElementById('m12-empty-state').classList.add('hidden');
      document.getElementById('m12-results-container').classList.remove('hidden');

      const badge = document.getElementById('m12-swarm-badge');
      badge.className = 'badge badge-emerald';
      badge.textContent = 'Swarm Dispatched (5 Specialists)';

      // 1. Triage
      const t = res.triage;
      document.getElementById('m12-triage-body').innerHTML = `
        <div>Severity: <strong class="text-rose">${t.severity}</strong></div>
        <div>Target SLA: <strong>${t.sla_target_minutes}m</strong></div>
        <div>Blast Radius: <strong>${t.blast_radius}</strong></div>
      `;

      // 2. Retrieval
      const r = res.retrieval;
      document.getElementById('m12-retrieval-body').innerHTML = `
        <div>Retrieved: <strong>${r.retrieved_sources[0]?.id || 'SOP-REDIS-901'}</strong></div>
        <div>Confidence: <strong>${r.confidence}</strong></div>
      `;

      // 3. RCA
      const rca = res.rca;
      document.getElementById('m12-rca-body').innerHTML = `
        <div>Asset: <strong>${rca.primary_asset_failure}</strong></div>
        <div class="text-dim mt-1">${(rca.causal_mechanism || '').slice(0, 90)}...</div>
      `;

      // 4. Validator
      const v = res.validator;
      document.getElementById('m12-validator-body').innerHTML = `
        <div>Verdict: <strong class="text-emerald">${v.verdict}</strong></div>
        <div>Downtime: <strong>${v.safety_checklist.requires_downtime ? 'YES' : 'NO'}</strong></div>
      `;

      // 5. Escalation
      const esc = res.escalation;
      document.getElementById('m12-escalation-body').innerHTML = `
        <div>Channels: <strong>${(esc.channels_notified || []).join(', ')}</strong></div>
      `;

      // Executive Briefing
      state.latestBriefing = esc.executive_briefing;
      document.getElementById('m12-executive-briefing').textContent = esc.executive_briefing;

      // Pipeline Trace
      const pipeLog = document.getElementById('m12-pipeline-log');
      pipeLog.innerHTML = '';
      (res.execution_log || []).forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        pipeLog.appendChild(li);
      });

      showToast('Module 12: Multi-Agent Swarm completed resolution!', 'success');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🤖 Dispatch Multi-Agent Swarm</span>';
    }
  });

  document.getElementById('btn-export-briefing-md')?.addEventListener('click', () => {
    if (!state.latestBriefing) return showToast('No executive briefing generated yet.', 'error');
    downloadFile(state.latestBriefing, 'executive_incident_briefing.md', 'text/markdown');
  });

  // --------------------------------------------------------------------------
  // MODULE 13: Evaluation & Guardrails
  // --------------------------------------------------------------------------
  document.querySelectorAll('[data-guard-prompt]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('m13-prompt-input').value = btn.getAttribute('data-guard-prompt');
    });
  });

  document.getElementById('btn-run-m13-guardrails')?.addEventListener('click', async () => {
    const prompt = document.getElementById('m13-prompt-input').value;
    const user_role = document.getElementById('m13-user-role').value;
    const doc_min_role = document.getElementById('m13-doc-min-role').value;
    const custom_pii_name = document.getElementById('m13-custom-pii-name')?.value || 'TOKEN';
    const custom_pii_regex = document.getElementById('m13-custom-pii-regex')?.value || '';
    const custom_jailbreak = document.getElementById('m13-custom-jailbreak')?.value || '';

    const btn = document.getElementById('btn-run-m13-guardrails');
    btn.disabled = true;
    try {
      const res = await apiFetch('/api/module13/custom-guardrail', 'POST', {
        prompt,
        user_role,
        doc_min_role,
        custom_pii_name,
        custom_pii_regex,
        custom_jailbreak
      });
      const el = document.getElementById('m13-guardrails-results');

      const isAttack = res.is_injection_attack;
      // check RBAC authorization directly
      const roles = { "Admin": 4, "Security": 3, "Engineering": 2, "GeneralUser": 1 };
      const isAuth = (roles[user_role] || 1) >= (roles[doc_min_role] || 1);

      const piiCount = res.pii_detected ? res.pii_detected.length : 0;
      el.innerHTML = `
        <div class="step-summary-bar">
          <div class="stat-box">
            <span class="stat-label">PII Sanitization</span>
            <span class="stat-value ${piiCount > 0 ? 'text-amber' : 'text-emerald'}">${piiCount > 0 ? `REDACTED (${piiCount})` : 'CLEAN ✅'}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Prompt Injection Defense</span>
            <span class="stat-value ${isAttack ? 'text-rose' : 'text-emerald'}">${isAttack ? 'BLOCKED 🚫' : 'SAFE ✅'}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">RBAC Security Gate</span>
            <span class="stat-value ${isAuth ? 'text-emerald' : 'text-rose'}">${isAuth ? 'AUTHORIZED ✅' : 'DENIED 🚫'}</span>
          </div>
        </div>

        <div class="info-card highlight-card mt-3">
          <div class="card-title text-cyan">Sanitized Output (PII Masked)</div>
          <pre class="code-block" style="white-space: pre-wrap; font-size: 0.9rem;">${res.sanitized_prompt}</pre>
          <div class="tag-cloud mt-2">
            <span class="tag-item">PII Types Detected: ${piiCount > 0 ? res.pii_detected.join(', ') : 'None'}</span>
            <span class="tag-item">Security Msg: ${res.injection_message}</span>
            <span class="tag-item">User Level: ${user_role} | Doc Required: ${doc_min_role}</span>
          </div>
        </div>
      `;
      showToast('Guardrails Security Check Completed', 'success');
    } finally {
      btn.disabled = false;
    }
  });

  // 50 Golden Queries Eval Suite
  document.getElementById('btn-run-m13-eval')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-run-m13-eval');
    btn.disabled = true;
    btn.innerHTML = '<span>📊 Running 50 Golden Test Cases...</span>';

    try {
      const res = await apiFetch('/api/module13/eval', 'POST', {});
      state.evalResults = res;

      // Update gauges
      document.getElementById('m13-stat-passrate').textContent = `${res.pass_rate_percentage}%`;
      document.getElementById('m13-stat-precision').textContent = (res.mean_retrieval_precision || 0).toFixed(3);
      document.getElementById('m13-stat-recall').textContent = (res.mean_retrieval_recall || 0).toFixed(3);
      document.getElementById('m13-stat-faithfulness').textContent = (res.mean_faithfulness || 0).toFixed(3);
      document.getElementById('m13-stat-judge').textContent = `${(res.mean_llm_judge_score || 0).toFixed(3)} / 1.0`;

      // Failure taxonomy bars
      const taxEl = document.getElementById('m13-taxonomy-bars');
      taxEl.innerHTML = '';
      const total = res.total_queries_evaluated || 50;
      for (const [cat, cnt] of Object.entries(res.failure_taxonomy_distribution || {})) {
        const pct = (cnt / total) * 100;
        const color = cat === 'Correct' ? 'var(--accent-emerald)' : 'var(--accent-rose)';
        const row = document.createElement('div');
        row.className = 'tax-row';
        row.innerHTML = `
          <span class="tax-label">${cat}</span>
          <div class="tax-bar-track">
            <div class="tax-bar-fill" style="width: ${pct}%; background: ${color};"></div>
          </div>
          <span class="tax-count">${cnt}</span>
        `;
        taxEl.appendChild(row);
      }

      renderEvalTable(res.detailed_results || []);
      showToast(`50 Golden Queries Evaluated! Pass Rate: ${res.pass_rate_percentage}%`, 'success');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>📊 Run 50 Queries Evaluation Suite</span>';
    }
  });

  function renderEvalTable(rows) {
    const tbody = document.getElementById('m13-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    rows.forEach(r => {
      const tr = document.createElement('tr');
      const isPass = r.verdict === 'PASS';
      tr.innerHTML = `
        <td><strong class="text-cyan">${r.query_id}</strong></td>
        <td>${r.category}</td>
        <td>${r.query}</td>
        <td><strong>${(r.quality_score || 0).toFixed(2)}</strong></td>
        <td><span class="badge ${isPass ? 'badge-emerald' : 'badge-rose'}">${r.verdict}</span></td>
        <td>${r.failure_category || 'Correct'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('m13-search-table')?.addEventListener('input', e => {
    if (!state.evalResults || !state.evalResults.detailed_results) return;
    const term = e.target.value.toLowerCase();
    const filtered = state.evalResults.detailed_results.filter(r => 
      r.query_id.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      r.query.toLowerCase().includes(term) ||
      r.verdict.toLowerCase().includes(term) ||
      (r.failure_category && r.failure_category.toLowerCase().includes(term))
    );
    renderEvalTable(filtered);
  });

  // Export Eval results
  document.getElementById('btn-export-eval-json')?.addEventListener('click', () => {
    if (!state.evalResults) return showToast('Run the 50 queries suite first.', 'error');
    downloadFile(JSON.stringify(state.evalResults, null, 2), 'golden_queries_eval_results.json', 'application/json');
  });

  document.getElementById('btn-export-eval-csv')?.addEventListener('click', () => {
    if (!state.evalResults || !state.evalResults.detailed_results) return showToast('Run the 50 queries suite first.', 'error');
    let csv = 'Query_ID,Category,Query,Quality_Score,Verdict,Outcome\n';
    state.evalResults.detailed_results.forEach(r => {
      csv += `"${r.query_id}","${r.category}","${r.query.replace(/"/g, '""')}","${r.quality_score}","${r.verdict}","${r.failure_category || 'Correct'}"\n`;
    });
    downloadFile(csv, 'golden_queries_eval_results.csv', 'text/csv');
  });

  // --------------------------------------------------------------------------
  // Enterprise Scenario Library & Input Assistant Engine
  // --------------------------------------------------------------------------
  function initScenarioLibrary() {
    const catalog = window.ENTERPRISE_SCENARIOS || {};

    // 1. Populate all scenario dropdowns
    document.querySelectorAll('.scenario-select').forEach(select => {
      const moduleKey = select.dataset.module;
      const scenarios = catalog[moduleKey];
      if (!scenarios || !Array.isArray(scenarios)) return;

      // Keep only first placeholder option
      const firstOpt = select.options[0] ? select.options[0].outerHTML : '<option value="">-- Select Scenario --</option>';
      select.innerHTML = firstOpt;

      scenarios.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.label || item.id;
        select.appendChild(opt);
      });

      // Bind change listener
      select.addEventListener('change', () => {
        const chosenId = select.value;
        if (!chosenId) return;
        const item = scenarios.find(s => s.id === chosenId);
        if (!item) return;

        applyScenario(moduleKey, item);
        showToast(`Loaded: ${item.label || item.id}`, 'info');

        // Sync with active pill in current section if exists
        const parentSec = select.closest('section, .subtab-view');
        if (parentSec) {
          parentSec.querySelectorAll('.preset-btn').forEach(btn => {
            const btnText = btn.textContent.trim().toLowerCase();
            const labelText = (item.label || '').toLowerCase();
            if (labelText.includes(btnText) || btnText.includes(item.category?.toLowerCase() || '')) {
              parentSec.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
            }
          });
        }
      });
    });

    // 2. Scenario Application Handler
    function applyScenario(moduleKey, item) {
      switch (moduleKey) {
        case 'module1':
          if (item.prompt && document.getElementById('m1-prompt-input')) document.getElementById('m1-prompt-input').value = item.prompt;
          if (item.model && document.getElementById('m1-model-select')) document.getElementById('m1-model-select').value = item.model;
          if (item.temp !== undefined && document.getElementById('m1-temperature')) {
            document.getElementById('m1-temperature').value = item.temp;
            const tempVal = document.getElementById('m1-temp-val');
            if (tempVal) tempVal.textContent = item.temp;
          }
          if (item.top_p !== undefined && document.getElementById('m1-top-p')) {
            document.getElementById('m1-top-p').value = item.top_p;
            const topVal = document.getElementById('m1-topp-val');
            if (topVal) topVal.textContent = item.top_p;
          }
          if (document.getElementById('m1-grounding-input')) {
            document.getElementById('m1-grounding-input').value = item.grounding || '';
          }
          break;

        case 'module2_ticket':
          if (item.ticket_id && document.getElementById('m2-ticket-id')) document.getElementById('m2-ticket-id').value = item.ticket_id;
          if (item.text && document.getElementById('m2-ticket-text')) document.getElementById('m2-ticket-text').value = item.text;
          break;

        case 'module2_contract':
          if (item.text && document.getElementById('m2-contract-text')) document.getElementById('m2-contract-text').value = item.text;
          break;

        case 'module2_meeting':
          if (item.title && document.getElementById('m2-meeting-title')) document.getElementById('m2-meeting-title').value = item.title;
          if (item.date && document.getElementById('m2-meeting-date')) document.getElementById('m2-meeting-date').value = item.date;
          if (item.transcript && document.getElementById('m2-meeting-transcript')) document.getElementById('m2-meeting-transcript').value = item.transcript;
          break;

        case 'module2_rules':
          if (item.rules && document.getElementById('m2-rules-text')) document.getElementById('m2-rules-text').value = item.rules;
          if (item.request && document.getElementById('m2-request-text')) document.getElementById('m2-request-text').value = item.request;
          break;

        case 'module3':
          if (item.prompt && document.getElementById('m3-prompt-input')) document.getElementById('m3-prompt-input').value = item.prompt;
          if (item.enable_tools !== undefined && document.getElementById('m3-enable-tools')) document.getElementById('m3-enable-tools').checked = !!item.enable_tools;
          if (item.sim_failure !== undefined && document.getElementById('m3-sim-failure')) document.getElementById('m3-sim-failure').checked = !!item.sim_failure;
          break;

        case 'module4':
          if (item.query && document.getElementById('m4-query-input')) document.getElementById('m4-query-input').value = item.query;
          break;

        case 'module5_search':
          if (item.query && document.getElementById('m5-query-input')) document.getElementById('m5-query-input').value = item.query;
          if (item.dept && document.getElementById('m5-dept-filter')) document.getElementById('m5-dept-filter').value = item.dept;
          break;

        case 'module6':
          if (item.query && document.getElementById('m6-query-input')) document.getElementById('m6-query-input').value = item.query;
          if (item.role && document.getElementById('m6-user-role')) document.getElementById('m6-user-role').value = item.role;
          if (document.getElementById('m6-history-preview')) document.getElementById('m6-history-preview').value = item.history || '';
          break;

        case 'module7':
          if (item.cust && document.getElementById('m7-customer-id')) document.getElementById('m7-customer-id').value = item.cust;
          if (item.query && document.getElementById('m7-query-input')) document.getElementById('m7-query-input').value = item.query;
          break;

        case 'module8_cypher':
          if (item.cypher && document.getElementById('m8-cypher-input')) document.getElementById('m8-cypher-input').value = item.cypher;
          break;

        case 'module8_rca':
          if (item.incident_id && document.getElementById('m8-incident-select')) document.getElementById('m8-incident-select').value = item.incident_id;
          if (item.alias && document.getElementById('m8-alias-input')) document.getElementById('m8-alias-input').value = item.alias;
          break;

        case 'module9':
          if (item.product && document.getElementById('m9-product')) document.getElementById('m9-product').value = item.product;
          if (item.err && document.getElementById('m9-error-code')) document.getElementById('m9-error-code').value = item.err;
          if (item.env && document.getElementById('m9-environment')) document.getElementById('m9-environment').value = item.env;
          if (item.sym && document.getElementById('m9-symptom')) document.getElementById('m9-symptom').value = item.sym;
          break;

        case 'module10_pdf':
          if (item.query && document.getElementById('m10-pdf-query')) document.getElementById('m10-pdf-query').value = item.query;
          break;

        case 'module10_invoice':
          if (item.text && document.getElementById('m10-invoice-text')) document.getElementById('m10-invoice-text').value = item.text;
          break;

        case 'module10_citation':
          if (item.query && document.getElementById('m10-citation-query')) document.getElementById('m10-citation-query').value = item.query;
          break;

        case 'module11':
          if (item.ticket && document.getElementById('m11-ticket-id')) document.getElementById('m11-ticket-id').value = item.ticket;
          if (item.query && document.getElementById('m11-query-input')) document.getElementById('m11-query-input').value = item.query;
          if (document.getElementById('m11-human-override')) document.getElementById('m11-human-override').value = item.override || '';
          break;

        case 'module12':
          if (item.title && document.getElementById('m12-inc-title')) document.getElementById('m12-inc-title').value = item.title;
          if (item.desc && document.getElementById('m12-desc')) document.getElementById('m12-desc').value = item.desc;
          if (item.users !== undefined && document.getElementById('m12-impacted-users')) document.getElementById('m12-impacted-users').value = item.users;
          if (item.env && document.getElementById('m12-env')) document.getElementById('m12-env').value = item.env;
          if (item.logs && document.getElementById('m12-logs')) document.getElementById('m12-logs').value = item.logs;
          break;

        case 'module13_guardrails':
          if (item.prompt && document.getElementById('m13-prompt-input')) document.getElementById('m13-prompt-input').value = item.prompt;
          if (item.user_role && document.getElementById('m13-user-role')) document.getElementById('m13-user-role').value = item.user_role;
          if (item.doc_role && document.getElementById('m13-doc-min-role')) document.getElementById('m13-doc-min-role').value = item.doc_role;
          break;
      }
    }

    // 3. Random Button Handlers
    document.querySelectorAll('.btn-random-scenario').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const select = document.getElementById(targetId);
        if (!select || select.options.length <= 1) return;

        const randIndex = Math.floor(Math.random() * (select.options.length - 1)) + 1;
        select.selectedIndex = randIndex;
        select.dispatchEvent(new Event('change'));
      });
    });

    // 4. Preset Pill Click Handlers across all modules
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active pill in parent group
        const group = btn.closest('.preset-pill-group');
        if (group) {
          group.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }

        // Module 1 Pill
        if (btn.dataset.m1Prompt) {
          const p = document.getElementById('m1-prompt-input');
          if (p) p.value = btn.dataset.m1Prompt;
          if (btn.dataset.m1Model) document.getElementById('m1-model-select').value = btn.dataset.m1Model;
          if (btn.dataset.m1Temp) {
            document.getElementById('m1-temperature').value = btn.dataset.m1Temp;
            const tempVal = document.getElementById('m1-temp-val');
            if (tempVal) tempVal.textContent = btn.dataset.m1Temp;
          }
          if (btn.dataset.m1Grounding !== undefined) {
            document.getElementById('m1-grounding-input').value = btn.dataset.m1Grounding;
          }
        }

        // Module 2 Subtab 1 Ticket Pill
        if (btn.dataset.m2Ticket) {
          const t = document.getElementById('m2-ticket-text');
          if (t) t.value = btn.dataset.m2Ticket;
          if (btn.dataset.m2TicketId) document.getElementById('m2-ticket-id').value = btn.dataset.m2TicketId;
        }

        // Module 2 Subtab 2 Contract Pill
        if (btn.dataset.m2Contract) {
          const c = document.getElementById('m2-contract-text');
          if (c) c.value = btn.dataset.m2Contract;
        }

        // Module 2 Subtab 3 Meeting Pill
        if (btn.dataset.m2Transcript) {
          const m = document.getElementById('m2-meeting-transcript');
          if (m) m.value = btn.dataset.m2Transcript;
          if (btn.dataset.m2Title) document.getElementById('m2-meeting-title').value = btn.dataset.m2Title;
          if (btn.dataset.m2Date) document.getElementById('m2-meeting-date').value = btn.dataset.m2Date;
        }

        // Module 2 Subtab 4 Rules Pill
        if (btn.dataset.m2Rules) {
          const r = document.getElementById('m2-rules-text');
          if (r) r.value = btn.dataset.m2Rules;
          if (btn.dataset.m2Req) document.getElementById('m2-request-text').value = btn.dataset.m2Req;
        }

        // Module 3 Pill
        if (btn.dataset.m3Prompt) {
          const p = document.getElementById('m3-prompt-input');
          if (p) p.value = btn.dataset.m3Prompt;
          if (btn.dataset.m3Tools !== undefined) document.getElementById('m3-enable-tools').checked = btn.dataset.m3Tools === 'true';
          if (btn.dataset.m3Failure !== undefined) document.getElementById('m3-sim-failure').checked = btn.dataset.m3Failure === 'true';
        }

        // Module 4 Pill
        if (btn.dataset.m4Query) {
          const q = document.getElementById('m4-query-input');
          if (q) q.value = btn.dataset.m4Query;
        }

        // Module 5 Pill
        if (btn.dataset.m5Query) {
          const q = document.getElementById('m5-query-input');
          if (q) q.value = btn.dataset.m5Query;
          if (btn.dataset.m5Dept) document.getElementById('m5-dept-filter').value = btn.dataset.m5Dept;
        }

        // Module 6 Pill
        if (btn.dataset.m6Q) {
          const q = document.getElementById('m6-query-input');
          if (q) q.value = btn.dataset.m6Q;
          if (btn.dataset.m6Role) document.getElementById('m6-user-role').value = btn.dataset.m6Role;
          if (document.getElementById('m6-history-preview')) {
            document.getElementById('m6-history-preview').value = btn.dataset.m6History || '';
          }
        }

        // Module 7 Pill
        if (btn.dataset.m7Query) {
          const q = document.getElementById('m7-query-input');
          if (q) q.value = btn.dataset.m7Query;
          if (btn.dataset.m7Cust) document.getElementById('m7-customer-id').value = btn.dataset.m7Cust;
        }

        // Module 8 Cypher Pill
        if (btn.dataset.cypher) {
          const c = document.getElementById('m8-cypher-input');
          if (c) c.value = btn.dataset.cypher;
        }

        // Module 9 GraphRAG Pill
        if (btn.dataset.m9Prod) {
          if (document.getElementById('m9-product')) document.getElementById('m9-product').value = btn.dataset.m9Prod;
          if (document.getElementById('m9-error-code') && btn.dataset.m9Err) document.getElementById('m9-error-code').value = btn.dataset.m9Err;
          if (document.getElementById('m9-environment') && btn.dataset.m9Env) document.getElementById('m9-environment').value = btn.dataset.m9Env;
          if (document.getElementById('m9-symptom') && btn.dataset.m9Sym) document.getElementById('m9-symptom').value = btn.dataset.m9Sym;
        }

        // Module 10 PDF QA Pill
        if (btn.dataset.pdfQ) {
          const q = document.getElementById('m10-pdf-query');
          if (q) q.value = btn.dataset.pdfQ;
        }

        // Module 10 Invoice Preset Pill
        if (btn.dataset.invPreset) {
          const invScenarios = catalog.module10_invoice || [];
          const found = invScenarios.find(s => s.id === btn.dataset.invPreset);
          if (found && document.getElementById('m10-invoice-text')) {
            document.getElementById('m10-invoice-text').value = found.text;
          }
        }

        // Module 10 Citation Pill
        if (btn.dataset.citQ) {
          const q = document.getElementById('m10-citation-query');
          if (q) q.value = btn.dataset.citQ;
        }

        // Module 11 Pill
        if (btn.dataset.m11Ticket) {
          if (document.getElementById('m11-ticket-id')) document.getElementById('m11-ticket-id').value = btn.dataset.m11Ticket;
          if (document.getElementById('m11-query-input') && btn.dataset.m11Query) document.getElementById('m11-query-input').value = btn.dataset.m11Query;
          if (document.getElementById('m11-human-override')) document.getElementById('m11-human-override').value = btn.dataset.m11Override || '';
        }

        // Module 12 Pill
        if (btn.dataset.m12Title) {
          if (document.getElementById('m12-inc-title')) document.getElementById('m12-inc-title').value = btn.dataset.m12Title;
          if (document.getElementById('m12-desc') && btn.dataset.m12Desc) document.getElementById('m12-desc').value = btn.dataset.m12Desc;
          if (document.getElementById('m12-impacted-users') && btn.dataset.m12Users) document.getElementById('m12-impacted-users').value = btn.dataset.m12Users;
          if (document.getElementById('m12-env') && btn.dataset.m12Env) document.getElementById('m12-env').value = btn.dataset.m12Env;
          if (document.getElementById('m12-logs') && btn.dataset.m12Logs) document.getElementById('m12-logs').value = btn.dataset.m12Logs;
        }

        // Module 13 Guardrails Pill
        if (btn.dataset.guardPrompt) {
          const p = document.getElementById('m13-prompt-input');
          if (p) p.value = btn.dataset.guardPrompt;
        }
      });
    });

    // 5. Template Chips (Prompt Assistant) Handler
    document.querySelectorAll('.template-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const targetSel = chip.dataset.insertTarget;
        const textToInsert = chip.dataset.insert;
        if (!targetSel || !textToInsert) return;

        const targetEl = document.querySelector(targetSel);
        if (!targetEl) return;

        // If cursor position exists in textarea/input, insert at cursor; else append
        if (typeof targetEl.selectionStart === 'number' && typeof targetEl.selectionEnd === 'number') {
          const start = targetEl.selectionStart;
          const end = targetEl.selectionEnd;
          const val = targetEl.value;
          targetEl.value = val.substring(0, start) + textToInsert + val.substring(end);
          targetEl.selectionStart = targetEl.selectionEnd = start + textToInsert.length;
        } else {
          targetEl.value = (targetEl.value || '') + textToInsert;
        }

        targetEl.focus();
        targetEl.dispatchEvent(new Event('input', { bubbles: true }));
        showToast(`Template added: "${chip.textContent.trim()}"`, 'info');
      });
    });
  }

  // Initialize the Scenario Library & Helper Engine
  initScenarioLibrary();

  // --------------------------------------------------------------------------
  // Initialization Check
  // --------------------------------------------------------------------------
  apiFetch('/api/status').then(() => {
    showToast('Enterprise GenAI Console Ready', 'success');
  }).catch(() => {
    showToast('Backend server offline. Please start ui_server.py.', 'error');
  });
});

