import { IsNotEmpty } from 'class-validator';
import { Packeage } from 'src/packeage/entities/packeage.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Packeage, (packeg) => packeg.payments, { onDelete: 'CASCADE' })
  package: Packeage;

  @IsNotEmpty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @IsNotEmpty()
  @Column()
  status: string;

  @IsNotEmpty()
  @Column({ nullable: true })
  transaction_id: string;

  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
