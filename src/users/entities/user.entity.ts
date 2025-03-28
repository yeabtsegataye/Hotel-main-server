import { IsNotEmpty } from 'class-validator';
import { Comment } from 'src/comments/entities/comment.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: bigint;

  @IsNotEmpty()
  @Column({ nullable: false, unique: true })
  email: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  Password: string;

  @IsNotEmpty()
  @Column()
  phone: string;

  @Column({ nullable: true })
  licenceKey: string;

  @IsNotEmpty()
  @Column()
  role: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true, type: 'timestamp' })
  otpExpiration: Date;

  // One user can have many hotels
  @OneToMany(() => Hotel, (hotel) => hotel.user)
  hotels: Hotel[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // One user can have multiple payments
  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
