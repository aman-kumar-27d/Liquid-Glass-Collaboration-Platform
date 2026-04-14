import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ScreenShare } from './screen-share.entity';
import { StartScreenShareDto } from './screen.dto';
import { VideoCall } from '../video/video-call.entity';
import { RoomsService } from '../rooms/rooms.service';

interface AuthUser {
  sub: string;
  companyId: string;
  role: string;
}

@Injectable()
export class ScreenService {
  constructor(
    @InjectRepository(ScreenShare)
    private readonly screenSharesRepository: Repository<ScreenShare>,
    @InjectRepository(VideoCall)
    private readonly videoCallsRepository: Repository<VideoCall>,
    private readonly roomsService: RoomsService
  ) {}

  async startShare(dto: StartScreenShareDto, actor: AuthUser) {
    const call = await this.videoCallsRepository.findOne({
      where: { id: dto.callId, companyId: actor.companyId, endedAt: IsNull() }
    });
    if (!call) {
      throw new NotFoundException('Active call not found');
    }

    await this.roomsService.ensureMembership(call.roomId, actor as any);

    const activeShare = await this.screenSharesRepository.findOne({
      where: { callId: dto.callId, userId: actor.sub, endedAt: IsNull() }
    });

    if (activeShare) {
      return { success: true, data: activeShare, error: null, meta: { reused: true } };
    }

    const share = await this.screenSharesRepository.save(
      this.screenSharesRepository.create({
        companyId: actor.companyId,
        callId: dto.callId,
        userId: actor.sub
      })
    );

    return { success: true, data: share, error: null, meta: null };
  }

  async stopShare(callId: string, actor: AuthUser) {
    const share = await this.screenSharesRepository.findOne({
      where: { callId, userId: actor.sub, companyId: actor.companyId, endedAt: IsNull() }
    });

    if (!share) {
      throw new NotFoundException('Active screen share not found');
    }

    share.endedAt = new Date();
    const saved = await this.screenSharesRepository.save(share);
    return { success: true, data: saved, error: null, meta: null };
  }
}
