# Команды для работы с базой данных

## Настройка окружения

1. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

2. Укажите правильные данные для подключения к PostgreSQL в `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db?schema=public"
```

## Основные команды Prisma

### Генерация Prisma Client
```bash
npm run prisma:generate
```

### Применение схемы к базе данных (для разработки)
```bash
npm run prisma:push
```

### Создание миграции
```bash
npm run prisma:migrate
# Введите название миграции, например: "init"
```

### Применение миграций в продакшене
```bash
npm run prisma:migrate:deploy
```

### Сброс базы данных (ВНИМАНИЕ: удаляет все данные!)
```bash
npm run prisma:migrate:reset
```

### Запуск Prisma Studio (GUI для просмотра данных)
```bash
npm run prisma:studio
```

### Заполнение базы тестовыми данными
```bash
npm run prisma:seed
```

## Пошаговая настройка проекта

1. **Установите зависимости:**
```bash
npm install
```

2. **Настройте базу данных PostgreSQL**
   - Установите PostgreSQL
   - Создайте базу данных `restaurant_db`
   - Обновите `DATABASE_URL` в `.env`

3. **Сгенерируйте Prisma Client:**
```bash
npm run prisma:generate
```

4. **Примените схему к базе данных:**
```bash
npm run prisma:push
```

5. **Заполните базу тестовыми данными:**
```bash
npm run prisma:seed
```

6. **Проверьте данные в Prisma Studio:**
```bash
npm run prisma:studio
```

## Структура базы данных

### Таблицы:

1. **tables** - Столики ресторана
   - id, number, minSeats, maxSeats, type, status, location, description

2. **guests** - Информация о гостях
   - id, name, phone, email, notes

3. **reservations** - Бронирования
   - id, guestId, tableId, guestCount, reservationDate, duration, status, specialRequests, notes

4. **analytics** - Аналитика загруженности
   - id, tableId, date, totalGuests, totalRevenue, peakHourStart, peakHourEnd, avgDuration

### Enums:

- **TableType**: REGULAR, VIP, FAMILY
- **TableStatus**: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE  
- **ReservationStatus**: PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED, NO_SHOW
