import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, default:'Guest' })
  customerName: string;

  @Column({ length: 100 })
  order_tabel: string;

  @Column({ length: 100 })
  order_time_take: string;

  @Column({ length: 100 })
  order_status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.orders, { onDelete: 'CASCADE' })
  hotel: Hotel;
}
