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
CREATE TABLE contacts (
    contactId INT AUTO_INCREMENT PRIMARY KEY, -- Уникальный идентификатор контакта
    name VARCHAR(80) NOT NULL, -- Имя
    anrede INT NOT NULL, -- Обращение
    email VARCHAR(80) NOT NULL, -- Email контакта
    phone VARCHAR(20), -- Телефон
    mobile VARCHAR(20), -- Мобильный телефон
    ref INT NOT NULL, -- Связь с пользователем
    FOREIGN KEY (anrede) REFERENCES anrede(id),
    FOREIGN KEY (ref) REFERENCES authentification(id)
);

-- Таблица состояний
CREATE TABLE states (
     stateid INT PRIMARY KEY NOT NULL, -- Уникальный идентификатор
    text VARCHAR(40) NOT NULL -- Название состояния
);

-- Таблица резюме
CREATE TABLE resumes (
    resumeid INT AUTO_INCREMENT PRIMARY KEY, -- Уникальный идентификатор резюме
    companyid INT NOT NULL, -- Связь с компанией
    parentcompanyid INT NOT NULL, -- Связь с материнской компанией
    stateid INT NOT NULL, -- Связь со статусом
    ref INT NOT NULL, -- Дополнительная связь с пользователем
    created DATE NOT NULL, -- Дата создания
    position VARCHAR(80) NOT NULL, -- Должность
    link VARCHAR(80), -- Ссылка на ресурс
    comment VARCHAR(500), -- Комментарий
   
    FOREIGN KEY (companyid) REFERENCES companies(companyId),
    FOREIGN KEY (parentcompanyid) REFERENCES companies(companyId),
    FOREIGN KEY (stateid) REFERENCES states(stateid),
    FOREIGN KEY (ref) REFERENCES authentification(id)
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