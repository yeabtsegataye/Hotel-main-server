import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Food } from 'src/food/entities/food.entity';
import { WebSocketGateways } from 'src/Sockets/websocket.gateway';
import { CustomRequest } from 'src/auth/custom-request.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,

    @InjectRepository(Food)
    private foodRepository: Repository<Food>,

    private readonly webSocketGateway: WebSocketGateways, // Inject WebSocket Gateway

    private readonly jwtService: JwtService,
    
  ) {}
    /**
   * Extracts hotel_id from the employee's JWT token.
   */
    private extractHotelIdFromToken(req: CustomRequest): number {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
      }
  
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);
  
      if (!decoded || !decoded.hotel_id) {
        throw new UnauthorizedException('Invalid token payload');
      }
  
      return decoded.hotel_id;
    }

  // Create order(s)
  async create(createOrderDto: CreateOrderDto[]) {
    console.log(createOrderDto, 'dtooo');
    try {
      // Check if the input is valid
      if (!createOrderDto || createOrderDto.length === 0) {
        throw new BadRequestException('Order data cannot be empty.');
      }

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
            customerName: order.userID || 'Guest',
            hotel: hotel,
          });
        }),
      );

      // Save all orders
      await this.orderRepository.save(orders);

      // **🔥 Send WebSocket Notification After Successfully Placing Order**
      const hotelId = createOrderDto[0].hotelId;
      this.webSocketGateway.handleNewOrder(null, {
        hotelId,
        orderDetails: orders,
      });

      return { message: 'Order(s) placed successfully!', orders };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create order: ${error.message}`);
    }
  }

  // Get all orders
  async findAll(req: CustomRequest) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);
      const orders = await this.orderRepository.find({
        where: { hotel: { id: hotelId } }, // Filter by hotel ID
        relations: ['hotel', 'food'], // Include relations
      });
      return orders;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch orders: ${error.message}`);
    }
  }


  // Get single order by ID
  async findOne(req: CustomRequest, id: number) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);

      const order = await this.orderRepository.findOne({
        where: { id, hotel: { id: hotelId } }, // Ensure the order belongs to the hotel
        relations: ['hotel', 'food'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }

      return order;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch order: ${error.message}`);
    }
  }

  // Update order
  async update(req: CustomRequest, id: number, updateOrderDto: UpdateOrderDto) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);
 if(!hotelId){
  throw new NotFoundException(`hotel with ID ${id} not found.`);

 }
      const order = await this.orderRepository.findOne({
        where: { id, hotel: { id: hotelId } }, // Ensure the order belongs to the hotel
      });

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
  async remove(req: CustomRequest, id: number) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);

      const order = await this.orderRepository.findOne({
        where: { id, hotel: { id: hotelId } }, // Ensure the order belongs to the hotel
      });

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
