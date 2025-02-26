import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Ingredient } from 'src/ingredient/entities/ingredient.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Category } from 'src/category/entities/category.entity';

@Entity()
export class Food {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  rate: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category, (category) => category.foods, { onDelete: 'CASCADE' })
  category: Category;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.food)
  ingredients: Ingredient[];

  @OneToMany(() => Comment, (comment) => comment.food)
  comments: Comment[];
}
