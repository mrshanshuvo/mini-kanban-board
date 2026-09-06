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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a new task inside a column' })
  @Post('columns/:columnId/tasks')
  createTask(
    @Param('columnId') columnId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(columnId, userId, dto);
  }

  @ApiOperation({
    summary: 'Update task properties (title, description, priority, assignee)',
  })
  @Patch('tasks/:id')
  updateTask(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(taskId, userId, dto);
  }

  @ApiOperation({ summary: 'Delete a task' })
  @Delete('tasks/:id')
  deleteTask(@Param('id') taskId: string, @CurrentUser('id') userId: string) {
    return this.tasksService.deleteTask(taskId, userId);
  }

  @ApiOperation({
    summary: 'Move or reorder a task within same column or across columns',
    description:
      'Takes targetColumnId and newPositionIndex (0-based) and atomically updates order ensuring stability and consistency.',
  })
  @Patch('tasks/:id/move')
  moveTask(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.moveTask(taskId, userId, dto);
  }
}
