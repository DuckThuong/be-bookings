import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    this.logger.log('===== JWT AUTH GUARD =====');
    this.logger.log(
      `Authorization Header: ${request.headers.authorization ?? 'None'}`,
    );
    this.logger.log(`Request URL: ${request.url}`);
    this.logger.log(`Request Method: ${request.method}`);

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    this.logger.log('===== HANDLE REQUEST =====');
    this.logger.error('Error: ' + (err ? JSON.stringify(err) : 'None'));
    this.logger.log('User: ' + JSON.stringify(user));
    this.logger.warn('Info: ' + JSON.stringify(info));

    if (err || !user) {
      this.logger.error('Authentication failed!');
      throw err ?? new UnauthorizedException('Authentication failed');
    }

    this.logger.log('✅ Authentication successful!');
    return user as TUser;
  }
}
