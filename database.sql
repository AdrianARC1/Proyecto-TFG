CREATE DATABASE codigosQR_DB;

USE codigosQR_DB;

CREATE TABLE codigosQR (
  id INT PRIMARY KEY AUTO_INCREMENT,
  data VARCHAR(255),
  opcionBody VARCHAR(255),
  opcionEye VARCHAR(255),
  opcionEyeBall VARCHAR(255),
  bgColor VARCHAR(7),
  bodyColor VARCHAR(7),
  logoUrl VARCHAR(255)
  size INT;

);
