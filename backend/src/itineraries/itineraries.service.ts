import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItineraryItem, ItineraryDocument } from './schemas/itinerary.schema';
import { CreateItineraryDto } from './dto/create-itinerary.dto';

@Injectable()
export class ItinerariesService {
  constructor(
    @InjectModel(ItineraryItem.name) private itineraryModel: Model<ItineraryDocument>,
  ) {}

  async create(createItineraryDto: CreateItineraryDto, userId: string): Promise<ItineraryItem> {
    const newItem = new this.itineraryModel({
      ...createItineraryDto,
      createdBy: userId,
    });
    return newItem.save();
  }

  async findAll(ledgerId: string): Promise<ItineraryItem[]> {
    return this.itineraryModel
      .find({ ledgerId })
      .sort({ date: 1 })
      .exec();
  }

  async remove(id: string): Promise<ItineraryItem> {
    const deleted = await this.itineraryModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Itinerary item #${id} not found`);
    }
    return deleted;
  }
}
