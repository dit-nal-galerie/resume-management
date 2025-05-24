# Интеграция функциональности восстановления пароля

## Обзор

Данная интеграция добавляет в TypeScript-бэкенд полноценную функциональность восстановления пароля:
1. Запрос восстановления пароля (проверка пользователя и отправка email)
2. Проверка валидности токена
3. Сброс пароля по токену

## Добавленные файлы

1. **Интерфейсы**: `/interfaces/PasswordReset.ts`
2. **Сервис**: `/backend/src/services/passwordResetService.ts`
3. **Обновленные файлы**:
   - `/backend/src/resumeManagementAPI.ts` - добавлены методы для восстановления пароля
   - `/backend/src/server.ts` - добавлены маршруты для восстановления пароля
   - `/backend/dev.json` - добавлены параметры конфигурации для email и токенов

## Настройка

### 1. Конфигурация

В файле `dev.json` (и `prod.json` для продакшена) добавлены следующие параметры:

```json
{
  "EMAIL_FROM": "noreply@example.com",
  "EMAIL_HOST": "smtp.example.com",
  "EMAIL_PORT": "587",
  "EMAIL_USER": "user",
  "EMAIL_PASSWORD": "password",
  "EMAIL_SECURE": "false",
  "RESET_PASSWORD_URL": "http://localhost:3000/reset-password",
  "TOKEN_LENGTH": "32",
  "TOKEN_EXPIRY_MINUTES": "10"
}
```

Необходимо заменить эти значения на реальные параметры вашего SMTP-сервера и URL для восстановления пароля.

### 2. База данных

При первом запуске сервера автоматически создается таблица для токенов восстановления пароля:

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES authentification(id) ON DELETE CASCADE,
  UNIQUE KEY (token)
)
```

## API Endpoints

### 1. Запрос восстановления пароля
- **URL**: `/request-password-reset`
- **Метод**: `POST`
- **Тело запроса**:
  ```json
  {
    "loginname": "username",
    "email": "user@example.com"
  }
  ```
- **Ответ**:
  ```json
  {
    "success": true,
    "message": "Wenn ein Konto mit diesen Daten existiert, haben wir eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts gesendet."
  }
  ```

### 2. Проверка валидности токена
- **URL**: `/validate-token?token=YOUR_TOKEN`
- **Метод**: `GET`
- **Ответ при успехе**:
  ```json
  {
    "success": true,
    "message": "Token ist gültig"
  }
  ```
- **Ответ при ошибке**:
  ```json
  {
    "success": false,
    "error": "Ungültiger oder abgelaufener Token"
  }
  ```

### 3. Сброс пароля по токену
- **URL**: `/reset-password`
- **Метод**: `POST`
- **Тело запроса**:
  ```json
  {
    "token": "YOUR_TOKEN",
    "newPassword": "newpassword123"
  }
  ```
- **Ответ при успехе**:
  ```json
  {
    "success": true,
    "message": "Passwort wurde erfolgreich zurückgesetzt"
  }
  ```
- **Ответ при ошибке**:
  ```json
  {
    "success": false,
    "error": "Ungültiger oder abgelaufener Token"
  }
  ```

## Интеграция с фронтендом

Для интеграции с React-фронтендом:

1. Убедитесь, что URL в конфигурации (`RESET_PASSWORD_URL`) указывает на правильный адрес страницы восстановления пароля.

2. В React-компоненте `RequestPasswordReset.tsx` используйте следующий код для запроса восстановления пароля:
```typescript
const requestPasswordReset = async (loginname: string, email: string) => {
  try {
    const response = await fetch('http://localhost:3001/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginname, email }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};
```

3. В React-компоненте `ResetPassword.tsx` используйте следующий код для проверки токена и сброса пароля:
```typescript
// Для проверки токена
const validateToken = async (token: string) => {
  try {
    const response = await fetch(`http://localhost:3001/validate-token?token=${token}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating token:', error);
    throw error;
  }
};

// Для сброса пароля
const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch('http://localhost:3001/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};
```

## Безопасность

1. **Токены**:
   - Токены генерируются с использованием криптографически стойкого генератора случайных чисел
   - Токены имеют ограниченный срок действия (10 минут по умолчанию)
   - Токены могут быть использованы только один раз
   - Старые токены автоматически удаляются при создании новых

2. **Пароли**:
   - Пароли хешируются с использованием bcrypt
   - Минимальная длина пароля - 2 символа (можно увеличить в валидации)

3. **Защита от утечки информации**:
   - API не раскрывает информацию о существовании пользователя
   - Одинаковые сообщения возвращаются независимо от того, существует ли пользователь

## Тестирование

В файле `test-api.md` содержатся примеры запросов для тестирования API восстановления пароля с использованием curl.

## Рекомендации по улучшению

1. **Безопасность**:
   - Увеличить минимальную длину пароля до 8 символов
   - Добавить требования к сложности пароля (цифры, спецсимволы)
   - Настроить HTTPS для всех API-запросов
   - Добавить ограничение на количество попыток восстановления пароля

2. **Мониторинг**:
   - Добавить логирование всех попыток восстановления пароля
   - Настроить уведомления о подозрительной активности

3. **Дополнительные функции**:
   - Отправка уведомления пользователю при успешной смене пароля
   - Добавление информации об IP-адресе и устройстве в email-уведомления
