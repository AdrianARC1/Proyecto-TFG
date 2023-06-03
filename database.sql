CREATE DATABASE codigosQR_DB;

USE codigosQR_DB;

CREATE TABLE `codigosqr` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);
CREATE TABLE `codigosqr_url` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);
CREATE TABLE `codigosqr_redes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `perfilRed` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);
);
CREATE TABLE `codigosqr_tel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `telefono` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);
CREATE TABLE `codigosqr_pdf` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pdfUrl` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);


CREATE TABLE `codigosqr_vcard` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);

CREATE TABLE `codigosqr_sms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numeroTel` varchar(255) DEFAULT NULL,
  `mensaje` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);

CREATE TABLE `codigosqr_geo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `latitud` varchar(255) DEFAULT NULL,
  `longitud` varchar(255) DEFAULT NULL,
  `opcionBody` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);

CREATE TABLE `codigosqr_wifi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ssid` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `encryption` varchar(255) DEFAULT NULL,
  `opcionEye` varchar(255) DEFAULT NULL,
  `opcionEyeBall` varchar(255) DEFAULT NULL,
  `bgColor` varchar(7) DEFAULT NULL,
  `bodyColor` varchar(7) DEFAULT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `codigoqrURL` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `tipo_qr` varchar(255) DEFAULT 'pdf',
  PRIMARY KEY (`id`)
);