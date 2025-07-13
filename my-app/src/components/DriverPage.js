import React, { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
// import { SidebarData } from './SidebarData';
// import './Navbar.css';
import { IconContext } from 'react-icons';
import Navbar from './Navbar/Navbar';
import GivenOrders from './GivenOrders/GivenOrders';

const DriverPage = () => {
  return (
    <>
      <Navbar />
      <GivenOrders />
    </>
  )
}

export default DriverPage