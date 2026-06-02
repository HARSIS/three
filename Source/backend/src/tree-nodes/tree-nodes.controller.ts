import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTreeNodeDto } from './dto/create-tree-node.dto';
import { UpdateTreeNodeDto } from './dto/update-tree-node.dto';
import { TreeNodesService } from './tree-nodes.service';

@Controller('tree-nodes')
@UseGuards(JwtAuthGuard)
export class TreeNodesController {
  constructor(private readonly treeNodesService: TreeNodesService) {}

  @Get('tree/:treeId')
  findByTree(@Param('treeId', ParseIntPipe) treeId: number, @Req() req: any) {
    return this.treeNodesService.findByTree(treeId, req.user);
  }

  @Post()
  create(@Body() dto: CreateTreeNodeDto, @Req() req: any) {
    return this.treeNodesService.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTreeNodeDto, @Req() req: any) {
    return this.treeNodesService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.treeNodesService.remove(id, req.user);
  }
}
