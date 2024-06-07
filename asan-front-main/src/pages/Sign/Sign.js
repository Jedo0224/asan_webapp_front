import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Sign.css'
import { ip } from '../../server_ip.js';

function Sign() {

    const [info, setInfo] = useState({
        "managerId": '',
        "password": '',
        "username": '',
        "phoneNumber": '',
        "organization": '',
    });

    console.log(info)

    const [checkP, setCheckP] = useState('');

    const selectList = [
        { value: "서울아산병원", name: "서울아산병원" },
        { value: "세브란스병원", name: "세브란스병원" },
        { value: "분당서울대병원", name: "분당서울대병원" }
    ]

    const handleInfoChange = (type, value) => {
        setInfo(() => { return { ...info, [type]: value } });
    }

    const navigate = useNavigate();

    //백엔드
    const submitInfo = (e) => {
        e.preventDefault();
        for (const key in info) {
            if (!info[key]) {
                return alert('입력하지 않은 정보가 있습니다.');
            }
        }
        
        axios.post(ip + '/auth/signUp',
            info)
            .then((response) => {
                alert('회원가입완료');
                return navigate('/');

            })
            .catch((error) => {
                alert('회원가입 중 오류가 발생했습니다.');
            })
    }

    document.title = "회원가입";
    
    return (
        <div className="back">
            <div className="sign">
                <div className='signMargin'>
                    <div className="elem">
                        기관명
                        <select
                            name='selectOrg'
                            onChange={(e) => {
                                e.preventDefault();
                                handleInfoChange('organization', e.target.value);
                            }}>
                            <option value={""}>선택하세요</option>
                            {selectList.map((item) => {
                                return <option value={item.value} key={item.value} name={item.value}>
                                    {item.name}
                                </option>
                            })}
                        </select>
                    </div>
                    <div className="elem">
                        담당자 성함
                        <input
                            type="text"
                            autoComplete='off'
                            value={info.username}
                            name='username'
                            onChange={(e) => handleInfoChange('username', e.target.value)} />
                    </div>
                    <div className="elem">
                        담당자 전화번호
                        <input
                            type="number"
                            value={info.phoneNumber}
                            name='phoneNumber'
                            onChange={(e) => handleInfoChange('phoneNumber', e.target.value)} />
                    </div>
                    <div className="elem">
                        아이디
                        <input
                            type="text"
                            value={info.managerId}
                            name='managerId'
                            onChange={(e) => handleInfoChange('managerId', e.target.value)} />
                        <div className='discord' style={{ color: info.managerId.length > 3 ? "green" : "red" }}>{info.managerId.length > 3 ? "" : "4글자 이상 입력해주세요"}</div>
                    </div>
                    <div className="elem">
                        비밀번호
                        <input
                            type="password"
                            value={info.password}
                            name='password'
                            onChange={(e) => handleInfoChange('password', e.target.value)} />
                        <div className='discord' style={{ color: info.password.length > 3 ? "green" : "red" }}>{info.password.length > 3 ? "" : "4글자 이상 입력해주세요"}</div>
                    </div>
                    <div className="elem">
                        비밀번호 재입력
                        <input
                            type="password"
                            value={checkP}
                            name='check'
                            onChange={(e) => setCheckP(e.target.value)} />
                        <div className='discord' style={{ color: info.password === checkP && info.password.length > 0 ? "green" : "red" }}>{info.password === checkP && info.password.length > 0 ? "일치" : "불일치"}</div>
                    </div>
                    <div className='signButtonDiv'>
                        <button className="signButton" onClick={(e) => {navigate(-1); }}>뒤로가기</button>
                        <button className="signButton" onClick={(e) => { submitInfo(e); }}>회원가입</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sign;