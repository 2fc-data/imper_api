import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface OrgContextRequest extends Request {
  organizationContext?: {
    organizationId?: string;
    departmentId?: string;
    teamId?: string;
  };
}

@Injectable()
export class OrganizationContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OrganizationContextMiddleware.name);

  use(req: OrgContextRequest, _res: Response, next: NextFunction) {
    const orgId = req.headers['x-organization-id'] as string | undefined;
    const deptId = req.headers['x-department-id'] as string | undefined;
    const teamId = req.headers['x-team-id'] as string | undefined;

    req.organizationContext = {
      organizationId: orgId,
      departmentId: deptId,
      teamId: teamId,
    };

    next();
  }
}
