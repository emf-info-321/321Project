import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  findAll() {
    return this.entriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entriesService.findOne(parseInt(id, 10));
  }

  @Post()
  create(@Body() dto: { userId: string; project: string; date: string; hours: number }) {
    return this.entriesService.create(dto);
  }
}