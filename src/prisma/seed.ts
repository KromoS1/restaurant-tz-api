import { PrismaClient, TableType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаю инициализацию данных...');

  const tables = await Promise.all([
    prisma.table.create({
      data: {
        number: 1,
        minSeats: 2,
        maxSeats: 4,
        type: TableType.REGULAR,
        location: 'У входа',
        description: 'Обычный столик рядом с входом',
        positionX: 100,
        positionY: 100,
        shape: 'circle',
        radius: 40,
      },
    }),
    prisma.table.create({
      data: {
        number: 2,
        minSeats: 2,
        maxSeats: 4,
        type: TableType.REGULAR,
        location: 'В центре зала',
        description: 'Обычный столик в центре зала',
        positionX: 250,
        positionY: 100,
        shape: 'circle',
        radius: 40,
      },
    }),
    prisma.table.create({
      data: {
        number: 3,
        minSeats: 4,
        maxSeats: 6,
        type: TableType.REGULAR,
        location: 'У окна',
        description: 'Обычный столик у окна',
        positionX: 400,
        positionY: 100,
        shape: 'rect',
        width: 80,
        height: 60,
      },
    }),
    prisma.table.create({
      data: {
        number: 4,
        minSeats: 4,
        maxSeats: 6,
        type: TableType.REGULAR,
        location: 'У стены',
        description: 'Обычный столик у стены',
        positionX: 550,
        positionY: 100,
        shape: 'rect',
        width: 80,
        height: 60,
      },
    }),
    prisma.table.create({
      data: {
        number: 5,
        minSeats: 3,
        maxSeats: 5,
        type: TableType.REGULAR,
        location: 'Центр зала',
        description: 'Овальный столик в центре',
        positionX: 100,
        positionY: 250,
        shape: 'ellipse',
        width: 90,
        height: 60,
      },
    }),
    prisma.table.create({
      data: {
        number: 6,
        minSeats: 3,
        maxSeats: 5,
        type: TableType.REGULAR,
        location: 'Центр зала',
        description: 'Овальный столик в центре',
        positionX: 250,
        positionY: 250,
        shape: 'ellipse',
        width: 90,
        height: 60,
      },
    }),

    prisma.table.create({
      data: {
        number: 10,
        minSeats: 2,
        maxSeats: 4,
        type: TableType.VIP,
        location: 'VIP зона',
        description: 'VIP столик с отдельной зоной',
        positionX: 400,
        positionY: 250,
        shape: 'circle',
        radius: 45,
      },
    }),
    prisma.table.create({
      data: {
        number: 11,
        minSeats: 4,
        maxSeats: 6,
        type: TableType.VIP,
        location: 'VIP зона',
        description: 'VIP столик для компании',
        positionX: 550,
        positionY: 250,
        shape: 'rect',
        width: 100,
        height: 70,
      },
    }),

    prisma.table.create({
      data: {
        number: 20,
        minSeats: 4,
        maxSeats: 8,
        type: TableType.FAMILY,
        location: 'Семейная зона',
        description: 'Большой семейный столик',
        positionX: 100,
        positionY: 400,
        shape: 'rect',
        width: 120,
        height: 80,
      },
    }),
    prisma.table.create({
      data: {
        number: 21,
        minSeats: 6,
        maxSeats: 10,
        type: TableType.FAMILY,
        location: 'Семейная зона',
        description: 'Большой семейный столик для больших компаний',
        positionX: 300,
        positionY: 400,
        shape: 'circle',
        radius: 50,
      },
    }),
  ]);

  console.log(`Создано ${tables.length} столиков`);

  const guests = await Promise.all([
    prisma.guest.create({
      data: {
        name: 'Иван Петров',
        phone: '+7-900-123-45-67',
        email: 'ivan.petrov@example.com',
        notes: 'Предпочитает столики у окна',
      },
    }),
    prisma.guest.create({
      data: {
        name: 'Мария Сидорова',
        phone: '+7-900-987-65-43',
        email: 'maria.sidorova@example.com',
        notes: 'Вегетарианка',
      },
    }),
    prisma.guest.create({
      data: {
        name: 'Алексей Козлов',
        phone: '+7-900-555-12-34',
        email: 'alexey.kozlov@example.com',
      },
    }),
  ]);

  console.log(`Создано ${guests.length} гостей`);

  console.log('Инициализация данных завершена!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
