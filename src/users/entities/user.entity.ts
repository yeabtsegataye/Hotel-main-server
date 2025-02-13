// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column({nullable: false,unique: true})
  email: string;

  @Column()
  Password: string;
  
  @Column()
  phone: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
