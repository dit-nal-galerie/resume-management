-- Создание базы данных
CREATE DATABASE IF NOT EXISTS bewerbungs CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bewerbungs;

CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at_timestamp BIGINT NOT NULL, -- Zeitstempel für das Ablaufdatum (Unix-Zeit)
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES authentification(id) ON DELETE CASCADE,
    UNIQUE KEY (token)
);

-- Таблица аутентификации пользователей

CREATE TABLE authentification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loginname VARCHAR(40) NOT NULL,
    password VARCHAR(255) NOT NULL
); 
-- Таблица обращений
CREATE TABLE anrede (
    id INT PRIMARY KEY, -- Уникальный идентификатор
    text VARCHAR(80) NOT NULL -- Обращение (Herr, Frau и т.д.)
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


-- Таблица состояний
CREATE TABLE states (
     stateid INT PRIMARY KEY NOT NULL, -- Уникальный идентификатор
    text VARCHAR(40) NOT NULL -- Название состояния
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
CREATE TABLE contacts (
    contactid INT AUTO_INCREMENT PRIMARY KEY, -- Eindeutige ID für den Kontakt
    vorname VARCHAR(40) , -- Vorname des Kontakts
    name VARCHAR(40) NOT NULL, -- Nachname des Kontakts
    email VARCHAR(80) , -- E-Mail-Adresse (eindeutig)
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
    companyId INT NULL, -- Fremdschlüssel (Firma), NULL erlaubt
    parentCompanyId INT NULL, -- Fremdschlüssel (übergeordnete Firma), NULL erlaubt
    created DATETIME DEFAULT CURRENT_TIMESTAMP, -- Erstellungsdatum
    contactCompanyId INT NULL, -- Fremdschlüssel zu contacts (Firma), NULL erlaubt
    contactParentCompanyId INT NULL, -- Fremdschlüssel zu contacts (übergeordnete Firma), NULL erlaubt
    
    -- Fremdschlüssel-Constraints
    CONSTRAINT FK_UserRef FOREIGN KEY (ref) REFERENCES users(userid) ON DELETE CASCADE,
    CONSTRAINT FK_State FOREIGN KEY (stateId) REFERENCES states(stateid) ON DELETE CASCADE,
    CONSTRAINT FK_Company FOREIGN KEY (companyId) REFERENCES companies(companyId) ON DELETE SET NULL,
    CONSTRAINT FK_ParentCompany FOREIGN KEY (parentCompanyId) REFERENCES companies(companyId) ON DELETE SET NULL,
    CONSTRAINT FK_ContactCompany FOREIGN KEY (contactCompanyId) REFERENCES contacts(contactid) ON DELETE SET NULL,
    CONSTRAINT FK_ContactParentCompany FOREIGN KEY (contactParentCompanyId) REFERENCES contacts(contactid) ON DELETE SET NULL
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
(1, 'backend.db.salutation.mr'),
(2, 'backend.db.salutation.mrs'),
(99, 'backend.db.salutation.diverse');

-- Status (States) mit Keys statt Text
INSERT INTO states (stateid, text) VALUES
(0, 'backend.db.state.registered'),
(10, 'backend.db.state.sent'),
(20, 'backend.db.state.response_received'),
(30, 'backend.db.state.invited_to_meeting'),
(40, 'backend.db.state.canceled'),
(50, 'backend.db.state.offer_received');

