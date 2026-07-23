import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface OrganizationContext {
  organizationId?: string;
  departmentId?: string;
  teamId?: string;
}

interface RequestWithOrgContext {
  organizationContext?: OrganizationContext;
}

export const OrganizationContext = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithOrgContext>();
    const orgCtx = request.organizationContext;
    return data ? orgCtx?.[data as keyof OrganizationContext] : orgCtx;
  },
);
