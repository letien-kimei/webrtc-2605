-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Jun 14, 2022 at 05:30 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `dtb_alert`
--

CREATE TABLE `dtb_alert` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` text NOT NULL,
  `request_user_id` int(11) NOT NULL,
  `message` text,
  `accept` tinyint(1) NOT NULL DEFAULT '0',
  `cancel` tinyint(1) NOT NULL DEFAULT '0',
  `type` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `waiting` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_alert`
--

INSERT INTO `dtb_alert` (`id`, `room_id`, `request_user_id`, `message`, `accept`, `cancel`, `type`, `active`, `waiting`) VALUES
(36, 'd63d74b2-bf2c-464e-bae4-3561c683cbcf', 20, 'Nguyễn Văn A muốn tham gia nhóm Room B-2', 1, 0, 'REQUEST_JOIN_ROOM', 0, 0),
(37, '663a5517-46da-42f8-9081-65efb1fb2b49', 20, 'Nguyễn Văn A muốn tham gia nhóm Room B-3', 1, 0, 'REQUEST_JOIN_ROOM', 0, 0),
(38, '663a5517-46da-42f8-9081-65efb1fb2b49', 23, 'Nguyễn Văn C muốn tham gia nhóm Room B-3', 1, 0, 'REQUEST_JOIN_ROOM', 0, 0),
(39, 'b536419a-340f-432e-ad20-9a3936203634', 21, 'Nguyễn Văn B muốn tham gia nhóm Room C-1', 1, 0, 'REQUEST_JOIN_ROOM', 0, 0),
(40, 'b536419a-340f-432e-ad20-9a3936203634', 20, 'Nguyễn Văn A muốn tham gia nhóm Room C-1', 1, 0, 'REQUEST_JOIN_ROOM', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `dtb_rooms`
--

CREATE TABLE `dtb_rooms` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` text NOT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `active` varchar(10) NOT NULL DEFAULT 'OFF'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_rooms`
--

INSERT INTO `dtb_rooms` (`id`, `room_id`, `room_name`, `user_id`, `type`, `active`) VALUES
(40, '14011d49-3d2a-4a3a-93be-5a5e7ec26efa', '', 20, 'PRIVATE_ROOM', 'OFF'),
(41, 'b25b69b2-f526-43e6-8c12-6bb0c9760ae8', '', 21, 'PRIVATE_ROOM', 'OFF'),
(47, 'b748b857-efd1-4afb-aaeb-12aec700afd0', 'Room A-1', 20, 'CLIENT_ROOM', 'OFF'),
(48, 'd63d74b2-bf2c-464e-bae4-3561c683cbcf', 'Room B-2', 21, 'CLIENT_ROOM', 'OFF'),
(49, '663a5517-46da-42f8-9081-65efb1fb2b49', 'Room B-3', 21, 'CLIENT_ROOM', 'OFF'),
(51, '62c4eec7-ecfd-43e6-a2ac-fbb2ecce1e0f', '', 23, 'PRIVATE_ROOM', 'OFF'),
(52, 'b536419a-340f-432e-ad20-9a3936203634', 'Room C-1', 23, 'CLIENT_ROOM', 'OFF');

-- --------------------------------------------------------

--
-- Table structure for table `dtb_rooms_setting`
--

CREATE TABLE `dtb_rooms_setting` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` text NOT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_rooms_setting`
--

INSERT INTO `dtb_rooms_setting` (`id`, `room_id`, `status`) VALUES
(5, '14011d49-3d2a-4a3a-93be-5a5e7ec26efa', 'PRIVATE'),
(6, 'b25b69b2-f526-43e6-8c12-6bb0c9760ae8', 'PRIVATE'),
(9, 'b748b857-efd1-4afb-aaeb-12aec700afd0', 'PUBLIC'),
(10, 'd63d74b2-bf2c-464e-bae4-3561c683cbcf', 'PUBLIC'),
(11, '663a5517-46da-42f8-9081-65efb1fb2b49', 'PUBLIC'),
(13, '62c4eec7-ecfd-43e6-a2ac-fbb2ecce1e0f', 'PRIVATE'),
(14, 'b536419a-340f-432e-ad20-9a3936203634', 'PUBLIC');

-- --------------------------------------------------------

--
-- Table structure for table `dtb_rooms_users`
--

CREATE TABLE `dtb_rooms_users` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` text NOT NULL,
  `pending` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_rooms_users`
--

INSERT INTO `dtb_rooms_users` (`id`, `user_id`, `room_id`, `pending`) VALUES
(38, 20, '14011d49-3d2a-4a3a-93be-5a5e7ec26efa', 0),
(39, 21, 'b25b69b2-f526-43e6-8c12-6bb0c9760ae8', 0),
(42, 20, 'b748b857-efd1-4afb-aaeb-12aec700afd0', 0),
(43, 21, 'b748b857-efd1-4afb-aaeb-12aec700afd0', 0),
(44, 21, 'd63d74b2-bf2c-464e-bae4-3561c683cbcf', 0),
(45, 20, 'd63d74b2-bf2c-464e-bae4-3561c683cbcf', 0),
(46, 21, '663a5517-46da-42f8-9081-65efb1fb2b49', 0),
(47, 20, '663a5517-46da-42f8-9081-65efb1fb2b49', 0),
(49, 23, '62c4eec7-ecfd-43e6-a2ac-fbb2ecce1e0f', 0),
(50, 23, '663a5517-46da-42f8-9081-65efb1fb2b49', 0),
(51, 23, 'b536419a-340f-432e-ad20-9a3936203634', 0),
(52, 21, 'b536419a-340f-432e-ad20-9a3936203634', 0),
(53, 20, 'b536419a-340f-432e-ad20-9a3936203634', 0);

-- --------------------------------------------------------

--
-- Table structure for table `dtb_users`
--

CREATE TABLE `dtb_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `peer_id` text NOT NULL,
  `private_room` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dtb_users`
--

INSERT INTO `dtb_users` (`id`, `username`, `password`, `fullname`, `peer_id`, `private_room`) VALUES
(20, 'usm1', '123', 'Nguyễn Văn A', 'a771d5a9-eacc-4800-99f7-24720bc11ecd', '14011d49-3d2a-4a3a-93be-5a5e7ec26efa'),
(21, 'usm2', '123', 'Nguyễn Văn B', '445a0866-1504-46b8-85d7-5981c6c1c459', 'b25b69b2-f526-43e6-8c12-6bb0c9760ae8'),
(23, 'usm3', '123', 'Nguyễn Văn C', '896cc5e8-1d1d-4c47-9d07-2089de8503a2', '62c4eec7-ecfd-43e6-a2ac-fbb2ecce1e0f');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dtb_alert`
--
ALTER TABLE `dtb_alert`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dtb_rooms`
--
ALTER TABLE `dtb_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dtb_rooms_setting`
--
ALTER TABLE `dtb_rooms_setting`
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
-- AUTO_INCREMENT for table `dtb_alert`
--
ALTER TABLE `dtb_alert`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `dtb_rooms`
--
ALTER TABLE `dtb_rooms`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `dtb_rooms_setting`
--
ALTER TABLE `dtb_rooms_setting`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `dtb_rooms_users`
--
ALTER TABLE `dtb_rooms_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `dtb_users`
--
ALTER TABLE `dtb_users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
