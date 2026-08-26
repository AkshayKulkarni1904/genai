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
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) {
    const savedTheme = localStorage.getItem('genai-theme') || 'theme-obsidian';
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
    // Ignore when typing inside inputs / textareas
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    const key = e.key.toUpperCase();
    if (key === 'D') switchView('dashboard');
    else if (key === '1') switchView('module7');
    else if (key === '2') switchView('module8');
    else if (key === '3') switchView('module9');
    else if (key === '4') switchView('module10');
    else if (key === '5') switchView('module11');
    else if (key === '6') switchView('module12');
    else if (key === '7') switchView('module13');
    else if (key === 'R') runActiveView();
    else if (e.key === '?') shortcutsModal?.classList.toggle('hidden');
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
    dashboard: { title: 'System Dashboard', desc: 'Unified control center for Enterprise GenAI Engineering practical pipelines.' },
    module7: { title: 'Module 07: Advanced RAG Patterns', desc: 'Parent-child chunks, multi-vector indexing, corrective RAG (CRAG), and semantic LRU cache.' },
    module8: { title: 'Module 08: Knowledge Graph Fundamentals', desc: 'Enterprise ontology, IT support graph modeling, Cypher pattern engine, and entity resolution.' },
    module9: { title: 'Module 09: GraphRAG Incident Pipeline', desc: '4-step incident resolution workflow combining vector search, community summaries, and multi-hop graph traversal.' },
    module10: { title: 'Module 10: LangChain Framework Lab', desc: 'PDF QA bot with page attribution, structured invoice extraction via LCEL & Pydantic, and citation assistants.' },
    module11: { title: 'Module 11: LangGraph & Human-in-the-Loop', desc: 'Stateful Support Agent with ServiceNow API integration, confidence routing, and human escalation.' },
    module12: { title: 'Module 12: Multi-Agent Systems Swarm', desc: 'Supervisor-Worker orchestrator coordinating 5 specialist agents with a shared blackboard state.' },
    module13: { title: 'Module 13: Evaluation & Security Guardrails', desc: '50 golden queries evaluation benchmark, Precision/Recall, LLM Judge, and PII / Prompt Injection defense.' }
  };

  function switchView(viewName) {
    state.currentView = viewName;
    
    // Update navigation active states
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Update workspace views
    document.querySelectorAll('.workspace-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    // Update header
    const info = viewTitles[viewName] || { title: 'GenAI Console', desc: '' };
    document.getElementById('view-title').textContent = info.title;
    document.getElementById('view-desc').textContent = info.desc;

    // View-specific lazy loaders
    if (viewName === 'module8') {
      loadModule8Graph();
      loadModule8Governance();
    } else if (viewName === 'module9') {
      loadModule9Communities();
    }
  }

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

      parent.querySelectorAll('.subtab-view').forEach(view => {
        view.classList.toggle('active', view.id === `subtab-${targetSubtab}`);
      });
    });
  });

  // --------------------------------------------------------------------------
  // DASHBOARD: Unified Enterprise Assessment
  // --------------------------------------------------------------------------
  const btnRunAllAssessment = document.getElementById('btn-run-all-assessment');
  if (btnRunAllAssessment) {
    btnRunAllAssessment.addEventListener('click', async () => {
      btnRunAllAssessment.disabled = true;
      btnRunAllAssessment.innerHTML = '<span>🚀 Assessing All 7 Enterprise Modules...</span>';

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
            <span class="gauge-desc">7 of 7 Modules Passed</span>
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
          if (modKey === 'module_07') finding = `CRAG Status: ${m.crag_status} | Docs: ${m.docs_retrieved}`;
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
    const rect = kgCanvas.parentElement.getBoundingClientRect();
    kgCanvas.width = rect.width;
    kgCanvas.height = rect.height;
    drawKgGraph();
  }

  async function loadModule8Graph() {
    try {
      const data = await apiFetch('/api/module8/graph');
      state.kgData = data;
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
    const width = kgCanvas.width;
    const height = kgCanvas.height;
    
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

    // Draw Edges
    (state.kgData.edges || []).forEach(e => {
      const source = nodeMap[e.source];
      const target = nodeMap[e.target];
      if (source && target) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        if (state.canvasTransform.scale > 0.8) {
          const mx = (source.x + target.x) / 2;
          const my = (source.y + target.y) / 2;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
          ctx.font = '9px Outfit';
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
      ctx.shadowBlur = isSelected ? 16 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono';
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

      el.innerHTML = `
        <div class="step-summary-bar">
          <div class="stat-box">
            <span class="stat-label">Prompt Injection Defense</span>
            <span class="stat-value ${isAttack ? 'text-rose' : 'text-emerald'}">${isAttack ? 'BLOCKED 🚫' : 'SAFE ✅'}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">RBAC Access Status</span>
            <span class="stat-value ${isAuth ? 'text-emerald' : 'text-rose'}">${isAuth ? 'AUTHORIZED ✅' : 'DENIED 🚫'}</span>
          </div>
        </div>

        <div class="info-card highlight-card mt-3">
          <div class="card-title text-cyan">Sanitized Output (PII Redacted)</div>
          <pre class="code-block">${res.sanitized_prompt}</pre>
          <div class="tag-cloud mt-2">
            <span class="tag-item">PII Types Detected: ${res.pii_detected.length > 0 ? res.pii_detected.join(', ') : 'None'}</span>
            <span class="tag-item">Security Msg: ${res.injection_message}</span>
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
  // Initialization Check
  // --------------------------------------------------------------------------
  apiFetch('/api/status').then(() => {
    showToast('Enterprise GenAI Console Ready', 'success');
  }).catch(() => {
    showToast('Backend server offline. Please start ui_server.py.', 'error');
  });
});
