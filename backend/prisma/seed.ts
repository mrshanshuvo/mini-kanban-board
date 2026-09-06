import { PrismaClient, TaskPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample users, boards, columns, and tasks...');

  // 1. Clean existing records
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const alex = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      name: 'Alex Rivera',
      passwordHash,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      passwordHash,
    },
  });

  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash,
    },
  });

  console.log('Created test users:', alex.email, sarah.email, john.email);

  // 3. Create Board
  const productBoard = await prisma.board.create({
    data: {
      title: 'Product Launch Roadmap',
      description: 'Mini Kanban Board tracking deliverables for Q3 releases',
      ownerId: alex.id,
      members: {
        create: [
          { userId: sarah.id, role: 'EDITOR' },
          { userId: john.id, role: 'VIEWER' },
        ],
      },
    },
  });

  // 4. Create Columns
  const colTodo = await prisma.column.create({
    data: {
      title: 'Backlog & To Do',
      order: 1000,
      boardId: productBoard.id,
    },
  });

  const colProgress = await prisma.column.create({
    data: {
      title: 'In Progress',
      order: 2000,
      boardId: productBoard.id,
    },
  });

  const colReview = await prisma.column.create({
    data: {
      title: 'Review & QA',
      order: 3000,
      boardId: productBoard.id,
    },
  });

  const colDone = await prisma.column.create({
    data: {
      title: 'Done',
      order: 4000,
      boardId: productBoard.id,
    },
  });

  // 5. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Design high-converting landing page',
        description: 'Create Figma designs with responsive layouts and vibrant tokens',
        columnId: colTodo.id,
        order: 1000,
        priority: TaskPriority.HIGH,
        assigneeId: sarah.id,
      },
      {
        title: 'Draft technical specifications',
        description: 'Detail the endpoints, Swagger docs, and schema definitions',
        columnId: colTodo.id,
        order: 2000,
        priority: TaskPriority.MEDIUM,
        assigneeId: alex.id,
      },
      {
        title: 'Build drag-and-drop task movement',
        description: 'Fluid drag with @hello-pangea/dnd and optimistic reordering',
        columnId: colProgress.id,
        order: 1000,
        priority: TaskPriority.URGENT,
        assigneeId: alex.id,
      },
      {
        title: 'Board permission & access control checks',
        description: 'Verify OWNER, EDITOR, and VIEWER roles across all mutations',
        columnId: colReview.id,
        order: 1000,
        priority: TaskPriority.HIGH,
        assigneeId: sarah.id,
      },
      {
        title: 'Setup PostgreSQL and Prisma schemas',
        description: 'Postgres container and Prisma migrations ready',
        columnId: colDone.id,
        order: 1000,
        priority: TaskPriority.LOW,
        assigneeId: alex.id,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
