import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('node/:nodeId')
  findByNode(@Param('nodeId', ParseIntPipe) nodeId: number) {
    return this.commentsService.findByNode(nodeId);
  }

  @Post()
  create(@Body() dto: CreateCommentDto, @Req() req: any) {
    return this.commentsService.create(dto, req.user.id);
  }
}
