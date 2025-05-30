import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Извлечение токена из URL при загрузке компонента
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("token");
    
    if (!tokenFromUrl) {
      setServerError(t('passwordReset.invalidToken'));
    } else {
      setToken(tokenFromUrl);
    }
  }, [location, t]);

  // Функция для отправки запроса на сброс пароля
  const resetPassword = async (token: string, newPassword: string) => {
    // Здесь будет реализация API-запроса
    // Пока используем заглушку, которая имитирует успешный ответ
    
    // Имитация задержки сети
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Имитация успешного ответа
        resolve(true);
        
        // Для тестирования ошибки можно использовать:
        // resolve(false);
        // или throw new Error("Сетевая ошибка");
      }, 1000);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Очистка предыдущих ошибок
    setErrors({});
    setServerError(null);
    
    // Валидация
    let hasErrors = false;
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    
    if (!newPassword || newPassword.length < 2) {
      newErrors.newPassword = t('passwordReset.passwordMinLength');
      hasErrors = true;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('passwordReset.confirmPasswordRequired');
      hasErrors = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('passwordReset.passwordsDoNotMatch');
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    // Проверка наличия токена
    if (!token) {
      setServerError(t('passwordReset.invalidToken'));
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await resetPassword(token, newPassword);
      
      if (result) {
        setIsSuccess(true);
        // Автоматический редирект на страницу логина через 3 секунды
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setServerError(t('common.error'));
      }
    } catch (error) {
      setServerError(t('common.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = () => {
    // Очистка ошибок при потере фокуса
    setErrors({});
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">{t('passwordReset.resetTitle')}</h2>
        
        {isSuccess ? (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>{t('passwordReset.resetSuccess')}</p>
              <p className="mt-2">{t('passwordReset.redirecting')}</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {t('navigation.backToLogin')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Сообщение об ошибке токена */}
            {serverError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {serverError}
              </div>
            )}
            
            {/* Новый пароль */}
            <div>
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
                {t('passwordReset.newPassword')}
              </label>
              <input
                id="newPassword"
                type="password"
                className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
                  errors.newPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder={t('passwordReset.newPasswordPlaceholder')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
                {t('passwordReset.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder={t('passwordReset.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Кнопка отправки */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="submit"
                className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading || !token}
              >
                {isLoading ? t('common.loading') : t('passwordReset.resetPassword')}
              </button>
            </div>
            
            {/* Ссылка на страницу логина */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-500 hover:underline focus:outline-none"
                disabled={isLoading}
              >
                {t('navigation.backToLogin')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
