import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  BL_name: string;

  @IsNotEmpty()
  @Column('decimal', { precision: 10, scale: 2 })
  BL_money: number;

  @IsNotEmpty()
  @Column({ nullable: true })
  BL_description: string;

  @IsNotEmpty()
  @Column()
  BL_SUB_Type: string; // Daily, Weekly, Monthly

  @ManyToOne(() => Hotel, (hotel) => hotel.bills, { onDelete: 'CASCADE' })
  hotel: Hotel; // TypeORM will generate a foreign key like `hotelId` automatically
}
