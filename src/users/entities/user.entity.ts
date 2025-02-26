import { Comment } from 'src/comments/entities/comment.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  Password: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  licenceKey: string;

  @Column()
  role: string;

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
