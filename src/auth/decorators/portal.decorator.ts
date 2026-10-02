import { SetMetadata } from '@nestjs/common';

export const IS_PORTAL_KEY = 'isPortal';
export const Portal = () => SetMetadata(IS_PORTAL_KEY, true);
