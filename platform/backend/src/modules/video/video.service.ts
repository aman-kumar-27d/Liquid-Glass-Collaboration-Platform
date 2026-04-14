import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RoomsService } from '../rooms/rooms.service';
import { JoinCallDto, StartCallDto } from './video.dto';
import { CallParticipant } from './call-participant.entity';
import { VideoCall } from './video-call.entity';

interface AuthUser {
  sub: string;
  companyId: string;
  role: string;
}

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoCall)
    private readonly videoCallsRepository: Repository<VideoCall>,
    @InjectRepository(CallParticipant)
    private readonly callParticipantsRepository: Repository<CallParticipant>,
    private readonly roomsService: RoomsService
  ) {}

  async startCall(dto: StartCallDto, actor: AuthUser) {
    await this.roomsService.ensureMembership(dto.roomId, actor as any);

    const existing = await this.videoCallsRepository.findOne({
      where: {
        roomId: dto.roomId,
        companyId: actor.companyId,
        endedAt: IsNull()
      },
      relations: { participants: true }
    });

    if (existing) {
      return { success: true, data: existing, error: null, meta: { reused: true } };
    }

    const call = await this.videoCallsRepository.save(
      this.videoCallsRepository.create({
        companyId: actor.companyId,
        roomId: dto.roomId,
        startedBy: actor.sub
      })
    );

    await this.callParticipantsRepository.save(
      this.callParticipantsRepository.create({
        callId: call.id,
        userId: actor.sub
      })
    );

    return this.getCall(call.id, actor);
  }

  async joinCall(dto: JoinCallDto, actor: AuthUser) {
    const call = await this.requireActiveCall(dto.callId, actor);
    await this.roomsService.ensureMembership(call.roomId, actor as any);

    const existing = await this.callParticipantsRepository.findOne({
      where: { callId: call.id, userId: actor.sub }
    });

    if (existing) {
      existing.leftAt = null;
      const saved = await this.callParticipantsRepository.save(existing);
      return { success: true, data: saved, error: null, meta: null };
    }

    const participant = await this.callParticipantsRepository.save(
      this.callParticipantsRepository.create({
        callId: call.id,
        userId: actor.sub
      })
    );

    return { success: true, data: participant, error: null, meta: null };
  }

  async leaveCall(callId: string, actor: AuthUser) {
    const call = await this.requireActiveCall(callId, actor);
    await this.roomsService.ensureMembership(call.roomId, actor as any);

    const participant = await this.callParticipantsRepository.findOne({
      where: { callId, userId: actor.sub }
    });
    if (!participant) {
      throw new NotFoundException('Call participant not found');
    }

    participant.leftAt = new Date();
    const saved = await this.callParticipantsRepository.save(participant);
    return { success: true, data: saved, error: null, meta: null };
  }

  async endCall(callId: string, actor: AuthUser) {
    const call = await this.requireActiveCall(callId, actor);
    await this.roomsService.ensureMembership(call.roomId, actor as any);

    if (call.startedBy !== actor.sub) {
      throw new ForbiddenException('Only the call starter can end the call');
    }

    call.endedAt = new Date();
    const saved = await this.videoCallsRepository.save(call);
    return { success: true, data: saved, error: null, meta: null };
  }

  async getActiveRoomCall(roomId: string, actor: AuthUser) {
    await this.roomsService.ensureMembership(roomId, actor as any);
    const call = await this.videoCallsRepository.findOne({
      where: {
        roomId,
        companyId: actor.companyId,
        endedAt: IsNull()
      },
      relations: { participants: true }
    });

    return { success: true, data: call, error: null, meta: null };
  }

  async getCall(callId: string, actor: AuthUser) {
    const call = await this.requireActiveCall(callId, actor);
    return { success: true, data: call, error: null, meta: null };
  }

  private async requireActiveCall(callId: string, actor: AuthUser) {
    const call = await this.videoCallsRepository.findOne({
      where: { id: callId, companyId: actor.companyId },
      relations: { participants: true }
    });

    if (!call || call.endedAt) {
      throw new NotFoundException('Active call not found');
    }

    return call;
  }
}
