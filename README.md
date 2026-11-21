# Digital Workplace Dashboard

A browser-based dashboard for organizing everyday workplace IT requests. It brings request details, ownership, priorities, and status updates into one view so recurring issues and outstanding work are easier to spot.

Built with HTML, CSS, and vanilla JavaScript. No backend or paid services are required.

## Features

- **Request tracking:** Create requests for Teams, Outlook, SharePoint, OneDrive, device access, and other workplace services.
- **Priority assignment:** Calculate P1–P4 priorities from impact and urgency scores.
- **Workflow updates:** Assign an owner and move requests through New, In Progress, Waiting, and Resolved.
- **Dashboard metrics:** View open requests, high-priority items, overdue requests, and resolution rate.
- **Filtering and reporting:** Search by request details, filter by status or priority, and export records as CSV.
- **Improvement insights:** Highlight urgent work and frequently requested service categories using simple rules.

## Run locally

1. Download the repository as a ZIP and extract it.
2. Open `index.html` in a modern browser.

Or serve the folder locally using Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Using the dashboard

1. Select **+ New request** to enter an issue, department, service category, impact, and urgency.
2. Review the automatically calculated priority in the tracker.
3. Change the assigned owner or status directly in the table.
4. Use the overview and improvement insights to review the request workload.
5. Select **Export CSV** to download the current records or **Reset demo** to restore the sample requests.

## How prioritization works

Each request receives an impact score (1–3) and urgency score (1–3). The product determines the priority:

| Score | Priority |
| --- | --- |
| 9 | P1 — Critical |
| 6 | P2 — High |
| 3–4 | P3 — Medium |
| 1–2 | P4 — Low |

The overdue indicator uses example response targets of 4 hours (P1), 24 hours (P2), 72 hours (P3), and 7 days (P4). These are project assumptions, not service-level commitments.

## Tech stack

- **HTML5:** Page structure and request form
- **CSS3:** Dashboard layout and responsive design
- **JavaScript:** Prioritization logic, table updates, filters, and CSV export
- **Browser localStorage:** Persistence on the current browser and device

## Project files

```text
index.html       Dashboard interface
styles.css       Styles and responsive layout
app.js           UI interactions and browser storage
core.js          Priority rules, metrics, and sample requests
PROJECT_BRIEF.md Project scope and design notes
README.md        Documentation
```

## Current scope

This is a single-user prototype with fictional requests. Data is stored in the browser, not in a shared database, and does not sync between devices. It does not access live Microsoft 365 services. Avoid entering real employee or confidential information.

Potential extensions include a shared database, authentication, role-based permissions, and integrations with workplace service tools.
