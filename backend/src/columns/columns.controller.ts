import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ColumnsService } from './columns.service';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @ApiOperation({ summary: 'Add a new column to a board' })
  @Post('boards/:boardId/columns')
  createColumn(
    @Param('boardId') boardId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.createColumn(boardId, userId, dto);
  }

  @ApiOperation({ summary: 'Update column title or position order' })
  @Patch('columns/:id')
  updateColumn(
    @Param('id') columnId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.updateColumn(columnId, userId, dto);
  }

  @ApiOperation({ summary: 'Delete a column and its tasks' })
  @Delete('columns/:id')
  deleteColumn(
    @Param('id') columnId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.columnsService.deleteColumn(columnId, userId);
  }
}
