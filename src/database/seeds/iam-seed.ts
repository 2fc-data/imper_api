import { DataSource } from 'typeorm';
import { Role } from '../../modules/iam/entities/role.entity.js';
import { Permission } from '../../modules/iam/entities/permission.entity.js';
import { RolePermission } from '../../modules/iam/entities/role-permission.entity.js';

async function seedIAM(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);
  const rpRepo = dataSource.getRepository(RolePermission);

  const permissions = [
    'leads:read',
    'leads:write',
    'leads:delete',
    'clients:read',
    'clients:write',
    'clients:delete',
    'proposals:read',
    'proposals:write',
    'proposals:delete',
    'contracts:read',
    'contracts:write',
    'contracts:delete',
    'schedule:read',
    'schedule:write',
    'financial:read',
    'financial:write',
    'organization:read',
    'organization:write',
    'iam:manage',
    'audit:read',
    'config:read',
    'config:write',
  ];

  const permEntities: Permission[] = [];
  for (const p of permissions) {
    const [resource, action] = p.split(':');
    let entity = await permRepo.findOne({ where: { name: p } });
    if (!entity) {
      entity = permRepo.create({
        name: p,
        resource,
        action,
        description: `${action} ${resource}`,
      });
      await permRepo.save(entity);
    }
    permEntities.push(entity);
  }

  const roles = [
    { name: 'admin', desc: 'Full system access', perms: permissions },
    {
      name: 'manager',
      desc: 'Department manager',
      perms: [
        'leads:read',
        'leads:write',
        'leads:delete',
        'clients:read',
        'clients:write',
        'proposals:read',
        'proposals:write',
        'contracts:read',
        'contracts:write',
        'schedule:read',
        'schedule:write',
        'financial:read',
        'config:read',
      ],
    },
    {
      name: 'collaborator',
      desc: 'Regular team member',
      perms: [
        'leads:read',
        'leads:write',
        'clients:read',
        'clients:write',
        'proposals:read',
        'proposals:write',
        'schedule:read',
      ],
    },
    {
      name: 'viewer',
      desc: 'Read-only access',
      perms: [
        'leads:read',
        'clients:read',
        'proposals:read',
        'contracts:read',
        'schedule:read',
      ],
    },
  ];

  for (const r of roles) {
    let role = await roleRepo.findOne({ where: { name: r.name } });
    if (!role) {
      role = roleRepo.create({
        name: r.name,
        description: r.desc,
        isSystem: true,
      });
      await roleRepo.save(role);
    }

    for (const permName of r.perms) {
      const perm = permEntities.find((p) => p.name === permName);
      if (perm) {
        const existing = await rpRepo.findOne({
          where: { roleId: role.id, permissionId: perm.id },
        });
        if (!existing) {
          await rpRepo.save(
            rpRepo.create({ roleId: role.id, permissionId: perm.id }),
          );
        }
      }
    }
  }

  console.log('IAM seed completed: roles and permissions created');
}

export default seedIAM;
