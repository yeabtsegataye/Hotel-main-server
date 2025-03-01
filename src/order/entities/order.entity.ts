import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, default:'Guest' })
  customerName: string;

  @IsNotEmpty()
  @Column({ length: 100 })
  order_tabel: string;

  @IsNotEmpty()
  @Column({ length: 100 })
  order_time_take: string;

  @IsNotEmpty()
  @Column({ length: 100 })
  order_status: string;

  @IsNotEmpty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.orders, { onDelete: 'CASCADE' })
  hotel: Hotel;
}
