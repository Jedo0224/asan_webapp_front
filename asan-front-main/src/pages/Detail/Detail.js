import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MyBarChart, { MyLineChart } from '../Chart/Chart';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useCookies } from "react-cookie";
import './Detail.css'
import HeadBar from '../HeadBar/HeadBar';
import { wait } from '@testing-library/user-event/dist/utils';
import { ip } from '../../server_ip.js';

const regularDate = (t, mode) => {
    let date = new Date(t);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    if (mode === 0)
        return year + '-' + month + '-' + day;
    else if (mode === 1)
        return year + "년 " + month + "월 " + day + "일";
};


function Detail() {
    const [cookies, setCookie, removeCookie] = useCookies(['is_login']);
    const { id } = useParams();
    const [detailData, setDetailData] = useState({
        address: null,
        auxiliaryDeviceType: null,
        dateOfBirth: null,
        email: null,
        endDate: null,
        formFactorNumber: null,
        gender: null,
        guardianName: null,
        guardianPhoneNumber: null,
        guardianRelationship: null,
        initialEvaluation: null,
        medicalRecordNumber: null,
        organization: null,
        password: null,
        phoneNumber: null,
        registrationDate: null,
        responsiblePersonName: null,
        responsiblePersonNumber: null,
        startDate: null,
        username: null,
    });

    useEffect(() => {
        axios.get(ip + `/patient/info/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${cookies.is_login}`,
                }
            }
        ).then((response) => {
            setDetailData(response.data.result);
        }
        ).catch((error) => {
            alert('개인 정보를 불러오는데 실패하였습니다.');
        })
    }, []);

    function NotPrint(e) {
        const detailData = e.detailData;

        return (
            <div className='notPrint'>
                <ul className='detailInfo'>
                    <li>인적사항
                        <ul>
                            <dl>
                                <li>
                                    <dt>보조기 종류</dt>
                                    <dd>{detailData.auxiliaryDeviceType ? detailData.auxiliaryDeviceType : ''}</dd>
                                </li>
                                <li>
                                    <dt>병록번호</dt>
                                    <dd>{detailData.medicalRecordNumber ? detailData.medicalRecordNumber : ''}</dd>
                                </li>
                                <li>
                                    <dt>성함</dt>
                                    <dd>{detailData.username ? detailData.username : ''}</dd>
                                </li>
                                <li>
                                    <dt>성별</dt>
                                    <dd>{detailData.gender === 'MALE' ? '남' : '여'}</dd>
                                </li>
                                <li>
                                    <dt>생년월일</dt>
                                    <dd>{detailData.dateOfBirth ? detailData.dateOfBirth : ''}</dd>
                                </li>
                                <li>
                                    <dt>비밀번호</dt>
                                    <dd>{detailData.password ? detailData.password : ''}</dd>
                                </li>
                                <li>
                                    <dt>이메일</dt>
                                    <dd>{detailData.email ? detailData.email : ''}</dd>
                                </li>
                                <li>
                                    <dt>연락처</dt>
                                    <dd>{detailData.phoneNumber ? detailData.phoneNumber : ''}</dd>
                                </li>
                                <li>
                                    <dt>주소</dt>
                                    <dd>{detailData.address ? detailData.address : ''}</dd>
                                </li>
                                <li>
                                    <dt>폼팩터 넘버</dt>
                                    <dd>{detailData.formFactorNumber ? detailData.formFactorNumber : ''}</dd>
                                </li>
                            </dl>
                        </ul>
                    </li>
                    <li>보호자 인적사항
                        <ul>
                            <dl>
                                <li>
                                    <dt>보호자 성함</dt>
                                    <dd>{detailData.guardianName ? detailData.guardianName : ''}</dd>
                                </li>
                                <li>
                                    <dt>관계</dt>
                                    <dd>{detailData.guardianRelationship ? detailData.guardianRelationship : ''}</dd>
                                </li>
                                <li>
                                    <dt>보호자 연락처</dt>
                                    <dd>{detailData.guardianPhoneNumber ? detailData.guardianPhoneNumber : ''}</dd>
                                </li>
                            </dl>
                        </ul>
                    </li>
                    <li>초기평가
                        <ul>
                            {detailData.initialEvaluation ? detailData.initialEvaluation : ''}
                        </ul>
                    </li>
                    <li>담당 세부사항
                        <ul>
                            <dl>
                                <li>
                                    <dt>기관명</dt>
                                    <dd>{detailData.organization ? detailData.organization : ''}</dd>
                                </li>
                                <li>
                                    <dt>담당자 이름</dt>
                                    <dd>{detailData.responsiblePersonName ? detailData.responsiblePersonName : ''}</dd>
                                </li>
                                <li>
                                    <dt>담당자 번호</dt>
                                    <dd>{detailData.responsiblePersonNumber ? detailData.responsiblePersonNumber : ''}</dd>
                                </li>
                                <li>
                                    <dt>등록 날짜</dt>
                                    <dd>{detailData.registrationDate ? regularDate(detailData.registrationDate, 0) : ''}</dd>
                                </li>
                            </dl>
                        </ul>
                    </li>
                </ul>
            </div>
        );
    }

    function PrintSection(event) {
        const [cookies, setCookie, removeCookie] = useCookies(['is_login']);
        const [reportData, setReportData] = useState([]);
        const detailData = event.detailData;
        const today = regularDate(new Date(), 0);
        useEffect(() => {
            if (detailData.medicalRecordNumber) {
                axios.get(ip + `/summary/${detailData.medicalRecordNumber}`,
                    {
                        headers: {
                            Authorization: `Bearer ${cookies.is_login}`,
                        },
                        params: {
                            'startDate': regularDate(new Date(0), 0),
                            'endDate': today,
                        }
                    }
                ).then((response) => {
                    setReportData(response.data.result.summaryDatas);
                }).catch((error) => {
                    alert('레포트 데이터를 불러오는데 실패하였습니다.');
                })
            }
        },[]);
        const navigate = useNavigate();

        const activeButton = (e) => {
            axios.get(ip + '/sensorFile/download',
                {
                    headers: {
                        Authorization: `Bearer ${cookies.is_login}`,
                        responseType: 'blob'
                    },
                    params: {
                        medicalRecordNumber: detailData.medicalRecordNumber
                    }
                }
            ).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                // 링크 요소를 생성하여 프로그래매틱하게 다운로드를 실행합니다.
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${detailData.medicalRecordNumber}_activity_log.csv`); // 다운로드할 파일명을 설정합니다.
                document.body.appendChild(link);
                link.click();

                // 뒷정리: 생성한 링크 요소를 제거합니다.
                link.parentNode.removeChild(link);
            }
            ).catch((error) => {
                alert('활동 로그 다운로드 중 오류가 발생했습니다.');
            })
        }

        const analyzeButton = (e) => {
            axios.get(ip + '/patientReport/download',
                {
                    headers: {
                        Authorization: `Bearer ${cookies.is_login}`,
                        responseType: 'blob'
                    },
                    params: {
                        medicalRecordNumber: detailData.medicalRecordNumber
                    }
                }
            ).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                // 링크 요소를 생성하여 프로그래매틱하게 다운로드를 실행합니다.
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${detailData.medicalRecordNumber}_analyze_file.csv`); // 다운로드할 파일명을 설정합니다.
                document.body.appendChild(link);
                link.click();

                // 뒷정리: 생성한 링크 요소를 제거합니다.
                link.parentNode.removeChild(link);
            }
            ).catch((error) => {
                alert('분석 파일 다운로드 중 오류가 발생했습니다.');
            })
        }
        const BackButton = (e) => {
            navigate(-1);
        };

        const PrintButton = (e) => {
            document.title = `${regularDate(new Date(),0)}_보조기어드민`;
            window.print();
            document.title = `${detailData.username}님의 정보`;
        };

        const RepeatPart = (date, mode, term, num, id) => {
            let start = new Date(date);
            let end = new Date(date);
            end.setDate(end.getDate() + term - 1);
            let returnData = 0;
            let wearTime = 0;
            let NoWearTime = 0;
            let meanVas = 0;
            if (!mode) {
                returnData = reportData.slice((num - 1) * 28, (num - 1) * 28 + term);
                for (let i = 0; i < term; i++) {
                    wearTime += returnData[(num - 1) * 28 + i].actualWearTime;
                    NoWearTime += returnData[(num - 1) * 28 + i].actualNonWearTime;
                    meanVas += returnData[(num - 1) * 28 + i].vas;
                }
            } else {
                returnData = reportData.slice((num - 1) * 7, (num - 1) * 7 + term);
                for (let i = 0; i < term; i++) {
                    wearTime += returnData[(num - 1) * 7 + i].actualWearTime;
                    NoWearTime += returnData[(num - 1) * 7 + i].actualNonWearTime;
                    meanVas += returnData[(num - 1) * 7 + i].vas;
                }
            };
            wearTime = (wearTime * 100 / (wearTime + NoWearTime)).toFixed(1);
            return (
                <div className='detailCombine' key={id}>
                    <div className='detailContainer'>
                        <div className='detailItem1'>{mode ? `주간요약 (${num}) ${regularDate(date, 0)}~${regularDate(end, 0)}` : `월간요약 (${num}) ${regularDate(date, 0)}~${regularDate(end, 0)}`}</div>
                        <div className='detailItem2'>{mode ? "주간 착용 시간(%)" : "월간 착용 시간(%)"}</div>
                        <div className='detailItem3'>{wearTime}</div>
                        <div className='detailItem4'>{mode ? "주간 미착용 시간(%)" : "월간 미착용 시간(%)"}</div>
                        <div className='detailItem5'>{(100 - wearTime).toFixed(1)}</div>
                        <div className='detailItem6'>{mode ? "주간 주관적 통증 척도(점)" : "월간 주관적 통증 척도(점)"}</div>
                        <div className='detailItem7'>{(meanVas / term).toFixed(1)}</div>
                    </div>
                    <div className='chartBox'>
                        <MyBarChart start={start} end={end} report={returnData} />
                        <div className="lineChart">
                            <MyLineChart start={start} end={end} report={returnData} />
                        </div>
                    </div>
                </div>
            )
        }

        const RepeatData = () => {
            let first = reportData[0].date;
            let diff = reportData.length;
            let DateList = [];
            let monthNum = 1;
            let dateNum = 1;
            let id = 0;
            while (diff > 0) {
                if (diff > 27) {
                    DateList.push(RepeatPart(first, 0, 28, monthNum, id++));
                    if (id % 3 === 2) DateList.push(FirstComponent(id++));
                    monthNum += 1;
                    for (let i = 0; i < 4; i++) {
                        DateList.push(RepeatPart(first, 1, 7, dateNum, id++));
                        if (id % 3 === 2) DateList.push(FirstComponent(id++));
                        dateNum += 1;
                        first.setDate(first.getDate() + 7);
                        diff = diff - 7;
                    };
                    dateNum = 1;
                } else {
                    DateList.push(RepeatPart(first, 0, diff, monthNum, id++));
                    if (id % 3 === 2) DateList.push(FirstComponent(id++));
                    monthNum += 1;
                    while (diff > 6) {
                        DateList.push(RepeatPart(first, 1, 7, dateNum, id++));
                        if (id % 3 === 2) DateList.push(FirstComponent(id++));
                        dateNum += 1;
                        first.setDate(first.getDate() + 7);
                        diff = diff - 7;
                    }
                    DateList.push(RepeatPart(first, 1, diff, dateNum, id++));
                    diff = 0;
                }
            };
            return (
                DateList
            );
        };

        const FirstComponent = (id) => {
            let name = "customTablePrint";
            if (!id) name = "customTable";
            return (
                <div className={name} key={id}>
                    <div className='customTableTh'>
                        병록번호
                    </div>
                    <div className='customTableTd'>
                        {detailData.medicalRecordNumber ? detailData.medicalRecordNumber : ''}
                    </div>
                    <div className='customTableTh'>
                        성함
                    </div>
                    <div className='customTableTd'>
                        {detailData.username ? detailData.username : ''}
                    </div>
                    <div className='customTableTh'>
                        성별
                    </div>
                    <div className='customTableTd'>
                        {detailData.gender ? detailData.gender : ''}
                    </div>
                    <div className='customTableTh'>
                        생년월일
                    </div>
                    <div className='customTableTd'>
                        {detailData.dateOfBirth ? detailData.dateOfBirth : ''}
                    </div>
                </div>
            );
        };
        const LastComponent = () => {
            return (
                <div className='customTableLast'>
                    <div className='customTableTh'>
                        기관명
                    </div>
                    <div className='customTableTd'>
                        {detailData.organization ? detailData.organization : ''}
                    </div>
                    <div className='customTableTh'>
                        담당자
                    </div>
                    <div className='customTableTd'>
                        {detailData.responsiblePersonName ? detailData.responsiblePersonName : ''}
                    </div>
                    <div className='customTableTh'>
                        등록날짜
                    </div>
                    <div className='customTableTd'>
                        {detailData.registrationDate ? regularDate(detailData.registrationDate, 0) : ''}
                    </div>
                </div >
            )
        };

        return (
            <div className='printPart'>
                <div className='detailTitleDiv'>
                    <div className='detailTitle'>
                        {`${detailData.username ? detailData.username : ''}님 개별요약 기록지`}
                    </div>
                </div>
                {FirstComponent()}
                <div>
                    <div className='detailDate'>
                        일시 : {reportData.length ? `${regularDate(reportData[0].date, 1)}~${regularDate(reportData[reportData.length - 1].date, 1)}` : ''}
                    </div>
                </div>
                <div className='detailCombineDiv'>
                    {reportData.length ? RepeatData() : null}
                    {LastComponent()}
                </div>
                <div className='detailButton'>
                    <button onClick={(e) => activeButton(e)}>활동 로그 다운로드</button>
                    <button onClick={(e) => analyzeButton(e)}>분석 파일 다운로드</button>
                    <button onClick={(e) => BackButton(e)}>뒤로가기</button>
                    <button onClick={(e) => PrintButton(e)}>인쇄</button>
                </div>
            </div>
        );
    };

    document.title = `${detailData.username}님의 정보`;

    return (
        <div>
            <HeadBar />
            <div className='detail'>
                <NotPrint detailData={detailData} />
                <PrintSection detailData={detailData} />
            </div>
        </div>
    );
};

export default Detail;
