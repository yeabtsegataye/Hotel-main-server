import {
  Injectable,
  UnauthorizedException,
  Res,
  Req,
  Body,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as CryptoJS from 'crypto-js';
import { jwtConstants } from './constants';
import { CustomRequest } from './custom-request.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async Signup(AutDTO: CreateAuthDto, @Res() res: Response) {
    const SECRET_KEY = process.env.SECRET_KEY; // Ensure this matches the frontend key

    const existingUser = await this.userRepository.findOne({
      where: { email: AutDTO.email },
    });

    if (existingUser) {
      return res.status(400).send('User already exists');
    } else {
      try {
        const decryptData = (encryptedData: string) => {
          try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
          } catch (error) {
            console.error('Error decrypting data:', error);
            throw new UnauthorizedException('Invalid encrypted data');
          }
        };
        /////////////////
        const decryptedPassword = decryptData(AutDTO.Password);
        if (!decryptedPassword) {
          return res.status(400).send('Invalid encrypted password');
        }
        ////
        const hash = await bcrypt.hash(decryptedPassword, 10);
        const newUser = this.userRepository.create({
          email: AutDTO.email,
          Password: hash,
          phone: '022',
        });
        const data = await this.userRepository.save(newUser);
        const payload = { id: data.id, email: data.email };

        const accessToken = this.jwtService.sign(payload, {
          secret: jwtConstants.Access_secret,
          expiresIn: '1d',
        });
        const refreshToken = this.jwtService.sign(payload, {
          secret: jwtConstants.Refresh_secret,
          expiresIn: '10d',
        });

        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: false, // Set to true in production
          sameSite: 'lax', // or 'lax'
        });
        console.log(accessToken,'payload', payload)
        return res.send({ accessToken ,payload });
      } catch (error) {
        console.error('Error hashing password:', error);
        return res.status(500).send('Error creating user');
      }
    }
  }
  /////////////////////////////////

  async login(@Body() authDTO: CreateAuthDto, @Res() res: Response) {
    const SECRET_KEY = process.env.SECRET_KEY; // Ensure this matches the frontend key
    const decryptData = (encryptedData: string) => {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        console.error('Error decrypting data:', error);
        throw new UnauthorizedException('Invalid encrypted data');
      }
    };

    const decryptedPassword = decryptData(authDTO.Password);
    if (!decryptedPassword) {
      return res.status(400).send('Invalid encrypted password');
    }

    const user = await this.userRepository.findOne({
      where: { email: authDTO.email },
    });

    if (!user) {
      return res.status(404).send('No user found');
    }

    const isMatch = await bcrypt.compare(decryptedPassword, user.Password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { id: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.Access_secret,
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.Refresh_secret,
      expiresIn: '10d',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax', // or 'lax'
    });

    return res.send({ accessToken ,payload});
  }
  /////////////////////////////////
  private extractAccessToken(access_token: string) {
    if (access_token && access_token.startsWith('Bearer ')) {
      const acc = access_token.split(' ')[1];
      return acc;
    }
  }
  /////////////////////////////////
  async refreshToken(@Res() res: Response, @Req() req: CustomRequest) {
    const refreshToken = req.cookies.refresh_token;
    //const access_token = req.headers.authorization;

    if (!refreshToken) {
      throw new UnauthorizedException('No token found');
    }
    try {
      const Payload = await this.jwtService.verify(refreshToken, {
        secret: jwtConstants.Refresh_secret,
      });
      const { id, email } = Payload;
      const payload = {id, email}
      const accessToken = this.jwtService.sign(
        { id, email },
        {
          secret: jwtConstants.Access_secret,
          expiresIn: '1d',
        },
      );
      console.log('sented acc ', accessToken);
      return res.send({ accessToken ,payload });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Refresh token expired, please log in again',
        );
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
    // }
    //  else {
    //   throw new UnauthorizedException('Invalid access token');
    // }

    ///////////////////
  }
  ////////////////////////////////
  async verifiToken(@Res() res: Response, @Req() req: CustomRequest) {
    const refreshToken = req.cookies.refresh_token;
    const access_token = req.headers.authorization;
    //console.log(refreshToken, "ref" , access_token ,'accs')
    if (!refreshToken || !access_token) {
      throw new UnauthorizedException('No token found');
    }
    try {
      const acc = this.extractAccessToken(access_token);

      await this.jwtService.verifyAsync(acc, {
        secret: jwtConstants.Access_secret,
      });
      return res.send({ verified: true });
    } catch (error) {
      console.log(error);
      return res.send({ verified: false });
    }
  }
  //////////////////
  async Logout(@Res() res: Response, @Req() req: CustomRequest) {
    res.clearCookie('refresh_token');
    res.end();
    return;
  }
}
