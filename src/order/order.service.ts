import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Food } from 'src/food/entities/food.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,

    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) {}

  // Create order(s)
  async create(createOrderDto: CreateOrderDto[]) {
    console.log(createOrderDto,'dtooo')
    try {
      // Check if the input is valid
      if (!createOrderDto || createOrderDto.length === 0) {
        throw new BadRequestException('Order data cannot be empty.');
      }

      // Validate hotel (assuming all orders belong to the same hotel)
     

      // Process each order
      const orders = await Promise.all(
        createOrderDto.map(async (order) => {
          const hotelId = createOrderDto[0].hotelId;
          const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
          if (!hotel) {
            throw new NotFoundException(`Hotel with ID ${hotelId} not found.`);
          }
          // Validate food
          const food = await this.foodRepository.findOne({ where: { id: order.foodId } });
          if (!food) {
            throw new NotFoundException(`Food with ID ${order.foodId} not found.`);
          }

          // Create order entity
          return this.orderRepository.create({
            food: food,
            quantity: order.quantity,
            order_tabel: order.orderTable,
            hotel: hotel,
          });
        }),
      );

      // Save all orders
      await this.orderRepository.save(orders);
      return { message: 'Order(s) placed successfully!', orders };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create order: ${error.message}`);
    }
  }

  // Get all orders
  async findAll() {
    try {
      return await this.orderRepository.find({ relations: ['hotel'] });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch orders: ${error.message}`);
    }
  }

  // Get single order by ID
  async findOne(id: number) {
    try {
      const order = await this.orderRepository.findOne({ where: { id }, relations: ['hotel'] });
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }
      return order;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch order: ${error.message}`);
    }
  }

  // Update order
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }

      Object.assign(order, updateOrderDto);
      await this.orderRepository.save(order);
      return { message: 'Order updated successfully!', order };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update order: ${error.message}`);
    }
  }

  // Delete order
  async remove(id: number) {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }

      await this.orderRepository.delete(id);
      return { message: 'Order deleted successfully!' };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete order: ${error.message}`);
    }
  }
}
