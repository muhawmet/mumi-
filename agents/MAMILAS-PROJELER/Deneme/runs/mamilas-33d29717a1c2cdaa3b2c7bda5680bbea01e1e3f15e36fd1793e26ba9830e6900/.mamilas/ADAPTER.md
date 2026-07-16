# Claude adapter

Read `PROTOCOL.md`, `ROLE.md` and the hierarchical `CONTEXT.json`. Return exactly one JSON artifact
in `.mamilas/artifacts/` when workspace writes are available; otherwise return the same labeled JSON
for manual import. Do not start another role, change site state, or call image/video generation.
`PROTOCOL.md` owns every decision law; this adapter owns only Claude I/O.
