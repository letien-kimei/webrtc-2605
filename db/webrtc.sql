-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Jun 01, 2022 at 01:06 AM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webrtc`
--
CREATE DATABASE IF NOT EXISTS `webrtc` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `webrtc`;

-- --------------------------------------------------------

--
-- Table structure for table `dtb_rooms`
--

DROP TABLE IF EXISTS `dtb_rooms`;
CREATE TABLE `dtb_rooms` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` text NOT NULL,
  `room_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_rooms`
--

INSERT INTO `dtb_rooms` (`id`, `room_id`, `room_name`) VALUES
(4, 'bb2075a0-b33c-43ac-9796-23117fa6046b', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dtb_rooms_users`
--

DROP TABLE IF EXISTS `dtb_rooms_users`;
CREATE TABLE `dtb_rooms_users` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_id_request` int(11) NOT NULL,
  `user_id_receive` int(11) NOT NULL,
  `room_id` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_rooms_users`
--

INSERT INTO `dtb_rooms_users` (`id`, `user_id`, `user_id_request`, `user_id_receive`, `room_id`) VALUES
(4, 9, 9, 10, 'bb2075a0-b33c-43ac-9796-23117fa6046b'),
(5, 10, 10, 9, 'bb2075a0-b33c-43ac-9796-23117fa6046b'),
(6, 11, 11, 9, 'bb2075a0-b33c-43ac-9796-23117fa6046b');

-- --------------------------------------------------------

--
-- Table structure for table `dtb_users`
--

DROP TABLE IF EXISTS `dtb_users`;
CREATE TABLE `dtb_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `peer_id` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_users`
--

INSERT INTO `dtb_users` (`id`, `username`, `password`, `fullname`, `peer_id`) VALUES
(9, 'usm1', '123', 'Lê Minh Tiến', 'b7873f66-437b-47a1-90b4-ecea9cf9b4ef'),
(10, 'usm2', '123', 'Nguyễn Văn A', 'e18658f6-be3f-4a4b-9dc8-bee29b334b87'),
(11, 'usm3', '123', 'Nguyễn Văn B', 'a95da330-60b5-4a05-80bc-73212c2396bc');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dtb_rooms`
--
ALTER TABLE `dtb_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dtb_rooms_users`
--
ALTER TABLE `dtb_rooms_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dtb_users`
--
ALTER TABLE `dtb_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dtb_rooms`
--
ALTER TABLE `dtb_rooms`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `dtb_rooms_users`
--
ALTER TABLE `dtb_rooms_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dtb_users`
--
ALTER TABLE `dtb_users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
