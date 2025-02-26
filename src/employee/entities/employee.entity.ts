import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity'; // Import the Hotel entity

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 20, nullable: false })
  phone: string;

  @Column({ length: 100, nullable: false })
  department: string;

  @Column({ length: 100, nullable: true })
  jobTitle: string;

  @Column({ length: 255, nullable: false })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: false })
  country: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  // Define the foreign key relationship with the Hotel entity
  @ManyToOne(() => Hotel, (hotel) => hotel.employees, { onDelete: 'CASCADE' }) 
  hotel: Hotel;
}
