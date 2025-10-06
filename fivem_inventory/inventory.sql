-- Inventory System Database Schema
-- Run this SQL script in your MySQL database

CREATE TABLE IF NOT EXISTS `player_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(60) NOT NULL,
  `items` longtext DEFAULT '[]',
  `max_slots` int(11) DEFAULT 30,
  `max_weight` float DEFAULT 100.0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
