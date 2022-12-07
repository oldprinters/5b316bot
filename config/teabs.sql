CREATE TABLE `basename` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `class_name` varchar(45) DEFAULT NULL,
  `active` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `classes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name_id` int(10) unsigned NOT NULL,
  `duration` time NOT NULL DEFAULT cast('00:45' as time),
  `active` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `urDay` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `class_id` tinyint(3) unsigned NOT NULL,
  `dayOfWeek` tinyint(3) unsigned NOT NULL COMMENT 'День недели',
  `urTimeId` int(10) unsigned NOT NULL,
  `name_id` int(10) unsigned NOT NULL,
  `color` int(11) DEFAULT NULL,
  `dateStart` date NOT NULL,
  `dateEnd` date NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `urTime` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `class_id` int(10) unsigned NOT NULL,
  `order_num` tinyint(4) DEFAULT NULL,
  `time_s` time DEFAULT NULL,
  `time_e` time DEFAULT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_class` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `class_id` int(10) unsigned DEFAULT NULL,
  `role` enum('student','parent','teacher','c_teacher') NOT NULL DEFAULT 'student',
  `isAdmin` tinyint(4) NOT NULL DEFAULT 0,
  `active` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_user_class_1_idx` (`user_id`),
  KEY `fk_user_class_2_idx` (`class_id`),
  CONSTRAINT `fk_user_class_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_class_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tlg_id` varchar(45) NOT NULL,
  `role` enum('student','parent','teacher') NOT NULL DEFAULT 'parent',
  `isAdmin` tinyint(4) NOT NULL DEFAULT 0,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`tlg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `queryAdmin` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `whoTlgId` int(10) unsigned NOT NULL,
  `toTlgId` int(10) unsigned DEFAULT NULL,
  `result` tinyint(4) DEFAULT 0,
  `type` int(11) DEFAULT NULL,
  `textQuery` varchar(255) DEFAULT NULL,
  `active` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;