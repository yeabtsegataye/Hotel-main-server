import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Food } from 'src/food/entities/food.entity';

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Food, (food) => food.ingredients, { onDelete: 'CASCADE' })
  food: Food;
}
