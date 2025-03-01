import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Bill } from 'src/bills/entities/bill.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { Category } from 'src/category/entities/category.entity';
import { Order } from 'src/order/entities/order.entity';
import { Review } from 'src/review/entities/review.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  hotel_name: string;

  @IsNotEmpty()
  @Column()
  hotel_description: string;

  @Column({ nullable: true }) // Make hotel_img nullable
  hotel_img?: string;

  // Many hotels belong to one user
  @ManyToOne(() => User, (user) => user.hotels)
  user: User;

  // One hotel can have many bills
  @OneToMany(() => Bill, (bill) => bill.hotel)
  bills: Bill[];

  @OneToMany(() => Employee, (employee) => employee.hotel) // One hotel has many employees
  employees: Employee[];

  @OneToMany(() => Category, (category) => category.hotel) // One hotel has many categories
  categories: Category[];

  @OneToMany(() => Order, (order) => order.hotel)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.hotel)
  reviews: Review[];
}
