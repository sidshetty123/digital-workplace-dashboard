/* Pure business rules for the Digital Workplace Request & Improvement Dashboard. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WorkplaceCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PRIORITIES = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
  const STATUSES = ['New', 'In Progress', 'Waiting', 'Resolved'];
  const CATEGORIES = ['Microsoft Teams', 'SharePoint', 'Outlook', 'OneDrive', 'Device & Access', 'Other'];
  const DEPARTMENTS = ['Sales', 'Store Operations', 'HR', 'Finance', 'Logistics', 'IT', 'Other'];
  const OWNERS = ['Unassigned', 'Service Desk', 'Collaboration IT', 'Workplace IT'];

  function priorityFor(impact, urgency) {
    const i = Number(impact), u = Number(urgency);
    if (![1,2,3].includes(i) || ![1,2,3].includes(u)) throw new Error('Impact and urgency must be 1, 2 or 3');
    const score = i * u;
    if (score === 9) return PRIORITIES[0];
    if (score >= 6) return PRIORITIES[1];
    if (score >= 3) return PRIORITIES[2];
    return PRIORITIES[3];
  }
  function slaHours(priority) {
    if (priority === PRIORITIES[0]) return 4;
    if (priority === PRIORITIES[1]) return 24;
    if (priority === PRIORITIES[2]) return 72;
    return 168;
  }
  function hoursSince(iso, now) {
    const elapsed = (new Date(now).getTime() - new Date(iso).getTime()) / 3600000;
    return Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  }
  function isOverdue(ticket, now) {
    return ticket.status !== 'Resolved' && hoursSince(ticket.createdAt, now) > slaHours(ticket.priority);
  }
  function summarize(tickets, now) {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const high = tickets.filter(t => t.priority.startsWith('P1') || t.priority.startsWith('P2')).filter(t => t.status !== 'Resolved').length;
    const overdue = tickets.filter(t => isOverdue(t, now)).length;
    const counts = Object.fromEntries(STATUSES.map(s => [s, tickets.filter(t => t.status === s).length]));
    const categories = Object.fromEntries(CATEGORIES.map(c => [c, tickets.filter(t => t.category === c).length]));
    return {total, active: total-resolved, resolved, high, overdue, resolutionRate: total ? Math.round(100*resolved/total) : 0, counts, categories};
  }
  function csvCell(v) {
    const s = String(v === null || v === undefined ? '' : v);
    // Mitigate formula injection when opening exported CSV in spreadsheets.
    const safe = /^[\s]*[=+@\-]/.test(s) ? "'" + s : s;
    return '"' + safe.replace(/"/g, '""') + '"';
  }
  const FIELDS = ['id','createdAt','title','department','category','impact','urgency','priority','owner','status','description'];
  function toCSV(tickets) {
    return [FIELDS.join(','), ...tickets.map(t => FIELDS.map(f => csvCell(t[f])).join(','))].join('\r\n') + '\r\n';
  }
  function demoTickets(now = new Date()) {
    const specs = [
      ['Teams meeting audio issue','Sales','Microsoft Teams',2,3,'Collaboration IT','In Progress',5,'Audio not connecting in daily coordination calls'],
      ['SharePoint document permissions','HR','SharePoint',3,2,'Collaboration IT','Waiting',19,'Team cannot access onboarding checklist'],
      ['Outlook mailbox access','Finance','Outlook',3,3,'Service Desk','New',1,'Shared mailbox unavailable to finance team'],
      ['OneDrive sync difficulties','Store Operations','OneDrive',1,2,'Service Desk','Resolved',96,'Files were not syncing to workstation'],
      ['New device setup request','Logistics','Device & Access',2,2,'Workplace IT','In Progress',27,'Laptop setup for new employee'],
      ['Teams channel organization','IT','Microsoft Teams',1,1,'Collaboration IT','Resolved',125,'Improve channel naming conventions'],
      ['SharePoint folder duplication','Sales','SharePoint',2,2,'Unassigned','New',13,'Reduce duplicate file copies and clarify ownership'],
      ['Outlook distribution list change','HR','Outlook',1,2,'Service Desk','Resolved',166,'Add colleagues to department mailing list'],
      ['OneDrive sharing policy question','Finance','OneDrive',2,1,'Unassigned','New',2,'Clarify external sharing of financial working files'],
      ['Teams room scheduling issue','Store Operations','Microsoft Teams',2,3,'Workplace IT','In Progress',31,'Shared meeting room not bookable'],
      ['Access request for shared files','Logistics','Device & Access',3,2,'Service Desk','Waiting',48,'Team needs access to operational documentation'],
      ['SharePoint metadata proposal','IT','SharePoint',1,1,'Collaboration IT','New',68,'Propose labels to improve search and discovery']
    ];
    return specs.map((s,i) => ({
      id: 'DW-' + String(i+1).padStart(3,'0'),
      title:s[0], department:s[1], category:s[2], impact:s[3], urgency:s[4],
      priority:priorityFor(s[3],s[4]), owner:s[5], status:s[6],
      createdAt:new Date(now.getTime()-s[7]*3600000).toISOString(), description:s[8]
    }));
  }
  function recommendations(tickets, now) {
    const summary = summarize(tickets, now);
    const list = [];
    if (summary.overdue) list.push(`${summary.overdue} open request(s) are beyond the illustrative response target. Review ownership and urgency.`);
    if (summary.high) list.push(`${summary.high} unresolved high-priority request(s). Review these first in the daily stand-up.`);
    const top = Object.entries(summary.categories).sort((a,b) => b[1]-a[1])[0];
    if (top && top[1] >= 3) list.push(`${top[0]} has the highest request volume (${top[1]}). Consider a knowledge-base article or self-service guide.`);
    if (!list.length) list.push('No immediate bottleneck identified in the sample. Continue monitoring incoming request patterns.');
    return list;
  }
  return {PRIORITIES,STATUSES,CATEGORIES,DEPARTMENTS,OWNERS,FIELDS,priorityFor,slaHours,hoursSince,isOverdue,summarize,toCSV,demoTickets,recommendations};
});
