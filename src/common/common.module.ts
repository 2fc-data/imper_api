import { Global, Module } from '@nestjs/common';
import { LookupService } from './services/lookup.service.js';

@Global()
@Module({
  providers: [LookupService],
  exports: [LookupService],
})
export class CommonModule {}
