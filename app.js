(() => {
  'use strict';
  const C = window.WorkplaceCore;
  const STORAGE_KEY = 'workplace-dashboard-portfolio-v1';
  const $ = (id) => document.getElementById(id);
  const today = () => new Date();
  const escapeHtml = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const pill = s => s.startsWith('P1') ? 'critical' : s.startsWith('P2') ? 'high' : s.startsWith('P3') ? 'medium' : 'low';
  const fmtDate = iso => new Date(iso).toLocaleDateString('en-GB', {day:'2-digit',month:'short'});
  function readTickets() { try { const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(parsed)?parsed:C.demoTickets(today()); } catch { return C.demoTickets(today()); } }
  let tickets = readTickets();
  function persist() { try {localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));} catch {alert('Your browser could not save data. Export the current requests as CSV instead.');} }
  if (!localStorage.getItem(STORAGE_KEY)) persist();
  function renderStats() {
    const x = C.summarize(tickets, today());
    const data = [ ['Total requests', x.total, 'Requests logged', 'stat-blue'], ['Open requests',x.active,'Need action or follow-up','stat-indigo'], ['High-priority open',x.high,'P1 and P2 requests','stat-amber'],['Overdue open',x.overdue,'Illustrative targets exceeded','stat-red'],['Resolved',x.resolutionRate+'%','Of all logged requests','stat-green'] ];
    $('stats').innerHTML = data.map(([label,value,sub,cls]) => `<article class="stat-card ${cls}"><span>${label}</span><strong>${value}</strong><small>${sub}</small></article>`).join('');
    const statuses = Object.entries(x.counts);
    $('statusBars').innerHTML = statuses.map(([k,v])=> bar(k,v, x.total)).join('');
    $('categoryBars').innerHTML = Object.entries(x.categories).filter(([k,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>bar(k,v,x.total)).join('');
  }
  function bar(label,value,total) { return `<div class="bar-row"><div class="bar-name"><span>${escapeHtml(label)}</span><strong>${value}</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${total?100*value/total:0}%"></div></div></div>`; }
  function renderTable() {
    const q=$('search').value.trim().toLowerCase(), status=$('statusFilter').value, priority=$('priorityFilter').value;
    const shown = tickets.filter(t => (!status || t.status === status) && (!priority || t.priority === priority) && (!q || [t.id,t.title,t.department,t.category,t.description].some(x=>String(x).toLowerCase().includes(q))));
    $('countLabel').textContent=`${shown.length} of ${tickets.length} requests`;
    $('requestRows').innerHTML = shown.length ? shown.map(t=>`<tr><td class="request-title"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.id)}${C.isOverdue(t,today())?' · <span class="overdue-label">Overdue</span>':''}</small></td><td><span>${escapeHtml(t.department)}</span><small>${escapeHtml(t.category)}</small></td><td><span class="priority ${pill(t.priority)}">${escapeHtml(t.priority)}</span></td><td><select class="table-select" data-id="${escapeHtml(t.id)}" data-field="owner" aria-label="Owner for ${escapeHtml(t.id)}">${C.OWNERS.map(o=>`<option value="${escapeHtml(o)}" ${o===t.owner?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select></td><td><select class="table-select" data-id="${escapeHtml(t.id)}" data-field="status" aria-label="Status for ${escapeHtml(t.id)}">${C.STATUSES.map(s=>`<option value="${escapeHtml(s)}" ${s===t.status?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></td><td class="date">${fmtDate(t.createdAt)}</td></tr>`).join('') : `<tr><td colspan="6" class="empty-state">No requests match these filters.</td></tr>`;
  }
  function renderRecommendations() {$('recommendations').innerHTML=C.recommendations(tickets,today()).map((line,i)=>`<div class="insight"><span class="insight-number">${String(i+1).padStart(2,'0')}</span><span>${escapeHtml(line)}</span></div>`).join('');}
  function render() {renderStats();renderTable();renderRecommendations();}
  [ ['statusFilter',C.STATUSES], ['priorityFilter',C.PRIORITIES] ].forEach(([id,vals])=>{ $(id).insertAdjacentHTML('beforeend',vals.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join(''));});
  [ ['departmentSelect',C.DEPARTMENTS], ['categorySelect',C.CATEGORIES] ].forEach(([id,vals])=>{ $(id).innerHTML=vals.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join(''); });
  ['search','statusFilter','priorityFilter'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',renderTable));
  $('requestRows').addEventListener('change',event=>{
    const el=event.target;
    if (!el.matches('select[data-id][data-field]')) return;
    const t=tickets.find(x=>x.id===el.dataset.id);
    if (!t || !['owner','status'].includes(el.dataset.field)) return;
    const options=el.dataset.field==='owner'?C.OWNERS:C.STATUSES;
    if (!options.includes(el.value)) return;
    t[el.dataset.field]=el.value;persist();render();
  });
  function closeDialog() { $('newRequestDialog').close(); }
  $('openForm').addEventListener('click',()=> $('newRequestDialog').showModal());
  $('cancelForm').addEventListener('click',closeDialog);
  $('closeForm').addEventListener('click',closeDialog);
  $('requestForm').addEventListener('submit',event=>{
    event.preventDefault(); const f=new FormData(event.target), title=String(f.get('title')||'').trim();
    if (!title) return;
    const impact=Number(f.get('impact')),urgency=Number(f.get('urgency'));
    const maxNumber = Math.max(0,...tickets.map(t=>Number((t.id||'').replace('DW-',''))||0));
    tickets.unshift({id:'DW-'+String(maxNumber+1).padStart(3,'0'),createdAt:today().toISOString(),title,department:String(f.get('department')),category:String(f.get('category')),impact,urgency,priority:C.priorityFor(impact,urgency),owner:'Unassigned',status:'New',description:String(f.get('description')||'').trim()});
    persist();event.target.reset();closeDialog();render();
  });
  $('export').addEventListener('click',()=>{
    const blob=new Blob(['\uFEFF'+C.toCSV(tickets)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='digital_workplace_requests.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('reset').addEventListener('click',()=>{
    if(!confirm('Restore the synthetic demo data? This removes any requests you added in this browser.')) return;
    tickets=C.demoTickets(today());persist();$('search').value='';$('statusFilter').value='';$('priorityFilter').value='';render();
  });
  render();
})();
