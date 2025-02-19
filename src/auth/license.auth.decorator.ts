import { SetMetadata } from '@nestjs/common';

export const LICENSE_AUTH_ONLY = 'LicenseCheck';
export const LicenseCheck = () => SetMetadata(LICENSE_AUTH_ONLY, true);
