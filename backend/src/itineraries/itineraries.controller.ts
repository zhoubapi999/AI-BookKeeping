import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('itineraries')
@UseGuards(JwtAuthGuard)
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post()
  create(@Request() req, @Body() createItineraryDto: CreateItineraryDto) {
    return this.itinerariesService.create(createItineraryDto, req.user.userId);
  }

  @Get()
  findAll(@Query('ledgerId') ledgerId: string) {
    return this.itinerariesService.findAll(ledgerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itinerariesService.remove(id);
  }
}
