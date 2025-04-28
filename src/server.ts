import { nanoid } from "nanoid";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  private host: string | null = null;

  constructor(readonly room: Party.Room) {}

  static async onFetch(
    req: Party.Request,
    _lobby: Party.FetchLobby,
    _ctx: Party.ExecutionContext,
  ) {
    const code = nanoid(10);
    const response = new Response(code);

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*"); // Allow any origin, or specify your client origin
    response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    // If it's a preflight OPTIONS request, return just the headers
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: response.headers,
      });
    }

    return response;
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );

    if (!this.host) {
      this.host = conn.id;
    }

    // let's send a message to the connection
    conn.send("hello from server");
  }

  onMessage(message: string, sender: Party.Connection) {
    // if (sender.id !== this.host) {
    //   return;
    // }

    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);
    // as well as broadcast it to all the other connections in the room...
    this.room.broadcast(
      message,
      // ...except for the connection it came from
      [sender.id],
    );
  }
}

Server satisfies Party.Worker;
