import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto, ShareBoardDto } from './dto/board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @ApiOperation({
    summary: 'List all boards owned by or shared with current user',
  })
  @Get()
  getUserBoards(@CurrentUser('id') userId: string) {
    return this.boardsService.getUserBoards(userId);
  }

  @ApiOperation({ summary: 'Create a new board' })
  @Post()
  createBoard(@CurrentUser('id') userId: string, @Body() dto: CreateBoardDto) {
    return this.boardsService.createBoard(userId, dto);
  }

  @ApiOperation({ summary: 'Get full board details with columns and tasks' })
  @Get(':id')
  getBoardById(
    @Param('id') boardId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.getBoardById(boardId, userId);
  }

  @ApiOperation({ summary: 'Update board title or description' })
  @Patch(':id')
  updateBoard(
    @Param('id') boardId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.updateBoard(boardId, userId, dto);
  }

  @ApiOperation({ summary: 'Delete a board (Owner only)' })
  @Delete(':id')
  deleteBoard(@Param('id') boardId: string, @CurrentUser('id') userId: string) {
    return this.boardsService.deleteBoard(boardId, userId);
  }

  @ApiOperation({ summary: 'Share board with another user by email' })
  @Post(':id/members')
  shareBoard(
    @Param('id') boardId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ShareBoardDto,
  ) {
    return this.boardsService.shareBoard(boardId, userId, dto);
  }

  @ApiOperation({ summary: 'Remove a member or leave board' })
  @Delete(':id/members/:targetUserId')
  removeMember(
    @Param('id') boardId: string,
    @CurrentUser('id') currentUserId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.boardsService.removeMember(
      boardId,
      currentUserId,
      targetUserId,
    );
  }
}
