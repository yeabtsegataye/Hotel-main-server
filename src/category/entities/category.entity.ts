import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Food } from 'src/food/entities/food.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  status: string;

  @Column({ nullable: true }) 
  image: string; // Path to the image file

  @OneToMany(() => Food, (food) => food.category)
  foods: Food[];

  // Foreign key to Hotel
  @ManyToOne(() => Hotel, (hotel) => hotel.categories, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'hotel_id' }) // Ensures explicit foreign key column
  hotel: Hotel;
}
