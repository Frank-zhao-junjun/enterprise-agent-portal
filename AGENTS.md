# OpenAI Airlines Agent Demo

## Project Overview
A single-file interactive demo showcasing a Hub-and-Spoke multi-agent architecture for airline customer service, built with pure HTML/CSS/JavaScript.

## Tech Stack
- **Framework**: Native HTML/CSS/JS (no build step)
- **Template**: native-static (served via Python SimpleHTTPServer on port 5000)
- **Styling**: Inline CSS with CSS custom properties
- **No dependencies**: Pure vanilla implementation

## Project Structure
```
.
├── index.html          # Single-file interactive demo (all 3 tabs)
├── styles/main.css     # Unused template artifact (can be removed)
└── .coze               # Build/run configuration
```

## Key Features
1. **Tab 1 - Interactive Demo**: Chat panel + Agent view with 3 preset scenarios (Seat Change, Flight Delay, Guardrail Trigger), Auto Play / Next Step controls
2. **Tab 2 - Architecture**: Hub-and-Spoke SVG diagram, concept cards (Hub, Handoff, Input Guardrails), 4-step flow diagram, tech stack
3. **Tab 3 - Agent Details**: 6 Agent cards with expandable tool/param/handoff details, Handoff relationship matrix

## Development
- Service auto-starts on port 5000 via `python -m http.server`
- HMR not available; manual refresh needed after changes
- All data is front-end mock; no backend API

## Agents
| Agent | Color | Icon | Tools | Handoffs |
|-------|-------|------|-------|----------|
| Triage Agent | #2563eb | 🔀 | get_trip_details | All 5 spoke agents |
| Flight Information Agent | #059669 | ✈️ | flight_status_tool, get_matching_flights | Triage Agent |
| Booking and Cancellation Agent | #7c3aed | 🎫 | cancel_flight, get_matching_flights, book_new_flight | Triage Agent |
| Seat and Special Services Agent | #dc2626 | 💺 | update_seat, assign_special_service_seat, display_seat_map | Triage Agent |
| FAQ Agent | #d97706 | ❓ | faq_lookup_tool | Triage Agent |
| Refunds and Compensation Agent | #0891b2 | 💰 | issue_compensation, faq_lookup_tool | Triage Agent |

## Build & Run
- Dev: `coze dev` (serves on port 5000)
- Deploy: `coze build && coze start`
