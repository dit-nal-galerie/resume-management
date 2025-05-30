import React, { useEffect, useState } from "react";
import { User } from "../../../interfaces/User";
import { loadUserFromStorage } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { updateAccessData } from "../services/api";
import { useTranslation } from "react-i18next"; // <-- hinzugefügt

const ChangeAccessData: React.FC = () => {
  const { t } = useTranslation(); // <-- hinzugefügt
  const [formData, setFormData] = useState({
    loginname: "",
    email: "",
    password: "",
    password2: "",
    oldPassword: "",
    changePassword: false,
  });
  const loginUser:User= loadUserFromStorage();
  useEffect(() => {
    setFormData({loginname: loginUser.loginname, email: loginUser.email, password: "", password2: "", oldPassword: "", changePassword: false});
  }, []);
  const handleFieldChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/resumes');
  };
  const handleSave = async () => {
    try {
      const response = await updateAccessData({ ...formData, userId: loginUser.loginid }); // API-Aufruf
      if (response.success) {
        localStorage.setItem("user", JSON.stringify(response.user)); // vom Backend zurück
        alert(t("profile.saveSuccess"));
        navigate("/resumes");
      } else {
        alert(t("profile.saveError") + ": " + response.message);
      }
    } catch (error) {
      alert(t("profile.saveError"));
      console.error(error);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold">{t("profile.title")} {t("common.edit")}</h2>

      {/* Loginname */}
      <div>
        <label htmlFor="loginname" className="block text-sm font-medium text-gray-700">
          {t("login.username")}
        </label>
        <input
          id="loginname"
          type="text"
          value={formData.loginname}
          onChange={(e) => handleFieldChange("loginname", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder={t("login.usernamePlaceholder")}
        />
      </div>

      {/* E-Mail */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t("profile.email")}
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder={t("profile.email")}
        />
      </div>

      {/* Checkbox Passwort ändern */}
      <div className="flex items-center space-x-2">
        <input
          id="changePassword"
          type="checkbox"
          checked={formData.changePassword}
          onChange={(e) => handleFieldChange("changePassword", e.target.checked)}
        />
        <label htmlFor="changePassword" className="text-sm text-gray-700">{t("login.password") + " " + t("common.edit")}</label>
      </div>

      {/* Neue Passwörter nur wenn gecheckt */}
      {formData.changePassword && (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t("passwordReset.newPassword")}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder={t('passwordReset.newPasswordPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
              {t("passwordReset.confirmPassword")}
            </label>
            <input
              id="password2"
              type="password"
              value={formData.password2}
              onChange={(e) => handleFieldChange("password2", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder={t("passwordReset.confirmPasswordPlaceholder")}
            />
          </div>
        </>
      )}

      {/* Altes Passwort / Passwort */}
      <div>
        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
          {formData.changePassword ? t("passwordReset.newPassword") : t("login.password")}
        </label>
        <input
          id="oldPassword"
          type="password"
          value={formData.oldPassword}
          onChange={(e) => handleFieldChange("oldPassword", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder={formData.changePassword ? t("passwordReset.newPasswordPlaceholder") : t("login.passwordPlaceholder")}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-md "
        >
          {t("common.save")}
        </button>
        <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded-md"
            onClick={handleBack}
          >
            {t("common.back")}
          </button>
      </div>
    </>
  );
};

export default ChangeAccessData;