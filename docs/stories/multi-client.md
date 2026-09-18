# Multi-client

Merged to `develop`.

- Tests: [test/multi-client.test.ts](../../test/multi-client.test.ts)
- Implementation: [src/index.ts](../../src/index.ts)
- Board: [status.md](../status.md)
- Plan: [plan.md](../plan.md)
- Prompt: [task.md](../task.md)
- Previous: [Hardlinks](hardlinks.md)
- Next: [Rename, unlink, and find](rename-and-find.md)

Done:

- Many `connect(fs)` shells share one tree
- Each shell has its own cwd
- `readdir` lists a directory and hides names starting with `.`
- 500 shells can each `mkdir` a unique name; a 501st `readdir` sees all of them
