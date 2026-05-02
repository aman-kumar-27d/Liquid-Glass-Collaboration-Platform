import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { AnalyticsService } from '../analytics/analytics.service';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { LoginDto, RegisterOwnerDto } from './auth.dto';
import { AuditLog } from './audit-log.entity';
import { Session } from './session.entity';

interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>,
    private readonly analyticsService: AnalyticsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async registerOwner(dto: RegisterOwnerDto, context: SessionContext) {
    const existingUser = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const existingCompany = await this.companiesRepository.findOne({
      where: { domain: dto.companyDomain }
    });
    if (existingCompany) {
      throw new ConflictException('Company domain is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const company = await this.companiesRepository.save(
      this.companiesRepository.create({
        name: dto.companyName,
        domain: dto.companyDomain,
        plan: 'trial'
      })
    );

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        companyId: company.id,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: UserRole.COMPANY_ADMIN
      })
    );

    const tokens = await this.issueSession(user, context);
    await this.writeAudit(company.id, user.id, 'auth.register_owner', 'company', company.id);
    await this.analyticsService.recordEvent({
      companyId: company.id,
      userId: user.id,
      eventType: 'auth.register_owner',
      entityType: 'company',
      entityId: company.id
    });

    return {
      success: true,
      data: { company, user: this.serializeUser(user), tokens },
      error: null,
      meta: null
    };
  }

  async login(dto: LoginDto, context: SessionContext) {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueSession(user, context);
    await this.writeAudit(user.companyId, user.id, 'auth.login', 'session');
    await this.analyticsService.recordEvent({
      companyId: user.companyId,
      userId: user.id,
      eventType: 'auth.login',
      entityType: 'user',
      entityId: user.id
    });

    return {
      success: true,
      data: { user: this.serializeUser(user), tokens },
      error: null,
      meta: null
    };
  }

  async refresh(refreshToken: string, context: SessionContext) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret')
      });
      const session = await this.sessionsRepository.findOne({
        where: { id: payload.sessionId, userId: payload.sub }
      });

      if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
        throw new UnauthorizedException('Session expired');
      }

      const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (!matches) {
        throw new UnauthorizedException('Session invalid');
      }

      session.revokedAt = new Date();
      await this.sessionsRepository.save(session);

      const user = await this.usersRepository.findOneByOrFail({ id: payload.sub });
      const tokens = await this.issueSession(user, context);

      return {
        success: true,
        data: { user: this.serializeUser(user), tokens },
        error: null,
        meta: null
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async issueSession(user: User, context: SessionContext) {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role
    };

    const session = this.sessionsRepository.create({
      userId: user.id,
      companyId: user.companyId,
      refreshTokenHash: 'pending',
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt: this.calculateExpiry()
    });

    const persistedSession = await this.sessionsRepository.save(session);
    const refreshPayload = { ...accessPayload, sessionId: persistedSession.id };

    const accessToken = await this.jwtService.signAsync(accessPayload);
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.configService.getOrThrow<string>('jwt.refreshTtl') as never
    });

    persistedSession.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.sessionsRepository.save(persistedSession);

    return { accessToken, refreshToken, expiresAt: persistedSession.expiresAt };
  }

  private calculateExpiry() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      companyId: user.companyId,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  private async writeAudit(
    companyId: string | null,
    actorUserId: string | null,
    action: string,
    resource: string,
    resourceId?: string
  ) {
    await this.auditLogsRepository.save(
      this.auditLogsRepository.create({
        companyId,
        actorUserId,
        action,
        resource,
        resourceId: resourceId ?? null
      })
    );
  }
}
