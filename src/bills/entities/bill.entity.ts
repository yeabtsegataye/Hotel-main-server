import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  BL_name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  BL_money: number;

  @Column({ nullable: true })
  BL_description: string;

  @Column()
  BL_SUB_Type: string; // Daily, Weekly, Monthly

  @ManyToOne(() => Hotel, (hotel) => hotel.bills, { onDelete: 'CASCADE' })
  hotel: Hotel; // TypeORM will generate a foreign key like `hotelId` automatically
}
