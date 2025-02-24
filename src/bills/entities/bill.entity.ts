import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
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

  // Foreign key relationship to Hotel
  @ManyToOne(() => Hotel, (hotel) => hotel.bills, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'HT_id' }) // Foreign key column in the database
  hotel: Hotel;

  @Column({ name: 'HT_id' }) // This creates an actual column for the foreign key
  HT_id: number;
}
