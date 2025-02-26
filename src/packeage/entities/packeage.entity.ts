import { Payment } from 'src/payment/entities/payment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('packages')
export class Packeage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  sub_date: number;

  @Column({ type: 'varchar', length: 50 })
  price: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array')
  features: string[];

  @Column({ type: 'varchar', length: 100 })
  buttonClass: string;

  @Column({ type: 'int', default: 0 })
  delay: number;

  @OneToMany(() => Payment, (payment) => payment.package)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
