import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';

@Injectable()
export class ColumnsService {
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
      throw new ForbiddenException('You do not have permission to modify this board');
    }

    return board;
  }

  async createColumn(boardId: string, userId: string, dto: CreateColumnDto) {
    await this.verifyBoardEditAccess(boardId, userId);

    let order = dto.order;
    if (order === undefined) {
      // Find the highest order column and place this one after
      const lastColumn = await this.prisma.column.findFirst({
        where: { boardId },
        orderBy: { order: 'desc' },
      });
      order = lastColumn ? lastColumn.order + 1000 : 1000;
    }

    return this.prisma.column.create({
      data: {
        title: dto.title.trim(),
        order,
        boardId,
      },
      include: {
        tasks: true,
      },
    });
  }

  async updateColumn(columnId: string, userId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.verifyBoardEditAccess(column.boardId, userId);

    return this.prisma.column.update({
      where: { id: columnId },
      data: {
        title: dto.title?.trim(),
        order: dto.order,
      },
    });
  }

  async deleteColumn(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.verifyBoardEditAccess(column.boardId, userId);

    return this.prisma.column.delete({
      where: { id: columnId },
    });
  }
}
