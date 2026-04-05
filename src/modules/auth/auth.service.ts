import { AppError } from '../../common/errors/app-error';
import { signAuthToken } from '../../common/utils/jwt';
import { comparePassword } from '../../common/utils/password';
import { usersService } from '../users/users.service';

class AuthService {
  public async register(payload: { email: string; password: string }) {
    const user = await usersService.createUser(payload);

    if (!user) {
      throw new AppError(500, 'Unable to create user');
    }

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user
    };
  }

  public async login(payload: { email: string; password: string }) {
    const user = await usersService.findByEmail(payload.email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const passwordMatches = await comparePassword(payload.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, 'Invalid email or password');
    }

    const responseUser = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    const token = signAuthToken({
      sub: responseUser.id,
      email: responseUser.email,
      role: responseUser.role
    });

    return {
      token,
      user: responseUser
    };
  }
}

export const authService = new AuthService();
