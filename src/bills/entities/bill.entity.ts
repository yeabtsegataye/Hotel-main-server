import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  HT_id: string;
}
