import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export interface TenantAwareRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(request: TenantAwareRequest, _: Response, next: NextFunction) {
    const authUser = request.user as { companyId?: string } | undefined;
    request.tenantId = authUser?.companyId ?? request.headers['x-company-id']?.toString();
    next();
  }
}
