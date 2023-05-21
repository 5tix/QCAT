SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";
CREATE DATABASE users;
USE users;

CREATE TABLE `users` (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    password VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    access_level INT(1) NOT NULL default 0,
    reg_date TIMESTAMP
)

INSERT INTO `users`(name, password, email, access_level, reg_date) VALUES('admin', '$2b$10$OSszd6DlUslG0Y6dOA3/Qenpq3JiWc4MP3IR8oc9.A2xa47tytWFK', 'admin@gmail.com', 1, NOW());

/*create table for class attendance*/
CREATE TABLE `attendance` (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id INT(6) NOT NULL,
    student_id INT(6) NOT NULL,
    date DATE NOT NULL,
    status INT(1) NOT NULL default 0,
    reg_date TIMESTAMP
)