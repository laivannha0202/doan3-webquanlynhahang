import { SetMetadata } from '@nestjs/common';

export const THU_NGAN_KEY = 'thuNgan';
export const ThuNgan = () => SetMetadata(THU_NGAN_KEY, true);
