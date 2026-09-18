# Hardlinks

Merged to `develop`.

- Tests: [test/hardlinks.test.ts](../../test/hardlinks.test.ts)
- Implementation: [src/index.ts](../../src/index.ts)
- Board: [status.md](../status.md)
- Plan: [plan.md](../plan.md)
- Prompt: [task.md](../task.md)
- Previous: [Symlinks](symlinks.md)
- Next: [Multi-client](multi-client.md)

Done:

- File hardlinks share inode contents
- Directory hardlinks share children; `getcwd` uses the name you `chdir`'d through
- Refuse linking a directory under itself (`EPERM`)
