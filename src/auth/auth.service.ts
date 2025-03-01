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
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async Signup(AutDTO: CreateAuthDto, @Res() res: Response) {
    if (
      !AutDTO.Password ||
      !AutDTO.email ||
      !AutDTO.hotel_description ||
      !AutDTO.hotel_name
    ) {
      return { data: 'all input must be filled ' };
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
          phone: '09333',
        });

        const data = await this.userRepository.save(newUser);

        const hotel = this.hotelRepository.create({
          hotel_name: AutDTO.hotel_name,
          hotel_description: AutDTO.hotel_description,
          user: data,
        });
        const Hotel_data = await this.hotelRepository.save(hotel);
        //console.log(Hotel_data, "hotel data")

        const payload = {
          id: data.id,
          email: data.email,
          hotel_id: Hotel_data.id,
        };

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
    if (!user) {
      return res.status(404).send('No user found');
    }

    if (!hotel) {
      return res.status(404).send('No hotel found for this user');
    }

    const isMatch = await bcrypt.compare(decryptedPassword, user.Password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { id: user.id, email: user.email, hotel_id: hotel.id };

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
    const SECRET_KEY = process.env.SECRET_KEY;

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
      return res.status(400).send('Invalid username or password');
    }

    if (authDTO.role === 'admin') {
      // **Fetch the user based on email**
      const user = await this.userRepository.findOne({
        where: { email: authDTO.email },
        relations: ['hotels'], // Load hotels relation
      });

      if (!user) {
        return res.status(404).send('No user found');
      }

      // **Find the first hotel associated with the user**
      const hotel = user.hotels.length > 0 ? user.hotels[0] : null;
      if (!hotel) {
        return res.status(404).send('No hotel found for this user');
      }

      // **Compare the decrypted password with the stored hashed password**
      const isMatch = await bcrypt.compare(decryptedPassword, user.Password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // **Check if the user has a license key**
      if (!user.licenceKey) {
        return res.status(404).send('No license found');
      }

      // **Verify the license key**
      try {
        const decodedLicenceKey = await this.jwtService.verifyAsync(
          user.licenceKey,
          {
            secret: jwtConstants.Licence_secret,
          },
        );

        // **Check if the license key is expired**
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedLicenceKey.exp && decodedLicenceKey.exp < currentTime) {
          return res
            .status(401)
            .send('License key expired, please get a new one');
        }

        // **Generate tokens with user ID**
        const payload = {
          id: user.id,
          email: user.email,
          hotel_id: hotel.id,
          role: user.role,
        };
        const accessToken = this.jwtService.sign(payload, {
          secret: jwtConstants.Access_secret,
          expiresIn: '1d',
        });
        const refreshToken = this.jwtService.sign(payload, {
          secret: jwtConstants.Refresh_secret,
          expiresIn: '10d',
        });

        // **Set refresh token in a cookie**
        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });

        return res.send({ accessToken, payload });
      } catch (error) {
        return res.status(401).send('Invalid or expired license key');
      }
      /////////////////////////////
    } else if (authDTO.role === 'employee') {
      try {
        // **Find the employee by email and load the hotel relation**
        const employee = await this.employeeRepository.findOne({
          where: { email: authDTO.email },
          relations: ['hotel'], // Load hotel relation
        });
    
        if (!employee) {
          return res.status(404).send('No employee found');
        }
    
        // **Compare the decrypted password with the stored hashed password**
        const isMatch = await bcrypt.compare(
          decryptedPassword,
          employee.password,
        );
    
        if (!isMatch) {
          return res.status(401).send({ data: 'Invalid credentials' }); // Return 401 for invalid credentials
        }
    
        // **Find the hotel associated with this employee**
        const hotel = employee.hotel;
        if (!hotel) {
          return res.status(404).send('No hotel found for this employee');
        }
        console.log(hotel.id, 'hotl');
    
        const hotel_and_user = await this.hotelRepository.findOne({
          where: { id: hotel.id }, // Find the user using hotel.user.id
          relations: ['user'],
        });
        const user = hotel_and_user.user;
        console.log(user,'emp usess')
        if (!user) {
          return res.status(404).send('No owner found for this hotel');
        }
    
        // **Check if the owner's license key is valid**
        if (!user.licenceKey) {
          return res.status(404).send('No license found for this hotel owner');
        }
    
        try {
          const decodedLicenceKey = await this.jwtService.verifyAsync(
            user.licenceKey,
            {
              secret: jwtConstants.Licence_secret,
            },
          );
    
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedLicenceKey.exp && decodedLicenceKey.exp < currentTime) {
            return res
              .status(401)
              .send('License key expired, please get a new one');
          }
    
          // **Generate tokens using the employee ID instead of the user ID**
          const payload = {
            id: employee.id,
            email: employee.email,
            hotel_id: hotel.id,
            role: employee.role,
          };
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
            secure: true,
            sameSite: 'none',
          });
    
          return res.send({ accessToken, payload });
        } catch (error) {
          return res.status(401).send('Invalid or expired license key');
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send('somthing went wrong'); // Return 500 for unexpected errors
      }
    } else {
      throw new UnauthorizedException('Unknown user role');
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
      // console.log(Payload,'pppppp')
      const { id, email, hotel_id, role } = Payload;
      const payload = { id, email, hotel_id, role };
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtConstants.Access_secret,
        expiresIn: '1d',
      });
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
    // const user = req.body.user; // Extract licenseKey from the request body
    //console.log(refreshToken, "ref" , access_token ,'accs')
    if (!refreshToken || !access_token || !access_token.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }
    const token = access_token.split(' ')[1];
    const decoded = this.jwtService.verify(token);
    if (!decoded || !decoded.id) {
      throw new UnauthorizedException('Invalid token payload');
    }
    try {
      const acc = this.extractAccessToken(access_token);

      await this.jwtService.verifyAsync(acc, {
        secret: jwtConstants.Access_secret,
      });
      await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.Refresh_secret,
      });
      /////////////
      // console.log('decode', decoded);
      if (decoded.role == 'admin') {
        const User = await this.userRepository.findOne({
          where: { id: decoded.id },
        });
        if (!User || !User?.licenceKey) {
          return res.send({ verified: false });
        }
        const key = User.licenceKey;
        await this.jwtService.verifyAsync(key, {
          secret: jwtConstants.Licence_secret,
        });
        return res.send({ verified: true, role: User.role });
        //////////////////////////////
      } else if (decoded.role == 'employee') {
        const employee = await this.employeeRepository.findOne({
          where: { id: decoded.id },
          relations: ['hotel'],
        });
        // console.log('empppp', employee);
        if (!employee) {
          return res.send({ verified: false });
        }
        const hotel = employee.hotel;
        if (!hotel) {
          return res.status(404).send('No hotel found for this employee');
        }
        // console.log(hotel.id, 'hotl');

        const hotel_and_user = await this.hotelRepository.findOne({
          where: { id: hotel.id }, // Find the user using hotel.user.id
          relations: ['user'],
        });
        const user = hotel_and_user.user;
        if (!user) {
          return res.status(404).send('No owner found for this hotel');
        }

        // **Check if the owner's license key is valid**
        if (!user.licenceKey) {
          return res.status(404).send('No license found for this hotel owner');
        }

        const decodedLicenceKey = await this.jwtService.verifyAsync(
          user.licenceKey,
          {
            secret: jwtConstants.Licence_secret,
          },
        );

        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedLicenceKey.exp && decodedLicenceKey.exp < currentTime) {
          return res
            .status(401)
            .send('License key expired, please get a new one');
        }
        return res.send({ verified: true, role: employee.role });
      }
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
