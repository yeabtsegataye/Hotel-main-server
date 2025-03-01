import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Food } from 'src/food/entities/food.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @IsNotEmpty()
  @Column()
  status: string;

  @Column({ nullable: true })
  image: string; // Path to the image file

  @OneToMany(() => Food, (food) => food.category)
  foods: Food[];

  // Foreign key to Hotel
  @ManyToOne(() => Hotel, (hotel) => hotel.categories, { onDelete: 'CASCADE' })
  hotel: Hotel;
}
