import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Permission, PermissionSlug, RoleSlug, RoleSlugType } from "./permissions";
import { seedRbac } from "./rbac.seed";

@Injectable()
export class RbacService implements OnModuleInit {
  private readonly logger = new Logger(RbacService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seed();
    await this.assignDefaultRoleToUsersWithoutRoles();
  }

  async seed() {
    await seedRbac(this.prisma);

    for (const roleSlug of Object.values(RoleSlug)) {
      await this.prisma.role.update({
        where: { slug: roleSlug },
        data: {
          name: this.roleDisplayName(roleSlug),
          description: this.roleDescription(roleSlug)
        }
      });
    }

    this.logger.log("RBAC permissions and roles seeded");
  }

  async getPermissionsForUser(userId: string): Promise<Set<string>> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: { select: { slug: true } }
              }
            }
          }
        }
      }
    });

    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        permissions.add(rolePermission.permission.slug);
      }
    }

    return permissions;
  }

  hasPermission(
    userPermissions: Set<string>,
    required: PermissionSlug
  ): boolean {
    if (userPermissions.has(Permission.All)) {
      return true;
    }

    return userPermissions.has(required);
  }

  hasEveryPermission(
    userPermissions: Set<string>,
    required: PermissionSlug[]
  ): boolean {
    return required.every(permission =>
      this.hasPermission(userPermissions, permission)
    );
  }

  async assignDefaultRoleToUsersWithoutRoles() {
    const usersWithoutRoles = await this.prisma.user.findMany({
      where: { roles: { none: {} }, deletedAt: null },
      select: { id: true }
    });

    for (const user of usersWithoutRoles) {
      await this.assignRoleBySlug(user.id, RoleSlug.User);
    }
  }

  async assignRoleBySlug(userId: string, roleSlug: RoleSlugType) {
    const role = await this.prisma.role.findUnique({
      where: { slug: roleSlug }
    });

    if (!role) {
      throw new Error(`Role "${roleSlug}" is not defined`);
    }

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id
        }
      },
      create: {
        userId,
        roleId: role.id
      },
      update: {}
    });
  }

  private roleDisplayName(roleSlug: RoleSlugType): string {
    switch (roleSlug) {
      case RoleSlug.Admin:
        return "Администратор";
      case RoleSlug.Editor:
        return "Редактор";
      default:
        return "Пользователь";
    }
  }

  private roleDescription(roleSlug: RoleSlugType): string {
    switch (roleSlug) {
      case RoleSlug.Admin:
        return "Полный доступ ко всем операциям";
      case RoleSlug.Editor:
        return "Управление каталогом и стримами";
      default:
        return "Базовый доступ к просмотру и личным данным";
    }
  }
}
