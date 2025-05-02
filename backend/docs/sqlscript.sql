-- Создание базы данных
CREATE DATABASE IF NOT EXISTS bewerbungs CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bewerbungs;

-- Таблица аутентификации пользователей

CREATE TABLE authentification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loginname VARCHAR(40) NOT NULL,
    password VARCHAR(255) NOT NULL
); 
-- Таблица обращений
CREATE TABLE anrede (
    id INT PRIMARY KEY, -- Уникальный идентификатор
    text VARCHAR(20) NOT NULL -- Обращение (Herr, Frau и т.д.)
);
CREATE TABLE users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    loginid INT NOT NULL,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(80) NOT NULL UNIQUE,
    anrede INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    street VARCHAR(150) NOT NULL,
    houseNumber VARCHAR(20) NOT NULL,
    postalCode VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    FOREIGN KEY (loginid) REFERENCES authentification(id) ON DELETE CASCADE,
    FOREIGN KEY (anrede) REFERENCES anrede(id) ON DELETE CASCADE
); 




-- Таблица компаний
CREATE TABLE companies (
    companyId INT AUTO_INCREMENT PRIMARY KEY, -- Уникальный идентификатор компании
    name VARCHAR(200) NOT NULL, -- Название компании
    city VARCHAR(100) NOT NULL, -- Город
    street VARCHAR(150) NOT NULL, -- Улица
    houseNumber VARCHAR(20) NOT NULL, -- Номер дома
    postalCode VARCHAR(20) NOT NULL, -- Почтовый индекс
    isrecruter BOOLEAN DEFAULT FALSE, -- Рекрутер?
    ref INT NOT NULL, -- Связь с пользователем
    FOREIGN KEY (ref) REFERENCES authentification(id)
);

-- Таблица контактов


-- Таблица состояний
CREATE TABLE states (
     stateid INT PRIMARY KEY NOT NULL, -- Уникальный идентификатор
    text VARCHAR(40) NOT NULL -- Название состояния
);
CREATE TABLE contacts (
    contactid INT AUTO_INCREMENT PRIMARY KEY, -- Eindeutige ID für den Kontakt
    vorname VARCHAR(40) NOT NULL, -- Vorname des Kontakts
    name VARCHAR(40) NOT NULL, -- Nachname des Kontakts
    email VARCHAR(80) NOT NULL UNIQUE, -- E-Mail-Adresse (eindeutig)
    anrede INT NOT NULL, -- Verweis auf Tabelle `anrede`
    title VARCHAR(40), -- Titel (z. B. Dr., Prof.)
    zusatzname VARCHAR(40), -- Zusatzname (falls vorhanden)
    phone VARCHAR(20), -- Telefonnummer des Kontakts
    mobile VARCHAR(20), -- Mobilnummer des Kontakts
    company INT NOT NULL, -- Sekundärschlüssel für `companies`
    ref INT NOT NULL, -- Referenz zu `users.loginid`
    
    -- Fremdschlüssel für Integrität
    FOREIGN KEY (anrede) REFERENCES anrede(id) ON DELETE CASCADE,
    FOREIGN KEY (company) REFERENCES companies(companyId) ON DELETE CASCADE,
    FOREIGN KEY (ref) REFERENCES users (loginid) ON DELETE CASCADE
);
-- Таблица резюме
CREATE TABLE resumes (
    resumeId INT AUTO_INCREMENT PRIMARY KEY, -- Primärschlüssel
    ref INT NOT NULL, -- Fremdschlüssel (Benutzer-ID)
    position VARCHAR(255) NOT NULL, -- Position
    stateId INT NOT NULL, -- Fremdschlüssel (Status-ID)
    link VARCHAR(255), -- Link zur Bewerbung
    comment TEXT, -- Kommentar
    companyId INT, -- Fremdschlüssel (Firma)
    parentCompanyId INT, -- Fremdschlüssel (übergeordnete Firma)
    created DATETIME DEFAULT CURRENT_TIMESTAMP, -- Erstellungsdatum
    contactCompanyId INT, -- Fremdschlüssel zu contacts (Firma)
    contactParentCompanyId INT, -- Fremdschlüssel zu contacts (übergeordnete Firma)
    
    -- Fremdschlüssel-Constraints
    CONSTRAINT FK_UserRef FOREIGN KEY (ref) REFERENCES users(userId),
    CONSTRAINT FK_State FOREIGN KEY (stateId) REFERENCES states(stateId),
    CONSTRAINT FK_Company FOREIGN KEY (companyId) REFERENCES companies(companyId),
    CONSTRAINT FK_ParentCompany FOREIGN KEY (parentCompanyId) REFERENCES companies(companyId),
    CONSTRAINT FK_ContactCompany FOREIGN KEY (contactCompanyId) REFERENCES contacts(contactId),
    CONSTRAINT FK_ContactParentCompany FOREIGN KEY (contactParentCompanyId) REFERENCES contacts(contactId)
);

-- Таблица истории изменений
CREATE TABLE history (
    historyid INT AUTO_INCREMENT PRIMARY KEY, -- Уникальный идентификатор записи
    resumeid INT NOT NULL, -- Связь с резюме
    date DATE NOT NULL, -- Дата изменения
    stateid INT NOT NULL, -- Состояние
    FOREIGN KEY (resumeid) REFERENCES resumes(resumeid),
    FOREIGN KEY (stateid) REFERENCES states(stateid)
);

INSERT INTO anrede (id, text) VALUES
(0, ''),
(1, 'Herr'),
(2, 'Frau'),
(99, 'Diverse');

INSERT INTO states (stateid, text) VALUES
(0, 'Eingetragen'),
(10, 'Gesendet'),
(20, 'Antwort erhalten'),
(30, 'Zu Besprechung eingeladen'),
(40, 'Abgesagt'),
(50, 'Angebot erhalten');

