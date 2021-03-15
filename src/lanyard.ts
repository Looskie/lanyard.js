import * as WebSocket from "ws";
import { EventEmitter } from "events";

import {
  WSMessage,
  InitState,
  PresenceState,
  LanyardResponse,
  Data,
} from "./types";

import * as fetch from "node-fetch";

interface ClientProps {
  subscribe_to_ids: string[];
  hbt_interval?: number;
}

export declare interface Lanyard {
  presences_cache: PresenceState;
  get: (id: string) => Promise<LanyardResponse>;
  on(event: "init_state", listener: (state: PresenceState) => void): this;
  on(event: "presence_update", listener: (data: Data) => void): this;
  on(event: string, listener: Function): this;
}

export class Lanyard extends EventEmitter {
  private subscribe_to_ids: string[];
  private socket;

  heartbeatInterval: number;

  public presences_cache: PresenceState;

  constructor({ subscribe_to_ids, hbt_interval }: ClientProps) {
    super();
    if (!subscribe_to_ids) {
      throw new Error("Specify atleast 1 ID to subscribe to");
    }
    this.subscribe_to_ids = subscribe_to_ids;
    this.heartbeatInterval = hbt_interval ?? 30000;
    this.connect();
  }

  get = async (id: string): Promise<LanyardResponse> => {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
    return (await response.json()) as LanyardResponse;
  };

  connect = () => {
    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    ws.on("open", () => {
      this.socket = ws;
      this.sendRaw({
        op: 2,
        d: {
          subscribe_to_ids: this.subscribe_to_ids,
        },
      });
      this.startHeartbeating();
      this.emit("ready");
    });
    ws.on("message", this.messageHandler);
  };

  messageHandler = (msg: string) => {
    const { op, d, t }: WSMessage = JSON.parse(msg);
    switch (t) {
      case "INIT_STATE": {
        const presences_map: InitState = d;
        this.presences_cache = presences_map;
        this.emit("init", presences_map);
        return;
      }
      case "PRESENCE_UPDATE": {
        this.presences_cache = {
          ...this.presences_cache,
          [d?.discord_user.id]: d,
        };
        this.emit("PRESENCE_UPDATE", d);
      }
    }
  };

  sendRaw = (data: { op: number; d?: any }) => {
    this.socket.send(JSON.stringify(data));
  };

  startHeartbeating = () => {
    setInterval(() => {
      this.sendRaw({ op: 3 });
    }, this.heartbeatInterval);
  };
}
