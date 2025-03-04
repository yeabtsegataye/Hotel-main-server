import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity'; // Import the Hotel entity
import { IsNotEmpty } from 'class-validator';

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;
  @IsNotEmpty()
  @Column({ length: 100 })
  firstName: string;

  @IsNotEmpty()
  @Column({ length: 100 })
  lastName: string;

  @IsNotEmpty()
  @Column({ unique: true, length: 100 })
  email: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  password: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  salary: string;

  @IsNotEmpty()
  @Column({ length: 20, nullable: false })
  phone: string;

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  department: string;

  @IsNotEmpty()
  @Column({ length: 100, nullable: true })
  jobTitle: string;

  @Column({ length: 255, nullable: false })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  country: string;

  @Column({ default: 'employee', nullable: false })
  role: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true, type: 'timestamp' })
  otpExpiration: Date;

  // Define the foreign key relationship with the Hotel entity
  @ManyToOne(() => Hotel, (hotel) => hotel.employees, { onDelete: 'CASCADE' })
  hotel: Hotel;
}
