// user.entity.ts
import { Comment } from 'src/comments/entities/comment.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  Password: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  licenceKey: string;

  @Column({ default: 'admin' })
  role: string;

  // One user can have many hotels
  @OneToMany(() => Hotel, (hotel) => hotel.user)
  hotels: Hotel[];

   @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
