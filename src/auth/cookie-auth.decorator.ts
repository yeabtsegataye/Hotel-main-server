// src/auth/cookie-auth.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const COOKIE_AUTH_ONLY = 'cookieAuthOnly';
export const CookieAuthOnly = () => SetMetadata(COOKIE_AUTH_ONLY, true);
