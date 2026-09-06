// Prisma 7+ Language Server compatibility config
export default {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kanban_db?schema=public',
  },
};
