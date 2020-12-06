# Shared variable

Distributed system solving the problem of a shared variable. Implementation is based on ring-based coordinator election algorithm - Chang-Roberts.

## Stack

 - TypeScript
 - Deno
 - JSON-RPC 2.0

## Commands

 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2011 --ipTo=127.0.0.1 --portTo=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2012 --ipTo=127.0.0.1 --portTo=2011`