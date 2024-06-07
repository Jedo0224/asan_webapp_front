import React, { useState, useEffect, useRef } from 'react';
import './HeadBar.css';
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { ip } from '../../server_ip.js';

function HeadBar() {
  const [cookies, setCookie, removeCookie] = useCookies(['is_login']);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  axios.get(ip + '/auth/info',
            {
                headers: {
                    Authorization: `Bearer ${cookies.is_login}`,
                }
            }
        ).then((response) => {
            setUserName(response.data.result.name);
        }
        ).catch((error) => {
            removeCookie('is_login');
            alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
            navigate('/');
        })

  return (
      <header className='head'>
        <div className='headDiv'>
          <div>{`${userName}님`}</div>
          <button onClick={e => {
            removeCookie('is_login');
            alert('로그아웃되었습니다.');
            navigate('/');
          }}>로그아웃</button>
        </div>
      </header>
  );
}

export default HeadBar;