import { randomUUID } from "crypto";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthJwtPayload } from "../auth/auth.types";
import { UserService } from "../user/user.service";
import {
  CHAT_MAX_TEXT_LENGTH,
  WATCH_PARTY_NAMESPACE
} from "./watch-party.constants";
import { WatchPartyService } from "./watch-party.service";
import type {
  WatchPartyChatMessage,
  WatchPartyContentType,
  WatchPartyMember,
  WatchPartyPlaybackState,
  WatchPartyRoom,
  WatchPartySocketUser
} from "./watch-party.types";

interface WatchPartySocketData {
  user?: WatchPartySocketUser;
  roomId?: string;
}

type WatchPartySocket = Socket & { data: WatchPartySocketData };

interface RoomJoinedPayload {
  room: WatchPartyRoom;
  members: WatchPartyMember[];
  playback: WatchPartyPlaybackState | null;
  chat: WatchPartyChatMessage[];
  isHost: boolean;
}

@WebSocketGateway({
  namespace: WATCH_PARTY_NAMESPACE,
  cors: {
    origin: true,
    credentials: true
  }
})
export class WatchPartyGateway
  implements OnGatewayInit, OnGatewayDisconnect
{
  private readonly logger = new Logger(WatchPartyGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly watchPartyService: WatchPartyService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  afterInit(server: Server) {
    server.use((socket, next) => {
      void this.authenticateSocket(socket as WatchPartySocket)
        .then(() => next())
        .catch(error => {
          this.logger.debug(
            `Watch party connection rejected: ${String(error)}`
          );
          next(error instanceof Error ? error : new Error("Unauthorized"));
        });
    });
  }

  async handleDisconnect(client: WatchPartySocket) {
    const roomId = client.data?.roomId;
    if (!roomId || !client.data?.user) return;

    await this.leaveRoom(client, roomId, { notifySelf: false });
  }

  @SubscribeMessage("room:create")
  async handleCreateRoom(
    @ConnectedSocket() client: WatchPartySocket,
    @MessageBody()
    body: { contentId: string; contentType: WatchPartyContentType }
  ) {
    const user = this.requireUser(client);
    if (!user) return { ok: false };

    if (!body?.contentId || !body?.contentType) {
      return this.emitError(client, "Укажите контент для комнаты");
    }

    if (client.data.roomId) {
      await this.leaveRoom(client, client.data.roomId);
    }

    const room = await this.watchPartyService.createRoom(
      body.contentId,
      body.contentType,
      user.id
    );

    await this.joinRoom(client, room);
    return { ok: true };
  }

  @SubscribeMessage("room:join")
  async handleJoinRoom(
    @ConnectedSocket() client: WatchPartySocket,
    @MessageBody()
    body: { roomId?: string; code?: string; contentId?: string }
  ) {
    if (!this.requireUser(client)) return { ok: false };

    const room =
      (body.roomId
        ? await this.watchPartyService.getRoom(body.roomId)
        : null) ??
      (body.code ? await this.watchPartyService.getRoomByCode(body.code) : null);

    if (!room) {
      return this.emitError(client, "Комната не найдена");
    }

    if (body.contentId && body.contentId !== room.contentId) {
      return this.emitError(
        client,
        "Эта комната создана для другого видео"
      );
    }

    if (client.data.roomId && client.data.roomId !== room.id) {
      await this.leaveRoom(client, client.data.roomId);
    }

    await this.joinRoom(client, room);
    return { ok: true };
  }

  @SubscribeMessage("room:leave")
  async handleLeaveRoom(@ConnectedSocket() client: WatchPartySocket) {
    if (!client.data.roomId) return { ok: true };
    await this.leaveRoom(client, client.data.roomId);
    return { ok: true };
  }

  @SubscribeMessage("chat:send")
  async handleChatSend(
    @ConnectedSocket() client: WatchPartySocket,
    @MessageBody() body: { text?: string }
  ) {
    const user = this.requireUser(client);
    if (!user) return { ok: false };

    const roomId = client.data.roomId;
    if (!roomId) {
      return this.emitError(client, "Вы не в комнате");
    }

    const text = body?.text?.trim();
    if (!text || text.length > CHAT_MAX_TEXT_LENGTH) {
      return this.emitError(
        client,
        `Сообщение должно быть от 1 до ${CHAT_MAX_TEXT_LENGTH} символов`
      );
    }

    const message = await this.watchPartyService.addChatMessage(roomId, {
      id: randomUUID(),
      userId: user.id,
      username: user.username,
      text,
      createdAt: new Date().toISOString()
    });

    this.server.to(roomId).emit("chat:message", message);
    return { ok: true };
  }

  @SubscribeMessage("player:update")
  async handlePlayerUpdate(
    @ConnectedSocket() client: WatchPartySocket,
    @MessageBody()
    body: { currentTime?: number; isPlaying?: boolean }
  ) {
    const user = this.requireUser(client);
    if (!user) return { ok: false };

    const roomId = client.data.roomId;
    if (!roomId) {
      return this.emitError(client, "Вы не в комнате");
    }

    const room = await this.watchPartyService.getRoom(roomId);
    if (!room) {
      return this.emitError(client, "Комната не найдена");
    }

    if (room.hostUserId !== user.id) {
      return this.emitError(client, "Только ведущий может управлять воспроизведением");
    }

    const currentTime =
      typeof body.currentTime === "number" && Number.isFinite(body.currentTime)
        ? Math.max(0, body.currentTime)
        : 0;
    const isPlaying = Boolean(body.isPlaying);

    const playback = await this.watchPartyService.savePlaybackState(roomId, {
      currentTime,
      isPlaying,
      updatedByUserId: user.id
    });

    client.to(roomId).emit("player:sync", playback);
    return { ok: true };
  }

  private async joinRoom(client: WatchPartySocket, room: WatchPartyRoom) {
    const user = client.data.user;
    if (!user) return;

    const member: WatchPartyMember = {
      userId: user.id,
      username: user.username,
      joinedAt: new Date().toISOString()
    };

    await this.watchPartyService.addMember(room.id, member);
    await this.watchPartyService.touchRoom(room.id, room.code);

    await client.join(room.id);
    client.data.roomId = room.id;

    const members = await this.watchPartyService.getMembers(room.id);
    const playback = await this.watchPartyService.getPlaybackState(room.id);
    const chat = await this.watchPartyService.getChatHistory(room.id);

    const payload: RoomJoinedPayload = {
      room,
      members,
      playback,
      chat,
      isHost: room.hostUserId === user.id
    };

    client.emit("room:joined", payload);
    client.to(room.id).emit("room:member-joined", {
      member,
      members
    });
  }

  private async leaveRoom(
    client: WatchPartySocket,
    roomId: string,
    options: { notifySelf?: boolean } = { notifySelf: true }
  ) {
    const userId = client.data?.user?.id;
    if (!userId) return;

    await client.leave(roomId);
    client.data.roomId = undefined;

    await this.watchPartyService.removeMember(roomId, userId);

    const room = await this.watchPartyService.getRoom(roomId);
    let members = await this.watchPartyService.getMembers(roomId);

    if (room && room.hostUserId === userId && members.length > 0) {
      const nextHost = members[0];
      const updated = await this.watchPartyService.setHost(roomId, nextHost.userId);
      if (updated) {
        room.hostUserId = updated.hostUserId;
        this.server.to(roomId).emit("room:host-changed", {
          hostUserId: updated.hostUserId,
          username: nextHost.username
        });
      }
    }

    members = await this.watchPartyService.getMembers(roomId);

    this.server.to(roomId).emit("room:member-left", {
      userId,
      username: client.data.user?.username ?? "unknown",
      members
    });

    if (options.notifySelf !== false) {
      client.emit("room:left");
    }

    if (members.length === 0 && room) {
      await this.watchPartyService.deleteRoom(roomId, room.code);
    }
  }

  private async authenticateSocket(client: WatchPartySocket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      throw new Error("Missing token");
    }

    const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token);
    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw new Error("User not found");
    }

    client.data.user = { id: user.id, username: user.username };
  }

  private requireUser(client: WatchPartySocket): WatchPartySocketUser | null {
    const user = client.data?.user;
    if (!user) {
      this.emitError(client, "Требуется авторизация");
      return null;
    }
    return user;
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.length > 0) {
      return authToken;
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === "string" && queryToken.length > 0) {
      return queryToken;
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      return header.slice(7);
    }

    return null;
  }

  private emitError(client: WatchPartySocket, message: string) {
    client.emit("room:error", { message });
    return { ok: false, message };
  }
}
