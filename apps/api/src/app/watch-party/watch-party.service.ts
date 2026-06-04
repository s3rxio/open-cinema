import { Injectable, Logger } from "@nestjs/common";
import { randomBytes, randomUUID } from "crypto";
import { RedisService } from "../redis/redis.service";
import {
  CHAT_MAX_MESSAGES,
  redisKeys,
  ROOM_CODE_LENGTH,
  ROOM_TTL_SECONDS
} from "./watch-party.constants";
import type {
  WatchPartyChatMessage,
  WatchPartyContentType,
  WatchPartyMember,
  WatchPartyPlaybackState,
  WatchPartyRoom
} from "./watch-party.types";

@Injectable()
export class WatchPartyService {
  private readonly logger = new Logger(WatchPartyService.name);

  constructor(private readonly redis: RedisService) {}

  async createRoom(
    contentId: string,
    contentType: WatchPartyContentType,
    hostUserId: string
  ): Promise<WatchPartyRoom> {
    const roomId = randomUUID();
    const code = await this.generateUniqueCode();
    const createdAt = new Date().toISOString();

    const room: WatchPartyRoom = {
      id: roomId,
      code,
      contentId,
      contentType,
      hostUserId,
      createdAt
    };

    const pipeline = this.redis.client.pipeline();
    pipeline.hset(redisKeys.room(roomId), room);
    pipeline.set(redisKeys.code(code), roomId, "EX", ROOM_TTL_SECONDS);
    pipeline.expire(redisKeys.room(roomId), ROOM_TTL_SECONDS);
    pipeline.hset(redisKeys.state(roomId), {
      currentTime: "0",
      isPlaying: "false",
      updatedAt: createdAt,
      updatedByUserId: hostUserId
    });
    pipeline.expire(redisKeys.state(roomId), ROOM_TTL_SECONDS);
    await pipeline.exec();

    return room;
  }

  async getRoomByCode(code: string): Promise<WatchPartyRoom | null> {
    const roomId = await this.redis.client.get(redisKeys.code(code));
    if (!roomId) return null;
    return this.getRoom(roomId);
  }

  async getRoom(roomId: string): Promise<WatchPartyRoom | null> {
    const data = await this.redis.client.hgetall(redisKeys.room(roomId));
    if (!data.id) return null;
    return data as unknown as WatchPartyRoom;
  }

  async touchRoom(roomId: string, code: string): Promise<void> {
    const pipeline = this.redis.client.pipeline();
    pipeline.expire(redisKeys.room(roomId), ROOM_TTL_SECONDS);
    pipeline.expire(redisKeys.code(code), ROOM_TTL_SECONDS);
    pipeline.expire(redisKeys.members(roomId), ROOM_TTL_SECONDS);
    pipeline.expire(redisKeys.state(roomId), ROOM_TTL_SECONDS);
    pipeline.expire(redisKeys.chat(roomId), ROOM_TTL_SECONDS);
    await pipeline.exec();
  }

  async addMember(roomId: string, member: WatchPartyMember): Promise<void> {
    await this.redis.client.hset(
      redisKeys.members(roomId),
      member.userId,
      JSON.stringify(member)
    );
    await this.redis.client.expire(redisKeys.members(roomId), ROOM_TTL_SECONDS);
  }

  async removeMember(roomId: string, userId: string): Promise<void> {
    await this.redis.client.hdel(redisKeys.members(roomId), userId);
  }

  async getMembers(roomId: string): Promise<WatchPartyMember[]> {
    const raw = await this.redis.client.hgetall(redisKeys.members(roomId));
    return Object.values(raw).map(
      value => JSON.parse(value) as WatchPartyMember
    );
  }

  async setHost(
    roomId: string,
    hostUserId: string
  ): Promise<WatchPartyRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    await this.redis.client.hset(
      redisKeys.room(roomId),
      "hostUserId",
      hostUserId
    );
    return { ...room, hostUserId };
  }

  async updateRoomContent(
    roomId: string,
    contentId: string,
    hostUserId: string
  ): Promise<{
    room: WatchPartyRoom;
    playback: WatchPartyPlaybackState;
  } | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    await this.redis.client.hset(
      redisKeys.room(roomId),
      "contentId",
      contentId
    );

    const playback = await this.savePlaybackState(roomId, {
      currentTime: 0,
      isPlaying: false,
      updatedByUserId: hostUserId
    });

    return { room: { ...room, contentId }, playback };
  }

  async getPlaybackState(
    roomId: string
  ): Promise<WatchPartyPlaybackState | null> {
    const data = await this.redis.client.hgetall(redisKeys.state(roomId));
    if (!data.updatedAt) return null;

    return {
      currentTime: Number(data.currentTime) || 0,
      isPlaying: data.isPlaying === "true",
      updatedAt: data.updatedAt,
      updatedByUserId: data.updatedByUserId
    };
  }

  async savePlaybackState(
    roomId: string,
    state: Omit<WatchPartyPlaybackState, "updatedAt"> & { updatedAt?: string }
  ): Promise<WatchPartyPlaybackState> {
    const updatedAt = state.updatedAt ?? new Date().toISOString();
    const payload = {
      currentTime: String(state.currentTime),
      isPlaying: String(state.isPlaying),
      updatedAt,
      updatedByUserId: state.updatedByUserId
    };

    await this.redis.client.hset(redisKeys.state(roomId), payload);
    await this.redis.client.expire(redisKeys.state(roomId), ROOM_TTL_SECONDS);

    return {
      currentTime: state.currentTime,
      isPlaying: state.isPlaying,
      updatedAt,
      updatedByUserId: state.updatedByUserId
    };
  }

  async addChatMessage(
    roomId: string,
    message: WatchPartyChatMessage
  ): Promise<WatchPartyChatMessage> {
    await this.redis.client.rpush(
      redisKeys.chat(roomId),
      JSON.stringify(message)
    );
    await this.redis.client.ltrim(
      redisKeys.chat(roomId),
      -CHAT_MAX_MESSAGES,
      -1
    );
    await this.redis.client.expire(redisKeys.chat(roomId), ROOM_TTL_SECONDS);
    return message;
  }

  async getChatHistory(roomId: string): Promise<WatchPartyChatMessage[]> {
    const raw = await this.redis.client.lrange(redisKeys.chat(roomId), 0, -1);
    return raw.map(item => JSON.parse(item) as WatchPartyChatMessage);
  }

  async deleteRoom(roomId: string, code: string): Promise<void> {
    const pipeline = this.redis.client.pipeline();
    pipeline.del(redisKeys.room(roomId));
    pipeline.del(redisKeys.code(code));
    pipeline.del(redisKeys.members(roomId));
    pipeline.del(redisKeys.state(roomId));
    pipeline.del(redisKeys.chat(roomId));
    await pipeline.exec();
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt++) {
      const code = randomBytes(4)
        .toString("hex")
        .slice(0, ROOM_CODE_LENGTH)
        .toUpperCase();
      const exists = await this.redis.client.exists(redisKeys.code(code));
      if (!exists) return code;
    }

    this.logger.warn(
      "Failed to generate unique room code, using UUID fragment"
    );
    return randomUUID()
      .replace(/-/g, "")
      .slice(0, ROOM_CODE_LENGTH)
      .toUpperCase();
  }
}
