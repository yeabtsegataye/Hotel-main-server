// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column({nullable: false,unique: true})
  email: string;

  @Column({nullable: false})
  Password: string;
  
  @Column()
  phone: string;

  @Column({nullable:true})
  licenceKey : string;

  @Column({default:'admin'})
  role : string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
