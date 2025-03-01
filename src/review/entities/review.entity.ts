import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ type: 'int', width: 5 })
  rating: number;

  @IsNotEmpty()
  @Column()
  descreption : string;

  @ManyToOne(() => Hotel, (hotel) => hotel.reviews, { onDelete: 'CASCADE' })
  hotel: Hotel;
}
