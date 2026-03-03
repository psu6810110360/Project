import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'MY_SUPER_SECRET_KEY', // ⚠️ ต้องตรงกับ AuthModule
    });
  }

  async validate(payload: any) {
    // payload จะถูกส่งไปอยู่ใน req.user
    return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
    }
  }
}