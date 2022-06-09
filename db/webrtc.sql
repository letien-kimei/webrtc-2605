-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 09, 2022 lúc 04:49 PM
-- Phiên bản máy phục vụ: 10.1.38-MariaDB
-- Phiên bản PHP: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `webrtc`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dtb_alert`
--

CREATE TABLE `dtb_alert` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` text NOT NULL,
  `request_user_id` int(11) NOT NULL,
  `message` text,
  `accept` tinyint(1) NOT NULL DEFAULT '0',
  `cancel` tinyint(1) NOT NULL DEFAULT '0',
  `type` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `dtb_alert`
--

INSERT INTO `dtb_alert` (`id`, `room_id`, `request_user_id`, `message`, `accept`, `cancel`, `type`, `active`) VALUES
(13, 'be704ba7-4432-4803-a837-71ebfeb76ff8', 9, 'Nguyễn Văn A muốn tham gia nhóm Phòng 2', 1, 0, 'REQUEST_JOIN_ROOM', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dtb_rooms`
--

CREATE TABLE `dtb_rooms` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` text NOT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `dtb_rooms`
--

INSERT INTO `dtb_rooms` (`id`, `room_id`, `room_name`, `user_id`) VALUES
(4, 'bb2075a0-b33c-43ac-9796-23117fa6046b', NULL, 0),
(23, '273886c4-978b-478b-a08d-bc32fb474418', 'Phòng 1', 9),
(24, 'be704ba7-4432-4803-a837-71ebfeb76ff8', 'Phòng 2', 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dtb_rooms_users`
--

CREATE TABLE `dtb_rooms_users` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_id_request` int(11) NOT NULL,
  `user_id_receive` int(11) NOT NULL,
  `room_id` text NOT NULL,
  `pending` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `dtb_rooms_users`
--

INSERT INTO `dtb_rooms_users` (`id`, `user_id`, `user_id_request`, `user_id_receive`, `room_id`, `pending`) VALUES
(4, 9, 9, 10, 'bb2075a0-b33c-43ac-9796-23117fa6046b', 0),
(5, 10, 10, 9, 'bb2075a0-b33c-43ac-9796-23117fa6046b', 0),
(14, 9, 0, 0, 'be704ba7-4432-4803-a837-71ebfeb76ff8', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dtb_users`
--

CREATE TABLE `dtb_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `peer_id` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `dtb_users`
--

INSERT INTO `dtb_users` (`id`, `username`, `password`, `fullname`, `peer_id`) VALUES
(9, 'usm1', '123', 'Nguyễn Văn A', 'b7873f66-437b-47a1-90b4-ecea9cf9b4ef'),
(10, 'usm2', '123', 'Nguyễn Văn B', 'e18658f6-be3f-4a4b-9dc8-bee29b334b87'),
(11, 'usm3', '123', 'Nguyễn Văn C', 'a95da330-60b5-4a05-80bc-73212c2396bc'),
(12, 'usm4', '123', 'Nguyễn Văn D', 'e186334FV-be3f-4a4b-9dc8-bee29b248DFSFF');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `dtb_alert`
--
ALTER TABLE `dtb_alert`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `dtb_rooms`
--
ALTER TABLE `dtb_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `dtb_rooms_users`
--
ALTER TABLE `dtb_rooms_users`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `dtb_users`
--
ALTER TABLE `dtb_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `dtb_alert`
--
ALTER TABLE `dtb_alert`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `dtb_rooms`
--
ALTER TABLE `dtb_rooms`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `dtb_rooms_users`
--
ALTER TABLE `dtb_rooms_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `dtb_users`
--
ALTER TABLE `dtb_users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
