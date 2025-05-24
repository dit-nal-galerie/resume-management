# Тестирование API восстановления пароля

## Тестирование запроса восстановления пароля

```bash
curl -X POST http://localhost:3001/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "loginname": "testuser",
    "email": "test@example.com"
  }'
```

## Тестирование проверки токена

```bash
curl -X GET "http://localhost:3001/validate-token?token=YOUR_TOKEN"
```

## Тестирование сброса пароля

```bash
curl -X POST http://localhost:3001/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "newPassword": "newpassword123"
  }'
```
