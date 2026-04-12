import { Role, type Role as RoleType } from "../../common/constants/roles";
import { AppError } from "../../common/errors/app-error";
import { hashPassword } from "../../common/utils/password";
import { env } from "../../config/env";
import { prisma } from "../../database";

const toStoredRole = (role: string): RoleType => role as RoleType;

const toUserResponse = (
  user: {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
  } | null,
) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: toStoredRole(user.role),
    createdAt: user.createdAt,
  };
};

class UsersService {
  public async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  public async findById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  public async createUser(payload: {
    email: string;
    password: string;
    role?: Role;
  }) {
    const existingUser = await this.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError(409, "Email is already registered");
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        role: toStoredRole(payload.role ?? Role.USER),
      },
    });

    return toUserResponse(user);
  }

  public async getProfile(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return toUserResponse(user);
  }

  public async ensureAdminAccount() {
    if (!env.adminEmail || !env.adminPassword) {
      return;
    }

    const existingUser = await this.findByEmail(env.adminEmail);

    if (existingUser) {
      if (existingUser.role !== Role.ADMIN) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: Role.ADMIN,
            passwordHash: await hashPassword(env.adminPassword),
          },
        });
      }
      return;
    }

    await this.createUser({
      email: env.adminEmail,
      password: env.adminPassword,
      role: Role.ADMIN,
    });
  }
}

export const usersService = new UsersService();
