import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment , faUser , faRoute, faArrowRightFromBracket, faUsers, faPlus} from '@fortawesome/free-solid-svg-icons';


export const SidebarData = [
  {
    title: 'Home',
    path: '/client',
    icon: <AiIcons.AiFillHome />,
    cName: 'nav-text'
  },
  {
    title: 'Feedback',
    path: '/feedback',
    icon: <FontAwesomeIcon icon={faComment} />,
    cName: 'nav-text'
  },
  {
    title: 'Order',
    path: '/order',
    icon: <FontAwesomeIcon icon={faRoute} />,
    cName: 'nav-text'
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <FontAwesomeIcon icon={faUser} />,
    cName: 'nav-text'
  },
  {
    title: 'Log Out',
    path: '/',
    icon: <FontAwesomeIcon icon={faArrowRightFromBracket} />,
    cName: 'nav-text'
  },
  {
    title: 'Users',
    path: '/users',
    icon: <FontAwesomeIcon icon={faUsers} />,
    cName: 'nav-text'
  },
  {
    title: 'Add Order',
    path: '/addOrder',
    icon: <FontAwesomeIcon icon={faPlus} />,
    cName: 'nav-text'
  }
];