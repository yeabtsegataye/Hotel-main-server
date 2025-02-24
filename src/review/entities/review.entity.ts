import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', width: 5 })
  rating: number;

  @Column()
  descreption : string;

  @ManyToOne(() => Hotel, (hotel) => hotel.reviews, { onDelete: 'CASCADE' })
  hotel: Hotel;
}
