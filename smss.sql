-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2026 at 05:50 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smss`
--

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `productCode` varchar(50) NOT NULL,
  `productName` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `quantityInStock` int(11) DEFAULT 0,
  `unitPrice` decimal(10,2) NOT NULL,
  `supplierName` varchar(100) DEFAULT NULL,
  `dateReceived` date DEFAULT NULL,
  `warehouseCode` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`productCode`, `productName`, `category`, `quantityInStock`, `unitPrice`, `supplierName`, `dateReceived`, `warehouseCode`) VALUES
('123-000', 'radio', 'elect', 4000, 0.62, 'aline', '2026-05-29', 'kigali'),
('pp-02', 'shoes', 'manufacture', 5134, 200.00, 'amika fashion design', '2026-05-29', 'wh-south');

-- --------------------------------------------------------

--
-- Table structure for table `stocktransaction`
--

CREATE TABLE `stocktransaction` (
  `transactionID` int(11) NOT NULL,
  `productCode` varchar(50) NOT NULL,
  `warehouseCode` varchar(50) NOT NULL,
  `transactionDate` datetime DEFAULT current_timestamp(),
  `quantityMoved` int(11) NOT NULL,
  `transactionType` varchar(20) DEFAULT NULL CHECK (`transactionType` in ('IN','OUT','TRANSFER'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stocktransaction`
--

INSERT INTO `stocktransaction` (`transactionID`, `productCode`, `warehouseCode`, `transactionDate`, `quantityMoved`, `transactionType`) VALUES
(1, 'pp-02', 'wh-south', '2026-05-29 05:31:07', 400, 'IN'),
(2, '123-000', 'kigali', '2026-05-29 05:43:15', 1000, 'IN'),
(3, 'pp-02', 'wh-south', '2026-05-29 05:48:52', 300, 'OUT'),
(4, 'pp-02', 'wh-south', '2026-05-29 05:49:19', 5000, 'IN');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `password`, `createdAt`) VALUES
(1, 'admin', '$2b$10$aIYJ6eoISeIyCj5215ol4uQlzZL7YgozRzW1JTHCIkblTBYnoj4V6', '2026-05-29 03:25:55');

-- --------------------------------------------------------

--
-- Table structure for table `warehouse`
--

CREATE TABLE `warehouse` (
  `warehouseCode` varchar(50) NOT NULL,
  `warehouseName` varchar(100) NOT NULL,
  `warehouseLocation` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warehouse`
--

INSERT INTO `warehouse` (`warehouseCode`, `warehouseName`, `warehouseLocation`) VALUES
('kigali', 'stock for crops', 'rwanda'),
('wh-south', 'kigali stock', 'kigali,rwanda');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`productCode`),
  ADD KEY `warehouseCode` (`warehouseCode`);

--
-- Indexes for table `stocktransaction`
--
ALTER TABLE `stocktransaction`
  ADD PRIMARY KEY (`transactionID`),
  ADD KEY `productCode` (`productCode`),
  ADD KEY `warehouseCode` (`warehouseCode`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `warehouse`
--
ALTER TABLE `warehouse`
  ADD PRIMARY KEY (`warehouseCode`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `stocktransaction`
--
ALTER TABLE `stocktransaction`
  MODIFY `transactionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`warehouseCode`) REFERENCES `warehouse` (`warehouseCode`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stocktransaction`
--
ALTER TABLE `stocktransaction`
  ADD CONSTRAINT `stocktransaction_ibfk_1` FOREIGN KEY (`productCode`) REFERENCES `product` (`productCode`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stocktransaction_ibfk_2` FOREIGN KEY (`warehouseCode`) REFERENCES `warehouse` (`warehouseCode`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
