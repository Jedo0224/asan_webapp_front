import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Login.css';
import { useCookies } from "react-cookie";
import { ip } from '../../server_ip.js';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        managerId:'',
        password:''})
    const navigate = useNavigate();

    const goSignIn = () => {
      navigate('/sign');
    }

    const [cookies, setCookie, removeCookie] = useCookies(['is_login']);

    const goLogIn = () => {
        if(!loginInfo.managerId){
            alert('아이디를 입력하세요.');
        }
        else if(!loginInfo.password){
            alert('비밀번호를 입력하세요.');
        } else{
            axios.post(ip + '/auth/login',
                loginInfo
            )
            .then(function(response){
                if(response.data.message==='성공입니다.'){
                    setCookie("is_login", `${response.data.result.accessToken}`,{ path: '/' }); 
                    alert('로그인되었습니다.');
                    navigate('/state');
                }else{
                    alert('로그인 중 오류가 발생했습니다.');
                }
            })
            .catch(function(error){
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
                setLoginInfo({...loginInfo,'password':''});
            })
        }
    }

    const handleOnKeyDown = (e) => {
        if(e.key === 'Enter'){
            goLogIn();
        }
    }

    document.title = "로그인";
    return(
        <div className="big">
        <div className="cent">
                <div className="page">
                    보조기 어드민 페이지
                </div>
                <div className="login">
                    <div className="log-text">
                        Login
                    </div>
                    <input
                    name='log-id'
                    className="log-id"
                    type='text'
                    placeholder="아이디"
                    value={loginInfo.managerId}
                    onChange={(e) => setLoginInfo({...loginInfo, 'managerId':e.target.value})}
                    onKeyDown={(e) => handleOnKeyDown(e)}/>
                    <input
                    name='log-pw'
                    className="log-pw"
                    type='password'
                    placeholder="비밀번호"
                    value={loginInfo.password}
                    onChange={(e) => setLoginInfo({...loginInfo, 'password':e.target.value})}
                    onKeyDown={(e) => handleOnKeyDown(e)}/>
                    <div className="push">
                        <button className="sign-button" onClick={goSignIn}>회원가입</button>
                        <button className="log-button" onClick={goLogIn}>로그인</button>
                    </div>
                </div>
        </div>
        </div>
    );
}

export default Login;