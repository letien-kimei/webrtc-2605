-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: May 22, 2022 at 04:30 PM
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
-- Table structure for table `dtb_users`
--

DROP TABLE IF EXISTS `dtb_users`;
CREATE TABLE `dtb_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_users`
--

INSERT INTO `dtb_users` (`id`, `username`, `password`, `fullname`) VALUES
(1, 'usm1', '123', 'Nguyễn Văn A'),
(2, 'usm2', '123', 'Nguyễn Văn B'),
(3, 'usm3', '123', 'Nguyễn Văn C'),
(4, 'usm4', '123', 'Nguyễn Văn D'),
(8, 'usm5', '123', 'Nguyễn Văn F');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dtb_users`
--
ALTER TABLE `dtb_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dtb_users`
--
ALTER TABLE `dtb_users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
