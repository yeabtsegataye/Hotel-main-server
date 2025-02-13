require('dotenv').config();

export const jwtConstants = {
  Access_secret: process.env.ACC_SECRET,
  Refresh_secret: process.env.REF_SECRET,
};
