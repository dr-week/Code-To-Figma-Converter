# Persistence module

**Inactive reference, 2026-09-12:** no database is required or selected for the current conversion task. The earlier schema proposal below is retained for history and is not an implementation requirement.

## Timing and database

Use files for the local conversion spike. Add PostgreSQL when the portfolio dashboard needs durable projects and job history. The converter must still run without a database through a filesystem adapter. PostgreSQL is an engineering choice, not a Swiss certification. [PostgreSQL capabilities](https://www.postgresql.org/about/)

## Proposed relational model

| Table | Key fields and constraints |
| --- | --- |
| projects | UUID primary key, display name, registered capture configuration, created timestamp. |
| capture_jobs | UUID primary key, project foreign key, state, attempt, engine version, config hash, idempotency key, timestamps, error code. Unique project/idempotency key. |
| artifacts | UUID primary key, job foreign key, kind, storage key, content hash, byte size, schema version. |
| import_runs | UUID primary key, artifact foreign key, target file reference, root node ID, importer version, result and timestamps. |
| validation_reports | UUID primary key, job/import references, metric version, summary JSONB and detailed report artifact reference. |

Use foreign keys, explicit status constraints, parameterized queries and migration review. Store screenshots and scene bundles as files locally or object-storage blobs later, with hashes and metadata in PostgreSQL. Do not store repository archives, cookies, credentials or every scene node as database rows by default.

## Job lifecycle

`queued -> running -> succeeded | failed | cancelled`. Workers claim jobs atomically with leases; expiration allows bounded retries. Record capture completion separately from plugin import completion: the user's editor may be closed. A database transaction cannot atomically commit a Figma edit. Use artifact identity and recorded import attempts to reconcile uncertain outcomes.

If a multiuser product is later approved, add ownership/access rules to every project-scoped query and object fetch before exposing it publicly. A single-user portfolio does not justify claiming tenant isolation.

## Operational evidence

Migration from an empty database, constraint tests, retry/idempotency tests and a backup/restore exercise are required when persistence ships. Document artifact retention and delete both blob and metadata consistently. Back up recoverable metadata and necessary artifacts; do not put secrets or private captures into demo backups.
