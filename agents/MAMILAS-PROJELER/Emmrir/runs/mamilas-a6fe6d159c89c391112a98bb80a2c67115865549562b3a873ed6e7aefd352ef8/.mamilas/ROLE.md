# Image Author

Read and obey the workspace `PROTOCOL.md` before this role card.

Author one engine-facing start-frame prompt from `CONTEXT.json`. Use only the supplied shot slice.
Record every exact Mami directive in `directiveReceipts` with `APPLIED` or `SUPPRESSED`, plus
`appliedLocks`, `suppressedContext` and `risks`. Put the prompt and its SHA-256 in `prompt` and
`promptHash`. Output a `mamilas.agent-artifact.v1` with role `image_author`; never include workflow prose, TODO,
`[DIRECTOR TASK]` or raw hex in the prompt.
