# Project Brief — Digital Workplace Request & Improvement Dashboard

## Problem and target user
In a fictional organization, IT workplace-related requests arrive from HR, Finance, Store Operations, Sales and Logistics. Without consistent classification and reporting, teams can lose visibility of ownership, urgency, bottlenecks and recurring service questions. Target users: digital workplace coordinators and IT operations teams.

## Goals
1. Establish a structured and transparent request intake process.
2. Translate impact and urgency into a repeatable prioritization concept.
3. Offer simple daily operational metrics and escalation prompts.
4. Identify high-volume categories that justify better self-service documentation.

## Scope, assumptions and data
- **Implemented:** Browser-only single-user prototype with synthetic tickets; no backend.
- **Data fields:** ID, title, department, service category, impact, urgency, priority, assigned owner, status, created timestamp and description.
- **Illustrative SLA targets:** P1 4h, P2 24h, P3 72h, P4 7d. Not contractual.
- **Privacy:** Use only invented requests; records are saved locally in browser storage.

## Evidence and acceptance criteria
- Creating a request assigns a priority deterministically according to the matrix.
- Changing status or owner persists after page refresh.
- Dashboard metrics update and remain consistent with table counts.
- CSV export contains all original fields and safely escapes potential spreadsheet formulas.
- User can restore the preloaded fictional demo data.
- Automated tests pass.

## Future enhancement: Microsoft 365 proof-of-concept
Using a legitimately provisioned development environment: create a SharePoint list, a request intake form, a Power Automate routing/notification flow, and a Power BI or Excel adoption dashboard. Validate permissions and retention, then document a small change-management concept. **Not implemented in this version.**

## Reflection
A technical tool is useful only if its process and ownership rules are understood. In this prototype, a straightforward priority matrix and transparent KPIs were favored over opaque AI-based predictions.
