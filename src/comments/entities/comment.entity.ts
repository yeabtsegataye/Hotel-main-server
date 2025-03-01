import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Food } from 'src/food/entities/food.entity';
import { User } from 'src/users/entities/user.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column('text')
  description: string;

  @ManyToOne(() => Food, (food) => food.comments, { onDelete: 'CASCADE' })
  food: Food;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;
}
