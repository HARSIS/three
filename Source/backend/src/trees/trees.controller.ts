import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { TreesService } from './trees.service';

@Controller('trees')
@UseGuards(JwtAuthGuard)
export class TreesController {
  constructor(private readonly treesService: TreesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.treesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.treesService.findOne(id, req.user);
  }

  @Get(':id/nested')
  getNestedTree(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.treesService.getNestedTree(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateTreeDto, @Req() req: any) {
    return this.treesService.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTreeDto, @Req() req: any) {
    return this.treesService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.treesService.remove(id, req.user);
  }
}
