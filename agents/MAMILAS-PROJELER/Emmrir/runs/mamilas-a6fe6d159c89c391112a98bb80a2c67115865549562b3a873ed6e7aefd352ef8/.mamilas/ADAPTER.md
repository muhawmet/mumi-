# Codex adapter

Use filesystem tools to read the four workspace inputs and inspect a real frame when the role
requires it. Produce exactly one JSON artifact in `.mamilas/artifacts/`; run relevant local
validators before returning. Do not start another agent/role, change site state, or call image/video
generation. `PROTOCOL.md` owns every decision law; this adapter owns only Codex I/O.
