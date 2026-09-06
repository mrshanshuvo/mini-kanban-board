import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto, UpdateBoardDto, ShareBoardDto } from './dto/board.dto';
import { BoardRole } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async getUserBoards(userId: string) {
    // Return all boards where user is either the owner or a member
    return this.prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: { columns: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createBoard(userId: string, dto: CreateBoardDto) {
    const board = await this.prisma.board.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        ownerId: userId,
        // Automatically scaffold initial columns for immediate productivity
        columns: {
          create: [
            { title: 'To Do', order: 1000 },
            { title: 'In Progress', order: 2000 },
            { title: 'Done', order: 3000 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: { tasks: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return board;
  }

  async getBoardById(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                assignee: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isOwner = board.ownerId === userId;
    const member = board.members.find((m: any) => m.userId === userId);

    if (!isOwner && !member) {
      throw new ForbiddenException('You do not have permission to view this board');
    }

    return {
      ...board,
      userRole: isOwner ? 'OWNER' : member?.role,
    };
  }

  async updateBoard(boardId: string, userId: string, dto: UpdateBoardDto) {
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
      throw new ForbiddenException('You do not have permission to update this board');
    }

    return this.prisma.board.update({
      where: { id: boardId },
      data: {
        title: dto.title?.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  async deleteBoard(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the board owner can delete this board');
    }

    return this.prisma.board.delete({
      where: { id: boardId },
    });
  }

  async shareBoard(boardId: string, currentUserId: string, dto: ShareBoardDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Only owner or existing editor can share board
    const isOwner = board.ownerId === currentUserId;
    const currentMember = board.members.find((m: any) => m.userId === currentUserId);

    if (!isOwner && (!currentMember || currentMember.role !== 'EDITOR')) {
      throw new ForbiddenException('You do not have permission to share this board');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with email "${dto.email}" does not exist`);
    }

    if (targetUser.id === board.ownerId) {
      throw new BadRequestException('Cannot share board with the owner');
    }

    const existingMember = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      // Update role if already member
      return this.prisma.boardMember.update({
        where: { id: existingMember.id },
        data: { role: dto.role as BoardRole },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }

    return this.prisma.boardMember.create({
      data: {
        boardId,
        userId: targetUser.id,
        role: dto.role as BoardRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async removeMember(boardId: string, currentUserId: string, targetUserId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Owner can remove anyone, or a user can remove themselves (leave board)
    if (board.ownerId !== currentUserId && currentUserId !== targetUserId) {
      throw new ForbiddenException('You do not have permission to remove this member');
    }

    return this.prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: targetUserId,
        },
      },
    });
  }
}
