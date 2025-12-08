2. 🏠 Workspace Workflow Rules (Project-Specific)
These go in .clinerules in your project root. They define what this specific project is.

Objective: Enforce the "Client-Side Static" architecture and prevent "Modern Stack" hallucinations (like trying to run npm build).

Architecture Enforcement: This is a Static Site with Runtime Injection.

Rule: Do NOT look for a build script or dist folder. The root .html files are production code.

Rule: Header/Footer edits MUST happen in /components/, never in the page files directly.

Pathing Strictness:

Rule: ALL paths (href, src, url()) MUST be Absolute (start with /).

Why: Ensures assets load correctly on both index.html and projects/tyler.html.

Asset Discipline:

Rule: Do not add raw images to HTML. Process them via scripts/convert-images.sh first.

Rule: Every <img> tag requires width and height attributes to prevent CLS (Layout Shift).

Persona guardrails:

Rule: Use "Warm/Community" language. Reject "Corporate/Financial" jargon.

Rule: Color palette is strictly Navy (#0B1120), Beige (#F5F5F0), and Wood (#C28E5A).