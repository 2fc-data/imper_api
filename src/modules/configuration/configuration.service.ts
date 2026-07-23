import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigCategory } from './entities/config-category.entity.js';
import { ConfigKey } from './entities/config-key.entity.js';
import { ConfigValue } from './entities/config-value.entity.js';
import { ConfigCacheService } from './config-cache.service.js';

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);

  constructor(
    @InjectRepository(ConfigCategory)
    private categoryRepository: Repository<ConfigCategory>,
    @InjectRepository(ConfigKey)
    private keyRepository: Repository<ConfigKey>,
    @InjectRepository(ConfigValue)
    private valueRepository: Repository<ConfigValue>,
    private cacheService: ConfigCacheService,
  ) {}

  async get(
    keyName: string,
    opts?: {
      organizationId?: string;
      departmentId?: string;
      userId?: string;
    },
  ): Promise<string | undefined> {
    const cacheKey = this.buildCacheKey(keyName, opts);
    const cached = this.cacheService.get(cacheKey);
    if (cached !== undefined) return cached;

    const configKey = await this.keyRepository.findOne({
      where: { name: keyName, isActive: true },
    });
    if (!configKey) return undefined;

    // Resolution order: user → dept → org → global → default
    const levels = [
      {
        userId: opts?.userId,
        departmentId: undefined,
        organizationId: undefined,
      },
      {
        userId: undefined,
        departmentId: opts?.departmentId,
        organizationId: undefined,
      },
      {
        userId: undefined,
        departmentId: undefined,
        organizationId: opts?.organizationId,
      },
      { userId: undefined, departmentId: undefined, organizationId: undefined },
    ];

    for (const level of levels) {
      const value = await this.valueRepository.findOne({
        where: {
          configKeyId: configKey.id,
          userId: level.userId || undefined,
          departmentId: level.departmentId || undefined,
          organizationId: level.organizationId || undefined,
        },
      });
      if (value) {
        this.cacheService.set(cacheKey, value.value);
        return value.value;
      }
    }

    if (configKey.defaultValue) {
      this.cacheService.set(cacheKey, configKey.defaultValue);
      return configKey.defaultValue;
    }

    return undefined;
  }

  async set(
    keyName: string,
    value: string,
    opts?: {
      organizationId?: string;
      departmentId?: string;
      userId?: string;
    },
  ): Promise<void> {
    const configKey = await this.keyRepository.findOne({
      where: { name: keyName, isActive: true },
    });
    if (!configKey)
      throw new NotFoundException(`Config key "${keyName}" not found`);

    let configValue = await this.valueRepository.findOne({
      where: {
        configKeyId: configKey.id,
        userId: opts?.userId || undefined,
        departmentId: opts?.departmentId || undefined,
        organizationId: opts?.organizationId || undefined,
      },
    });

    if (configValue) {
      configValue.value = value;
    } else {
      configValue = this.valueRepository.create({
        configKeyId: configKey.id,
        userId: opts?.userId,
        departmentId: opts?.departmentId,
        organizationId: opts?.organizationId,
        value,
      });
    }

    await this.valueRepository.save(configValue);
    this.cacheService.invalidate(keyName);
  }

  private buildCacheKey(
    keyName: string,
    opts?: {
      organizationId?: string;
      departmentId?: string;
      userId?: string;
    },
  ): string {
    const parts = [keyName];
    if (opts?.userId) parts.push(`u:${opts.userId}`);
    if (opts?.departmentId) parts.push(`d:${opts.departmentId}`);
    if (opts?.organizationId) parts.push(`o:${opts.organizationId}`);
    return parts.join(':');
  }

  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<ConfigCategory> {
    const cat = this.categoryRepository.create(data);
    return this.categoryRepository.save(cat);
  }

  async findAllCategories(): Promise<ConfigCategory[]> {
    return this.categoryRepository.find({ relations: { keys: true } });
  }

  async createKey(data: {
    categoryId: string;
    name: string;
    type: string;
    defaultValue?: string;
    description?: string;
    isEncrypted?: boolean;
  }): Promise<ConfigKey> {
    const key = this.keyRepository.create(data);
    return this.keyRepository.save(key);
  }

  async findAllKeys(categoryId?: string): Promise<ConfigKey[]> {
    const where = categoryId
      ? { categoryId, isActive: true }
      : { isActive: true };
    return this.keyRepository.find({ where, relations: { category: true } });
  }
}
