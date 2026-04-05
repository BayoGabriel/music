import { Role, type Role as RoleType } from "../../common/constants/roles";
import { AppError } from "../../common/errors/app-error";
import { hashPassword } from "../../common/utils/password";
import { env } from "../../config/env";
import { UserModel } from "./user.model";

const toUserResponse = (
  user: {
    _id: { toString(): string };
    email: string;
    role: RoleType;
    createdAt: Date;
  } | null,
) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

class UsersService {
  public async findByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  }

  public async findById(userId: string) {
    return UserModel.findById(userId).exec();
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
    const user = await UserModel.create({
      email: payload.email,
      passwordHash,
      role: payload.role ?? Role.USER,
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
        existingUser.role = Role.ADMIN;
        existingUser.passwordHash = await hashPassword(env.adminPassword);
        await existingUser.save();
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
