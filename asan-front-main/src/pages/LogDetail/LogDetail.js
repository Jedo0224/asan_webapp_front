import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from "react-cookie";
import './Detail.css';
import HeadBar from '../HeadBar/HeadBar';
import { ip } from '../../server_ip.js';

const regularDate = (t, mode) => {
    let date = new Date(t);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hours = hours >= 10 ? hours : '0' + hours;
    minutes = minutes >= 10 ? minutes : '0' + minutes;
    seconds = seconds >= 10 ? seconds : '0' + seconds;

    if (mode === 0)
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    else if (mode === 1)
        return year + "년 " + month + "월 " + day + "일 " + hours + "시 " + minutes + "분 " + seconds + "초";
};



const calculateReconnectTime = (connectionLogs, disconnectionLogs) => {
    let reconnectTimes = [];
    let length = Math.min(connectionLogs.length, disconnectionLogs.length);
    for (let i = 0; i < length; i++) {
        let connectTime = new Date(connectionLogs[i]);
        let disconnectTime = new Date(disconnectionLogs[i]);
        let timeDifference = disconnectTime - connectTime; // 밀리초 단위 시간 차이
        let durationInSeconds = Math.abs(timeDifference / 1000); // 초 단위로 변환
        console.log("dur",connectTime)

        let hours = Math.floor(durationInSeconds / 3600);
        let minutes = Math.floor((durationInSeconds % 3600) / 60);
        let seconds = Math.floor(durationInSeconds % 60);

        reconnectTimes.push({
            connectTime: regularDate(connectTime, 1),
            disconnectTime: regularDate(disconnectTime, 1),
            duration: `${hours}시간 ${minutes}분 ${seconds}초`
        });
    }
    return reconnectTimes;
};

const calculateReconnectionTime = (connectionLogs, disconnectionLogs) => {
    let reconnectionTimes = [{ duration: '0시간 0분 0초' }]; // 첫 번째 값을 0시간 0분 0초로 설정
    let length = Math.min(connectionLogs.length, disconnectionLogs.length);
    for (let i = 1; i < length; i++) { // 첫 번째 연결은 재연결로 계산하지 않음
        let previousDisconnectTime = new Date(disconnectionLogs[i - 1]);
        let currentConnectTime = new Date(connectionLogs[i]);
        let timeDifference = currentConnectTime - previousDisconnectTime; // 밀리초 단위 시간 차이
        let durationInSeconds = Math.abs(timeDifference / 1000); // 초 단위로 변환

        let hours = Math.floor(durationInSeconds / 3600);
        let minutes = Math.floor((durationInSeconds % 3600) / 60);
        let seconds = Math.floor(durationInSeconds % 60);

        reconnectionTimes.push({
            previousDisconnectTime: regularDate(previousDisconnectTime, 1),
            currentConnectTime: regularDate(currentConnectTime, 1),
            duration: `${hours}시간 ${minutes}분 ${seconds}초`
        });
    }
    
    return reconnectionTimes;
};



function LogDetail() {
    const [cookies, setCookie, removeCookie] = useCookies(['is_login']);
    const { id, disconnectCount } = useParams(); // disconnectCount 값을 URL 파라미터에서 가져옴
    const [logData, setLogData] = useState({
        connectionLogList: [],
        disconnectionLogList: []
    });
    const [reconnectTimes, setReconnectTimes] = useState([]);
    const [reconnectionTimes, setReconnectionTimes] = useState([]);
    const [totalDisconnections, setTotalDisconnections] = useState(parseInt(disconnectCount)); // disconnectCount를 초기값으로 설정
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${ip}/patient/getConnectionLogList/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${cookies.is_login}`,
                }
            }
        ).then((response) => {
            if (!response.data.result.connectionLogList) {
                alert('로그 정보를 불러오는데 실패하였습니다.');
                navigate(-1); // Go back to the previous screen
            } else {
                setLogData(response.data.result);
                setReconnectTimes(calculateReconnectTime(response.data.result.connectionLogList, response.data.result.disconnectionLogList));
                const reconnectionTimesResult = calculateReconnectionTime(response.data.result.connectionLogList, response.data.result.disconnectionLogList);
                setReconnectionTimes(reconnectionTimesResult);
            }
        }).catch((error) => {
            alert('로그 정보를 불러오는데 실패하였습니다.');
            navigate(-1); // Go back to the previous screen
        });
    }, [id, cookies, navigate]);

    return (
        <div>
            <HeadBar />
            <div className='detail'>
                <div className='logSection'>
                    <h2>연결 로그</h2>
                    <ul>
                        {logData.connectionLogList.map((log, index) => (
                            <li key={index}>{regularDate((log), 1)}</li>
                        ))}
                    </ul>
                </div>
                <div className='logSection'>
                    <h2>연결 끊김 로그</h2>
                    <ul>
                        {logData.disconnectionLogList.map((log, index) => (
                            <li key={index}>{regularDate((log), 1)}</li>
                        ))}
                    </ul>
                </div>
                <div className='logSection'>
                    <h2>연결 시간</h2>
                    <ul>
                        {reconnectTimes.map((log, index) => (
                            <li key={index} className="greenText">
                                {log.duration}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className='logSection'>
                    <h2>재연결까지 걸린 시간</h2>
                    <ul>
                        {reconnectionTimes.map((log, index) => (
                            <li key={index} className="redText">
                                {log.duration}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className='logSection'>
                    <h2>총 끊김 수</h2>
                    <h3>{totalDisconnections}번</h3>
                </div>
            </div>
        </div>
    );
}

export default LogDetail;
