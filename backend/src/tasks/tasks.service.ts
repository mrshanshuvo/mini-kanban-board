import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async verifyBoardEditAccess(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isOwner = board.ownerId === userId;
    const member = board.members.find((m: any) => m.userId === userId);

    if (!isOwner && (!member || member.role === 'VIEWER')) {
      throw new ForbiddenException('You do not have edit access to this board');
    }

    return board;
  }

  async createTask(columnId: string, userId: string, dto: CreateTaskDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.verifyBoardEditAccess(column.boardId, userId);

    let order = dto.order;
    if (order === undefined) {
      const lastTask = await this.prisma.task.findFirst({
        where: { columnId },
        orderBy: { order: 'desc' },
      });
      order = lastTask ? lastTask.order + 1000 : 1000;
    }

    return this.prisma.task.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        order,
        columnId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateTask(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyBoardEditAccess(task.column.boardId, userId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title?.trim(),
        description: dto.description?.trim(),
        priority: dto.priority,
        assigneeId: dto.assigneeId === null ? null : dto.assigneeId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyBoardEditAccess(task.column.boardId, userId);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  /**
   * Task Movement API:
   * Handles reordering tasks within the same column or across different columns.
   * Runs inside an atomic transaction to ensure stable, conflict-free, and race-condition-safe ordering.
   */
  async moveTask(taskId: string, userId: string, dto: MoveTaskDto) {
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Fetch current task with its column and board
      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: {
          column: {
            include: { board: { include: { members: true } } },
          },
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check access on source board
      const sourceBoard = task.column.board;
      const isOwnerSource = sourceBoard.ownerId === userId;
      const memberSource = sourceBoard.members.find(
        (m: any) => m.userId === userId,
      );
      if (!isOwnerSource && (!memberSource || memberSource.role === 'VIEWER')) {
        throw new ForbiddenException(
          'You do not have permission to modify tasks on this board',
        );
      }

      // 2. Fetch target column with its board to ensure it's in the same board / accessible
      const targetColumn = await tx.column.findUnique({
        where: { id: dto.targetColumnId },
      });

      if (!targetColumn) {
        throw new NotFoundException('Target column not found');
      }

      if (targetColumn.boardId !== sourceBoard.id) {
        throw new BadRequestException(
          'Cannot move tasks across different boards',
        );
      }

      // 3. Fetch all other tasks currently in the target column (excluding current task if moving in same column)
      const existingTasksInTarget = await tx.task.findMany({
        where: {
          columnId: dto.targetColumnId,
          NOT: { id: taskId },
        },
        orderBy: { order: 'asc' },
      });

      // 4. Calculate new stable order index
      const targetIndex = Math.max(
        0,
        Math.min(dto.newPositionIndex, existingTasksInTarget.length),
      );
      let newOrder = 1000;

      if (existingTasksInTarget.length === 0) {
        // Target column has no tasks yet
        newOrder = 1000;
      } else if (targetIndex === 0) {
        // Moving to very top of target column
        const firstOrder = existingTasksInTarget[0].order;
        newOrder = firstOrder - 1000;
      } else if (targetIndex >= existingTasksInTarget.length) {
        // Moving to very bottom of target column
        const lastOrder =
          existingTasksInTarget[existingTasksInTarget.length - 1].order;
        newOrder = lastOrder + 1000;
      } else {
        // Moving between two items
        const prevOrder = existingTasksInTarget[targetIndex - 1].order;
        const nextOrder = existingTasksInTarget[targetIndex].order;
        const mid = (prevOrder + nextOrder) / 2;

        // If precision gets too tight (e.g. less than 0.001 difference), rebalance target column
        if (Math.abs(nextOrder - prevOrder) < 0.001) {
          // Rebalance entire target column with clean step increments
          const rebalancedTasks = [
            ...existingTasksInTarget.slice(0, targetIndex),
            task,
            ...existingTasksInTarget.slice(targetIndex),
          ];

          for (let i = 0; i < rebalancedTasks.length; i++) {
            const rebalancedOrder = (i + 1) * 1000;
            if (rebalancedTasks[i].id === taskId) {
              newOrder = rebalancedOrder;
            } else {
              await tx.task.update({
                where: { id: rebalancedTasks[i].id },
                data: { order: rebalancedOrder },
              });
            }
          }
        } else {
          newOrder = mid;
        }
      }

      // 5. Update task with new columnId and order
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          columnId: dto.targetColumnId,
          order: newOrder,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      });

      return updatedTask;
    });
  }
}
