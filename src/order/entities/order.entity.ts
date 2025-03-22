import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Food } from 'src/food/entities/food.entity'; // Import Food entity
import { IsNotEmpty } from 'class-validator';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, default: 'Guest' })
  customerName: string;

  @IsNotEmpty()
  @Column({ length: 100 })
  order_tabel: string;

  @IsNotEmpty()
  @Column({ length: 100, default: 'pending' })
  order_status: string;

  @Column({nullable:false})
  quantity: number;

  // Relationship with Food entity
  @ManyToOne(() => Food, (food) => food.orders, { nullable: false, onDelete: 'CASCADE' })
  food: Food;

  // Relationship with Hotel entity
  @ManyToOne(() => Hotel, (hotel) => hotel.orders, { nullable: false, onDelete: 'CASCADE' })
  hotel: Hotel;

  @CreateDateColumn()
  createdAt: Date;
}
