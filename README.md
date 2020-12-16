# Shared variable

Distributed system solving the problem of a shared variable. Implementation is based on ring-based coordinator election algorithm - Chang-Roberts.

## Usage

### Running the program

You need to have Deno installed on your computer in order to run the program. The installation guide can be found [here](https://deno.land/#installation).

Program needs to be run with `--allow-net`, `--allow-read` and `--unstable` flags. Program also accepts configuration arguments which are:
 - `--ip` - IP address of the node,
 - `--port` - port of the node,
 - `--ipTo` - IP address of the node to which the node should connect,
 - `--portTo` - port of the node to which the node should connect.

Examples:
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=192.168.0.59 --port=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=192.168.56.111 --port=2010 --ipTo=192.168.0.59 --portTo=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=192.168.56.112 --port=2010 --ipTo=192.168.56.111 --portTo=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=192.168.56.113 --port=2010 --ipTo=192.168.56.112 --portTo=2010`
 - `deno run --allow-net --allow-read --unstable .\cli.ts --ip=192.168.56.114 --port=2010 --ipTo=192.168.56.113 --portTo=2010`

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

When the node is connecting to the system, it calls join on some node that is already connected to the system. The called node from the system updates neighbor information in itself, in the connecting node and in others nodes that need the update.

The leader is used as a store for the shared variable. When any node wants to read the value from or write a value to the variable, it must do so via the leader. Node must send appropriate message to the leader which than processes the request (read or write). The leader has also a shared variable counter which increments every time the variable is read or rewritten. This counter supplants functionality of a logical time in the system.

Whenever a read or write request is processed by the leader, it backups its data to its next neighbor. It means that leader data (value of the shared variable and value of the shared variable counter) can be found in two nodes in the system, however, it is accessed only via the leader node. The backup functionality ensures that the leader data is not lost when the leader dies because the information is stored in leader's next neighbor. Node with the leader data backup is also preferred to win in the leader election.

As soon as the system detects that one of the nodes died, is starts the process of topology repair. When node A's next neighbor is missing, node A sends notification to its next-next neighbor node B to change its previous neighbor. Node A also receives notification with node B's next neighbor and saves its address as node A's next-next neighbor. Node B is now the new next neighbor of the node A. Node A also sends notification to its previous neighbor node C, so node C can change its next-next neighbor to node B.

When the system detects that the leader died, the election of the new leader starts. If the node receives an election message with unknown ID or the node has not already voted and has the backup leader data, it votes for itself. Otherwise the node sends the message to its next with the same content. As soon as the node receives an election message with its ID, it becomes the leader and notifies all the other nodes about it.

## Stack

 - TypeScript
 - Deno 1.6.0
 - JSON-RPC 2.0
