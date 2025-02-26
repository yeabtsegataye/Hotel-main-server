import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ChapaService } from 'chapa-nestjs';
import * as dotenv from 'dotenv';
import { Packeage } from 'src/packeage/entities/packeage.entity';
import { User } from 'src/users/entities/user.entity';
import { jwtConstants } from '../auth/constants';
import { JwtService } from '@nestjs/jwt';

dotenv.config(); // Load environment variables

@Injectable()
export class PaymentsService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private readonly chapaService: ChapaService,
    @InjectRepository(Packeage)
    private packegRepository: Repository<Packeage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async chapaPayment(createPaymentDto: CreatePaymentDto) {
    if (!createPaymentDto.packeg_id || !createPaymentDto.user_id) {
      throw new Error('Both packeg and user are required.');
    }
    const TITLE_LIMIT = 16;
    const DESCRIPTION_LIMIT = 50;

    // Fetch Package Details
    const data = await this.packegRepository.query(
      `SELECT * FROM packages WHERE id = ?`,
      [createPaymentDto.packeg_id],
    );
    // console.log(data[0].price, 'amount');
    if (data.length == 0) return { msg: 'Something went wrong' };

    // Generate Transaction Reference
    const tx_ref = await this.chapaService.generateTransactionReference();
    const userdata = await this.userData(createPaymentDto.user_id);
    console.log(userdata, 'user data');
    // Initialize Payment

    const response = await this.chapaService.initialize({
      first_name: 'John',
      last_name: 'Doe',
      email: userdata.email,
      currency: 'ETB',
      amount: data[0].price.toString(),
      tx_ref: tx_ref,
      callback_url: 'https://example.com/',
      return_url: `https://landing-agay.onrender.com/payment_processing?tx_ref=${tx_ref}&packeg_id=${createPaymentDto.packeg_id}&user_id=${createPaymentDto.user_id}`,      customization: {
        title: this.truncate(data[0].name, TITLE_LIMIT),
        description: this.truncate(data[0].description, DESCRIPTION_LIMIT),
      },
    });
     console.log('chapa resp',response)
    if (response.status !== 'success') {
      return { msg: 'something went wrong on payment' };
    }
    if (response.status === 'success') {
      return response;
    } else {
      throw new Error('Payment initialization failed');
    }
  }

  // verfi payment
  async processing(createPaymentDto: CreatePaymentDto) {
    console.log('txref from processing', createPaymentDto);
    ////////////////////
    try {
      const verifyPayment = await this.chapaService.verify({
        tx_ref: createPaymentDto.tx_ref,
      });
      console.log(verifyPayment, 'the verified 11111111');
      if (verifyPayment.data.status == 'success') {
        const user = await this.userRepository.findOne({where:{id:createPaymentDto.user_id}})
        if(!user){
          return { data: 'no user found' };
        }
        const packages = await this.packegRepository.findOne({where:{id:createPaymentDto.packeg_id}})
        if(!packages){
          return { data: 'no packege found' };
        }
        // Save Payment Record
        const payment = this.paymentsRepository.create({
          ...createPaymentDto,
          amount:Number(packages.price),
          package:packages,
          status: verifyPayment.status,
          transaction_id: createPaymentDto.tx_ref,
          user: user, // Convert bigint to string
        });
        await this.paymentsRepository.save(payment);

        const userdata_for_license = await this.userData(
          createPaymentDto.user_id,
        );
        try {
          if (userdata_for_license.licenceKey) {
            const License_Payload = await this.jwtService.verifyAsync(
              userdata_for_license.licenceKey,
              {
                secret: jwtConstants.Licence_secret,
              },
            );

            const sub_date = await this.getPackeg(createPaymentDto.packeg_id);

            const issuedAt = License_Payload.iat;
            const expiresAt = License_Payload.exp;

            // Calculate the duration in months
            const durationInMonths = (expiresAt - issuedAt) / 2629746;

            // Convert durationInMonths to a number and add to sub_date.sub_date
            const total_sub =
              sub_date.sub_date + Number(durationInMonths.toFixed(2));
            console.log('subtt',sub_date.sub_date)
            console.log('convo',Number(durationInMonths.toFixed(2)))
            console.log('toatllll', total_sub);

            const licenseKey = this.generateLicenseKey(
              createPaymentDto.user_id,
              packages.id,
              total_sub,
            );
            await this.userRepository.update(
              { id: createPaymentDto.user_id },
              {
                licenceKey: licenseKey,
              },
            );
            return { data: 'success', redirectUrl: 'https://hotel-main-dashboard.onrender.com' };
          } else if (!userdata_for_license.licenceKey) {
            const sub_date = await this.getPackeg(createPaymentDto.packeg_id);
            //console.log('sub date', sub_date);
            // Generate License Key using JWT
            const licenseKey = this.generateLicenseKey(
              createPaymentDto.user_id,
             packages.id,
              sub_date.sub_date,
            );
            console.log('licensekey', licenseKey);
            await this.userRepository.update(
              { id: createPaymentDto.user_id },
              {
                licenceKey: licenseKey,
              },
            );
            return { data: 'success', redirectUrl: 'https://hotel-main-dashboard.onrender.com' };
          } else {
            return { data: 'failed' };
          }
        } catch (error) {
          if (error.name === 'TokenExpiredError') {
            const sub_date = await this.getPackeg(createPaymentDto.packeg_id);

            const licenseKey = this.generateLicenseKey(
              createPaymentDto.user_id,
              packages.id,
              sub_date.sub_date,
            );
            await this.userRepository.update(
              { id: createPaymentDto.user_id },
              {
                licenceKey: licenseKey,
              },
            );
            return { data: 'success', redirectUrl: 'https://hotel-main-dashboard.onrender.com' };
          }
          console.log(error, 'error on updating user licence');
          return { data: 'failed' };
        }
      } else {
        return { data: 'unknown error on payment' };
      }

      /////////////////
    } catch (error) {
      return { msg: 'something went wrong on saving payment' };
    }
  }
  // to get user data
  async userData(createPaymentDto: any) {
    try {
      const pack = await this.userRepository.findOne({
        where: { id: createPaymentDto },
      });
      if (!pack) {
        throw new NotFoundException(`user with ID this not found`);
      }
      return pack;
    } catch (error) {
      console.error(`Error retrieving user :`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve package');
    }
  }
  // to get packeg
  async getPackeg(createPaymentDto: any) {
    try {
      const pack = await this.packegRepository.findOne({
        where: { id: createPaymentDto },
      });
      if (!pack) {
        throw new NotFoundException(`packeg with ID this not found`);
      }
      return pack;
    } catch (error) {
      console.error(`Error retrieving packeg :`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve package');
    }
  }
  // Utility function to truncate strings
  truncate(str: string, maxLength: number): string {
    if (str.length > maxLength) {
      return str.slice(0, maxLength - 3) + '...'; // Subtract 3 to accommodate '...' and prevent exceeding maxLength
    }
    return str;
  }
  // Generate JWT as License Key
  private generateLicenseKey(
    userId: bigint,
    packageId: number,
    sub_date: number,
  ) {
    const payload = {
      userId: userId,
      packageId: packageId,
    };

    // Assuming sub_date is the number of months, calculate the equivalent days or minutes
    const daysInMonth = 30;
    const expiryInMinutes = sub_date * daysInMonth * 24 * 60; // Convert months to minutes

    const License = this.jwtService.sign(payload, {
      secret: jwtConstants.Licence_secret,
      expiresIn: `${expiryInMinutes} m`, // Expires in minutes
    });//

    return License;
  }
}
