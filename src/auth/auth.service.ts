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
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    private jwtService: JwtService,
  ) {}

  async Signup(AutDTO: CreateAuthDto, @Res() res: Response) {
    if(!AutDTO.Password || !AutDTO.email || !AutDTO.hotel_description ||!AutDTO.hotel_name){
      return {data: 'all input must be filled '}
    }
    //console.log(AutDTO,'sii aut')
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
          role: 'admin',
        });
     
        const data = await this.userRepository.save(newUser);
        
        const hotel = this.hotelRepository.create({
          hotel_name: AutDTO.hotel_name,
          hotel_description: AutDTO.hotel_description,
          user: data
        });
        const Hotel_data = await this.hotelRepository.save(hotel);
        //console.log(Hotel_data, "hotel data")

        const payload = { id: data.id, email: data.email, hotel_id: Hotel_data.id };

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
          secure: true, // Ensure this is true for HTTPS
          sameSite: 'none', // Needed for cross-origin cookies
        });
        // console.log(accessToken,'payload', payload)
        return res.send({ accessToken, payload });
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

    const hotel = await this.hotelRepository.findOne({
      where: { user: user },
    });
    if (!hotel) {
      return res.status(404).send('No hotel found for this user');
    }
    if (!user) {
      return res.status(404).send('No user found');
    }


    const isMatch = await bcrypt.compare(decryptedPassword, user.Password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { id: user.id, email: user.email , hotel_id:hotel.id};

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
      secure: true, // Ensure this is true for HTTPS
      sameSite: 'none', // Needed for cross-origin cookies
    });

    return res.send({ accessToken, payload });
  }
  /////////////////////////////////
  async Dlogin(@Body() authDTO: CreateAuthDto, @Res() res: Response) {
    const SECRET_KEY = process.env.SECRET_KEY; // Ensure this matches the frontend key

    // Decrypt the password
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
      return res.status(400).send('Invalid user name or password');
    }

    // Find the user by email
    const user = await this.userRepository.findOne({
      where: { email: authDTO.email },
    });

    if (!user) {
      return res.status(404).send('No user found');
    }

    const hotel = await this.hotelRepository.findOne({
      where: { user: user },
    });
    if (!hotel) {
      return res.status(404).send('No hotel found for this user');
    }

    // Compare the decrypted password with the stored hashed password
    const isMatch = await bcrypt.compare(decryptedPassword, user.Password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the user has a license key
    if (!user.licenceKey) {
      return res.status(404).send('No licence found');
    }

    // Verify the license key
    try {
      const decodedLicenceKey = await this.jwtService.verifyAsync(
        user.licenceKey,
        {
          secret: jwtConstants.Licence_secret,
        },
      );

      // Check if the license key is expired
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decodedLicenceKey.exp && decodedLicenceKey.exp < currentTime) {
        return res
          .status(401)
          .send('License key expired, please get a new one');
      }

      // If the license key is valid, proceed with login
      const payload = { id: user.id, email: user.email,hotel_id :hotel.id };

      // Generate access token
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtConstants.Access_secret,
        expiresIn: '1d',
      });

      // Generate refresh token
      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtConstants.Refresh_secret,
        expiresIn: '10d',
      });

      // Set the refresh token in a cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true, // Ensure this is true for HTTPS
        sameSite: 'none', // Needed for cross-origin cookies
      });

      // Return the access token and payload
      return res.send({ accessToken, payload });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res
          .status(401)
          .send('License key expired, please get a new one');
      }
      return res.status(401).send('Invalid license key');
    }
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
      const { id, email,hotel_id } = Payload;
      const payload = { id, email ,hotel_id};
      const accessToken = this.jwtService.sign(
        { id, email ,hotel_id},
        {
          secret: jwtConstants.Access_secret,
          expiresIn: '1d',
        },
      );
      // console.log('sented acc ', accessToken);
      return res.send({ accessToken, payload });
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
      await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.Refresh_secret,
      });
      return res.send({ verified: true });
    } catch (error) {
      console.log(error);
      return res.send({ verified: false });
    }
  }
  ////////////////////////////////
  async Dash_verifiToken(@Res() res: Response, @Req() req: CustomRequest) {
    const refreshToken = req.cookies.refresh_token;
    const access_token = req.headers.authorization;
    const user = req.body.user; // Extract licenseKey from the request body
    //console.log(refreshToken, "ref" , access_token ,'accs')
    if (!refreshToken || !access_token || !user) {
      throw new UnauthorizedException('No token found');
    }
    try {
      const acc = this.extractAccessToken(access_token);

      await this.jwtService.verifyAsync(acc, {
        secret: jwtConstants.Access_secret,
      });
      await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.Refresh_secret,
      });
      const User = await this.userRepository.findOne({
        where: { id: user.id },
      });
      if (!User.licenceKey) {
        return res.send({ verified: false });
      }
      const key = User.licenceKey
      await this.jwtService.verifyAsync(key, {
        secret: jwtConstants.Licence_secret,
      });
      return res.send({ verified: true });
    } catch (error) {
      console.log(error);
      return res.send({ verified: false });
    }
  }
  async Logout(@Res() res: Response, @Req() req: CustomRequest) {
    console.log('removing cokies');
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true, // Must match the setting used when setting the cookie
      sameSite: 'none', // Must match the setting used when setting the cookie
    });
    return res.status(200).send('Logged out successfully');
  }
}
