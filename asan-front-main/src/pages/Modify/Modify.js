import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Modify.css'
import DatePicker from 'react-datepicker';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import axios from 'axios';
import { useCookies } from "react-cookie";
import HeadBar from '../HeadBar/HeadBar';
import { ip } from '../../server_ip.js';

function Modify() {
    const { id } = useParams();
    const [check, setCheck] = useState({ file: 0, info: 0 })

    const [cookies, setCookie, removeCookie] = useCookies(['is_login']);

    const [individualData, setIndividualData] = useState({
        address: null,
        auxiliaryDeviceType: null,
        dateOfBirth: null,
        email: null,
        endDate: null,
        formFactorNumber: null,
        deviceId: null,
        deviceName: null,
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

    const [dateData, setDateData] = useState({
        registrationDate: null,
        dateOfBirth: null,
        endDate: null,
        startDate: null,
    });

    useEffect(() => {
        axios.get(ip + `/patient/info/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${cookies.is_login}`,
                }
            }
        ).then((response) => {
            const tmpData = response.data.result;
            


            setIndividualData(response.data.result);
            setDateData({
                registrationDate: tmpData.registrationDate ? new Date(tmpData.registrationDate) : null,
                dateOfBirth: tmpData.dateOfBirth ? new Date(tmpData.dateOfBirth) : null,
                endDate: tmpData.endDate ? new Date(tmpData.endDate) : null,
                startDate: tmpData.startDate ? new Date(tmpData.startDate) : null,
            });
        }
        ).catch((error) => {
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        })
    }, []); 


    


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

    const kindList = [
        { value: "어깨", name: "어깨" },
        { value: "허리", name: "허리" },
        { value: "무릎", name: "무릎" },
    ]

    const genderList = [
        { value: "MALE", name: "남" },
        { value: "FEMALE", name: "여" }
    ]

    const relationList = [
        { value: "부", name: "부" },
        { value: "모", name: "모" },
        { value: "자녀", name: "자녀" },
        { value: "친척", name: "친척" },
        { value: "지인", name: "지인" },
    ]

    const Postcode = () => {
        const open = useDaumPostcodePopup();

        const handleComplete = (data) => {
            let fullAddress = data.address;
            let extraAddress = '';

            if (data.addressType === 'R') {
                if (data.bname !== '') {
                    extraAddress += data.bname;
                }
                if (data.buildingName !== '') {
                    extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                }
                fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
            }
            handleDetailChange('address', fullAddress);
        };

        const handleClick = () => {
            open({ onComplete: handleComplete });
        };

        return (
            <button type='button' onClick={handleClick}>
                주소 찾기
            </button>
        );
    };

    const [error, setError] = useState({});

      
    useEffect(()=> { 
        const fetchData = async () => {

        try {
            const response = await axios.get(ip + "/beacon-data/getDevices");
            setDeviceList(response.data)
        
        } catch (error) {
            setError(error)
        }
        };
        fetchData()
    },[])


    const handleDetailChange = (type, value) => {
        setCheck({ ...check, info: 1 });
        if (value === '') {
            value = null;
        };
        setIndividualData({
            ...individualData,
            [type]: value
        });
    }

    const [fileData, setFileData] = useState(null)

    const onSelectFile = (e) => {
        setCheck({ ...check, file: 1 });
        setFileData(e.target.files[0]);
    }

    const [regiData, setRegiData] = useState({});
    const [deviceList, setDeviceList] = useState([]);

    const handleDeviceChange = (type1, type2,value) => {
        // console.log(value)
        if (!value) {
          value = null;
    
          setRegiData({
            ...regiData,
            [type1]: null,
            [type2]: null
          });
        }
        else{   
          var deviceInfo=  value.split("-")
          var id = deviceInfo[0];  
          var name = deviceInfo[1];  

          
          setRegiData({
            ...regiData,
            [type1]: id,
            [type2]: name
          });
    
          setRegiData({
            ...regiData,
            [type1]: id,
            [type2]: name
          });
        }
      };

    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1);
    }
    const handleSubmit = () => {
        if (check.info === 0 && check.file === 0) {
            return alert('수정할 데이터가 없습니다.');
        } else if (check.info === 1 && check.file === 0) {
            axios.patch(ip + '/patient/update',
                individualData
                ,
                {
                    headers: {
                        Authorization: `Bearer ${cookies.is_login}`,
                    }
                }
            ).then((response) => {
                alert('수정되었습니다.');
                navigate(-1);
            }).catch((error) => {
                alert('수정 중 오류가 발생하였습니다.');
            })

        } else if (check.info === 0 && check.file === 1) {
            let formData = new FormData();
            formData.append('file', fileData);
            formData.append('medicalRecordNumber', individualData.medicalRecordNumber)
            axios.post(ip + '/sensorFile/upload', formData,
                {
                    headers: {
                        Authorization: `Bearer ${cookies.is_login}`,
                        "Content-Type": "multipart/form-data",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            )
                .then((response) => {
                    alert('파일 업로드가 완료되었습니다.');
                    navigate(-1);
                })
                .catch((error) => {
                    alert('업로드를 실패했습니다.');
                })
        } else {
            axios.patch(ip + '/patient/update',
                individualData
                ,
                {
                    headers: {
                        Authorization: `Bearer ${cookies.is_login}`,
                    }
                }
            ).then((response) => {
                let formData = new FormData();
                formData.append('file', fileData);
                formData.append('medicalRecordNumber', individualData.medicalRecordNumber)
                axios.post(ip + '/sensorFile/upload', formData,
                    {
                        headers: {
                            Authorization: `Bearer ${cookies.is_login}`,
                            "Content-Type": "multipart/form-data",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                )
                    .then((response) => {
                        alert('파일 업로드와 수정이 완료되었습니다.');
                        navigate(-1);
                    })
                    .catch((error) => {
                        alert('업로드를 실패했습니다.');
                    })
            }).catch((error) => {
                alert('수정 중 오류가 발생하였습니다.');
            })
        }
    }
    document.title = "환자 정보 수정";
    return (
        <div>
            <HeadBar />
            <div className="modify">
                <div className='modifyDiv'>
                    <div className='modifyTitle'>수정 페이지</div>
                    <div className='subTitle'>인적사항</div>
                    <div className="patient">
                        <div className='patientRow'>
                            <div className='patient1first'>보조기 종류</div>
                            <div className='patient2first'>
                                <select onChange={(e) => {
                                    e.preventDefault();
                                    handleDetailChange('auxiliaryDeviceType', e.target.value);
                                }}
                                    value={individualData.auxiliaryDeviceType}>
                                    <option value={""}>선택하세요</option>
                                    {kindList.map((item) => {
                                        return <option value={item.value} key={item.value}>
                                            {item.name}
                                        </option>
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className='patientRow'>
                            <div className='patient1'>병록번호</div>
                            <div className='patient3'>
                                <input type='text' value={individualData.medicalRecordNumber} disabled></input>
                            </div>
                        </div>
                         <div className='patientRow'>
                            <div className='patient1first'>사용 보조기</div>
                            <div className='patient2first'>
                            <select onChange={(e) => {
                                e.preventDefault();
                                handleDeviceChange('deviceId','deviceName', e.target.value);
                            }}
                                value={individualData.deviceId + "-" + individualData.deviceName }>
                                <option value={""}>선택하세요</option>
                                {deviceList.map((item) => {
                                return <option value={item.id+"-"+item.deviceName} key={item.id}>
                                    {item.id+"-"+item.deviceName}
                                </option>
                                })}
                            </select>
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>성함</div>
                            <div className='patient2'>
                                <input type='text' value={individualData.username}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('username', e.target.value)
                                    }}></input>
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>성별</div>
                            <div className='patient2'>
                                <select onChange={(e) => {
                                    e.preventDefault();
                                    handleDetailChange('gender', e.target.value);
                                }}
                                    value={individualData.gender}>
                                    <option value={""}>선택하세요</option>
                                    {genderList.map((gender) => {
                                        return <option value={gender.value} key={gender.value}>
                                            {gender.name}
                                        </option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className='dateRow'>
                            <div className='date1'>생년월일</div>
                            <div className='date2'>
                                <DatePicker
                                    dateFormat="yyyy-MM-dd"
                                    id='birth_date'
                                    selected={dateData.dateOfBirth}
                                    onChange={date => {
                                        setDateData({ ...dateData, 'dateOfBirth': date });
                                        handleDetailChange('dateOfBirth', regularDate(date, 0));
                                    }}
                                    placeholderText="생년월일"
                                />
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>비밀번호</div>
                            <div className='patient2'>
                                <input type='password' value={''}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('password', e.target.value);
                                    }}></input>
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>이메일</div>
                            <div className='patient2'>
                                <input type='text' value={individualData.email}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('email', e.target.value);
                                    }}></input>
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>연락처</div>
                            <div className='patient2'>
                                <input type='tel' value={individualData.phoneNumber}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('phoneNumber', e.target.value);
                                    }}></input>
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>주소</div>
                            <div className='patientAddress'>
                                <input type='text'
                                    value={individualData.address}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('address', e.target.value);
                                    }}></input>
                                <Postcode />
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>폼팩터 넘버</div>
                            <div className='patient2'>
                                <input type='text' value={individualData.formFactorNumber}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('formFactorNumber', e.target.value);
                                    }}></input>
                            </div>
                        </div>
                    </div>
                    <div className='subTitle'>초기평가</div>
                    <div className="firstEval">
                        <div className='textareaDiv'>
                            <textarea
                                value={individualData.initialEvaluation}
                                maxLength="150"
                                className='evalTextarea'
                                onChange={(e) => {
                                    e.preventDefault();
                                    handleDetailChange('initialEvaluation', e.target.value);
                                }}></textarea>
                        </div>
                    </div>
                    <div className='subTitle'>보호자 인적사항</div>
                    <div className="guard">
                        <div>
                            <div className='patient1first'>보호자 성함</div>
                            <div className='patient2first'>
                                <input type='text' value={individualData.guardianName}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('guardianName', e.target.value)
                                    }}></input>
                            </div>
                        </div>
                        <div>
                            <div className='patient1'>보호자 관계</div>
                            <div className='patient2'>
                                <select onChange={(e) => {
                                    e.preventDefault();
                                    handleDetailChange('guardianRelationship', e.target.value);
                                }}
                                    value={individualData.guardianRelationship}>
                                    <option value={""}>선택하세요</option>
                                    {relationList.map((e) => {
                                        return <option value={e.value} key={e.value}>
                                            {e.name}
                                        </option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div>
                            <div className='patient1'>연락처</div>
                            <div className='patient2'>
                                <input type='tel' value={individualData.guardianPhoneNumber}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('guardianPhoneNumber', e.target.value);
                                    }}></input>
                            </div>
                        </div>
                    </div>

                    <div className='subTitle'>시작 시기 및 종료 시기</div>
                    <div className="modifyDate">
                        <div className='dateRow'>
                            <div className='date1first'>시작날짜</div>
                            <div className='date2first'>
                                <DatePicker
                                    dateFormat="yyyy-MM-dd"
                                    id='start_date'
                                    selected={dateData.startDate}
                                    onChange={date => {
                                        setDateData({ ...dateData, 'startDate': date });
                                        handleDetailChange('startDate', regularDate(date, 0));
                                    }}
                                    placeholderText="시작날짜"
                                />
                            </div>
                        </div>
                        <div className='dateRow'>
                            <div className='date1'>종료날짜</div>
                            <div className='date2'>
                                <DatePicker
                                    dateFormat="yyyy-MM-dd"
                                    id='end_date'
                                    selected={dateData.endDate}
                                    onChange={date => {
                                        setDateData({ ...dateData, 'endDate': date });
                                        handleDetailChange('endDate', regularDate(date, 0));
                                    }}
                                    placeholderText="종료날짜"
                                />
                            </div>
                        </div>
                    </div>
                    <div className='subTitle'>담당 세부사항</div>
                    <div className="manage">
                        <div className='patientRow'>
                            <div className='patient1first'>기관명</div>
                            <div className='patient3first'>
                                <input type='text' value={individualData.organization} disabled></input>
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>담당자 성함</div>
                            <div className='patient2'>
                                <input type='text' value={individualData.responsiblePersonName}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('responsiblePersonName', e.target.value)
                                    }}></input>
                            </div>
                        </div>
                        <div className='patientRow'>
                            <div className='patient1'>담당자 번호</div>
                            <div className='patient2'>
                                <input type='text' value={individualData.responsiblePersonNumber}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleDetailChange('responsiblePersonNumber', e.target.value)
                                    }}></input>
                            </div>
                        </div>
                        <div className='dateRow'>
                            <div className='date1'>등록 날짜</div>
                            <div className='date2'>
                                <DatePicker
                                    dateFormat="yyyy/MM/dd"
                                    id='manage_date'
                                    selected={dateData.registrationDate}
                                    onChange={date => {
                                        setDateData({ ...dateData, 'registrationDate': date });
                                        handleDetailChange('registrationDate', regularDate(date, 0));
                                    }}
                                    placeholderText="등록날짜"
                                />
                            </div>
                        </div>
                    </div>
                    <div className='subTitle'>파일첨부</div>
                    <div className="manage">
                        <div className='patientRow'>
                            <div className='patient1first'>파일첨부</div>
                            <div className='file2first'>
                                <div className='file-flex'>
                                    <div className='file-name'>{fileData ? fileData.name : ''}</div>
                                    <label className='file-label' htmlFor="input-file">업로드</label>
                                    <input
                                        type='file'
                                        accept='.csv'
                                        id='input-file'
                                        onChange={onSelectFile}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='modifySubmitDiv'>
                        <button className='modifySubmit'
                            onClick={handleBack}>뒤로가기</button>
                        <button className='modifySubmit'
                            onClick={handleSubmit}>수정(분석도 같이 진행됩니다.)</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modify;