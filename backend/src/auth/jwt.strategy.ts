// src/modules/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'MY_SUPER_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // สิ่งที่ return จะไปอยู่ที่ req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}