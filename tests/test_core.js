'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const core = require('../core.js');
test('priority matrix translates impact and urgency into 4 classes', () => {
  assert.equal(core.priorityFor(3,3),'P1 - Critical');
  assert.equal(core.priorityFor(3,2),'P2 - High');
  assert.equal(core.priorityFor(2,2),'P3 - Medium');
  assert.equal(core.priorityFor(1,1),'P4 - Low');
  assert.throws(() => core.priorityFor(9,1));
});
test('ticket summary calculates consistent totals', () => {
  const tickets = core.demoTickets(new Date('2026-11-18T12:00:00Z'));
  const stats = core.summarize(tickets,new Date('2026-11-18T12:00:00Z'));
  assert.equal(stats.total, 12);
  assert.equal(stats.total,stats.active+stats.resolved);
  assert.equal(stats.counts['New']+stats.counts['In Progress']+stats.counts['Waiting']+stats.counts['Resolved'],stats.total);
  assert.ok(stats.resolutionRate >= 0 && stats.resolutionRate <= 100);
});
test('resolved requests are never overdue', () => {
  const ticket = {...core.demoTickets(new Date('2026-11-18T12:00:00Z'))[0],status:'Resolved'};
  assert.equal(core.isOverdue(ticket,new Date('2026-11-25T12:00:00Z')),false);
});
test('CSV properly escapes commas, quotes and spreadsheet formulas', () => {
  const t = {...core.demoTickets()[0],title:'="danger", "test"'};
  const csv = core.toCSV([t]);
  assert.ok(csv.includes('"\'= "') === false); // Avoid malformed CSV delimiter sequences
  assert.ok(csv.includes('"\'=""danger"", ""test"""'));
  assert.ok(csv.startsWith('id,createdAt,title'));
});
test('recommendations give actionable process improvement ideas', () => {
  const notes = core.recommendations(core.demoTickets(new Date('2026-11-18T12:00:00Z')),new Date('2026-11-18T12:00:00Z'));
  assert.ok(notes.length >= 1);
  assert.ok(notes.some(x => x.includes('knowledge-base')));
});
