import { PrismaClient } from "../../../prisma/generated/client";
import {
  PERMISSION_DEFINITIONS,
  ROLE_PERMISSION_MAP,
  RoleSlugType
} from "./permissions";

export async function seedRbac(prisma: PrismaClient) {
  for (const definition of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { slug: definition.slug },
      create: {
        slug: definition.slug,
        name: definition.name,
        description: definition.description
      },
      update: {
        name: definition.name,
        description: definition.description
      }
    });
  }

  for (const [roleSlug, permissionSlugs] of Object.entries(ROLE_PERMISSION_MAP) as [
    RoleSlugType,
    readonly string[]
  ][]) {
    const role = await prisma.role.upsert({
      where: { slug: roleSlug },
      create: {
        slug: roleSlug,
        name: roleSlug,
        description: null
      },
      update: {}
    });

    const permissions = await prisma.permission.findMany({
      where: { slug: { in: [...permissionSlugs] } },
      select: { id: true }
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id }
    });

    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map(permission => ({
          roleId: role.id,
          permissionId: permission.id
        })),
        skipDuplicates: true
      });
    }
  }
}
