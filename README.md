# Shared variable

Distributed system solving the problem of a shared variable. Implementation is based on ring-based coordinator election algorithm - Chang-Roberts.

## Usage

### Running the program

Program needs `--allow-net`, `--allow-read` and `--unstable` flags in order to run. Program also accepts some configuration arguments which are:
 - `--ip` - IP address of the node,
 - `--port` - port of the node,
 - `--ipTo` - IP address of the node to which the node should connect,
 - `--portTo` - port of the node to which the node should connect.

Examples:
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2011 --ipTo=127.0.0.1 --portTo=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2012 --ipTo=127.0.0.1 --portTo=2011`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2012 --ipTo=127.0.0.1 --portTo=2011`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=127.0.0.1 --port=2012 --ipTo=127.0.0.1 --portTo=2011`

### Commands

|      Command      | Description                                              |
| :---------------: | -------------------------------------------------------- |
|     **info**      | prints the node's configuration (ID, address, neighbors) |
|     **read**      | reads the value of the shared variable                   |
| **write <value>** | writes the value to the shared variable                  |
|    **logout**     | logs out from the system leaving its topology correct    |
|      **die**      | exits leaving the system's topology scattered            |

## Implementation notes

Every node in the system has its unique ID and is also uniquely identified by its IP address and port.

Each node has information about its neighbors - previous, next and next-next. Every node also knows who is the system's leader.

When the node is connecting to the system, it calls join on some node already connected to the system. The called node updates neighbor information in itself, in the connecting node and in others node's that need the update.

The leader is used as the store for the shared variable. When any node wants to read value from or write value to the variable, it must do so via the leader. Node must send appropriate message to the leader and it than processes the request (read or write). The leader has also a shared variable counter which increments every time the variable is read or rewritten. This counter supplants functionality of a logical time.

Whenever a read or write request is processed by the leader, it backups its data to its next neighbor. It means that leader information (value of the shared variable and value of the shared variable counter) is saved in two nodes in the system. This ensures that the information is not lost when the leader dies because the node with information backup is preferred to win when the new leader is being voted.

As soon as the system detects that one of the nodes died, the topology repair starts. When node A's next neighbor is missing, it sends notification to its next-next node B to change its previous neighbor. Node A also receives notification with node B's next and saves its address as node A's next-next. Node B is now the new next neighbor of the node A. Node A also sends notification to its previous neighbor node C, so it can change its next-next neighbor to node B.

When the system detects that the leader died, the election of the new leader starts. If the node receives an election message with unknown ID or the node has not already voted and has the backup leader data, it votes for itself. Otherwise the node sends the message to its next. As soon as the node receives election message with its ID, it becomes the leader and notifies all the nodes about it.

## Stack

 - TypeScript
 - Deno 1.5.4
 - JSON-RPC 2.0
