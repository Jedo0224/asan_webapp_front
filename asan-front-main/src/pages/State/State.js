import React, { useState, useEffect, useRef } from 'react';
import './State.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import { NavLink, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.module.css";
import HeadBar from '../HeadBar/HeadBar';
import axios from "axios";
import { useCookies } from "react-cookie";
import { ip } from '../../server_ip';

const sz = 100;
function SearchTable() {
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0);

  //필터 데이터들
  const [filters, setFilters] = useState({
    "patientName": null,
    "auxiliaryDeviceType": null,
    "birthDate": null,
    "startDate": null,
    "responsiblePersonName": null,
  });

  const [realDate, setRealDate] = useState({
    "birthDate": null,
    "startDate": null,
  })
  //필터 데이터들로 필터링된 데이터
  const [filteredData, setFilteredData] = useState([]);

  //체크된 데이터들
  const [checkedData, setCheckedData] = useState([]);

  //필터 데이터들을 수정하는 함수? 코드
  const handleInputChange = (category, value) => {
    if (value === '') {
      value = null;
    };
    setFilters({
      ...filters,
      [category]: value,
    });
  }

  //단일 체크박스
  const SingleCheck = (checked, medicalRecordNumber) => {
    if (checked) {
      setCheckedData((prev) => [...prev, medicalRecordNumber]);
    } else {
      setCheckedData(checkedData.filter((e) => e !== medicalRecordNumber));
    }
  };

  //모두 체크
  const AllCheck = (checked) => {
    if (checked) {
      const idArray = [];
      filteredData.forEach((el) => idArray.push(el.medicalRecordNumber));
      setCheckedData(idArray);
    } else {
      setCheckedData([]);
    }
  }

  const searchTable = () => {
    setFilteredData([]);
    setPage(0);
  }

  const navigate = useNavigate();

  const goModify = () => {
    if (checkedData.length === 1) {
      navigate('/modify/' + checkedData[0]);
    } else {
      window.alert("체크한 데이터의 수가 " + checkedData.length + "개 입니다. 한 개만 선택해주세요.");
    }
  }

  //벡엔드
  const goDelete = () => {
    if (!checkedData.length) {
      return alert("삭제할 데이터를 선택해주세요.");
    } else
      if (window.confirm("삭제하시겠습니까?")) {
        axios.delete(ip + '/patient/delete',
          {
            headers: {
              Authorization: `Bearer ${cookies.is_login}`,
            },
            data: {
              "medicalRecordNumbers": checkedData
            }
          }
        ).then((response) => {
          if (response.status === 200) {
            alert('삭제되었습니다.');
            setFilteredData([]);
            setPage(0);
          }
        })
          .catch((error) => {
            alert('삭제 중 오류가 발생했습니다.');
          })

        setCheckedData([]);
      }
  }

  const handleDateChange = (cate, date) => {
    if (regularDate(date, 0) !== '1970-01-01') {
      handleInputChange(cate, regularDate(date, 0).toString());
      setRealDate({ ...realDate, [cate]: date });
    } else {
      handleInputChange(cate, null);
      setRealDate({ ...realDate, [cate]: null });
    }
  }

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

  const goPrint = () => {
    document.title = regularDate(new Date(), 0) + "_보조기어드민";
    window.print();
    document.title = "환자 관리";
  }

  const activeStyle = {
    color: "#6392ff"
  };

  // 옵션 객체
  const options = {
    // null을 설정하거나 무엇도 설정하지 않으면 브라우저 viewport가 기준이 된다.
    root: document.querySelector(".userTableDiv"),
    // 타겟 요소의 10%가 루트 요소와 겹치면 콜백을 실행한다.
    threshold: 0,
  };

  const [cookies, setCookie, removeCookie] = useCookies(['is_login']);

  let observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {
      if (entry.isIntersecting && (total >= page * sz || !page)) {
        const sendData = JSON.stringify({
          ...filters,
          "page": page,
          "size": sz
        });

        axios.post(ip + '/patient/search', sendData,
          {
            headers: {
              Authorization: `Bearer ${cookies.is_login}`,
              "Content-Type": "application/json",
            }
          }
        )
          .then((response) => {
            if (!page) {
              setTotal(response.data.result.totalElements);
            }
            if (response.data.result.medicalRecordNumbers.length !== 0) {
              setFilteredData([...filteredData, ...response.data.result.medicalRecordNumbers]);
              setPage(page + 1);
            }


          })
          .catch((error) => {
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
          })
      }
    })
  }, options);

  let target = useRef();

  // list의 끝부분을 알려주는 p 타겟 요소를 관찰
  useEffect(() => {
    observer.observe(target.current);
  });


  document.title = "환자 관리";


  return (
    <div className="user">
      <div className="search">
        <input
          id='name'
          autoComplete="off"
          type="text"
          value={filters.patientName}
          placeholder="환자 이름"
          onChange={(e) => handleInputChange('patientName', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') searchTable() }}
        />
        <DatePicker
          dateFormat="yyyy-MM-dd"
          id='birth'
          selected={realDate.birthDate}
          onChange={(date => {
            handleDateChange('birthDate', date);
          })}
          onKeyDown={(e) => { if (e.key === 'Enter') searchTable() }}
          placeholderText="생년월일"
        />
        <DatePicker
          dateFormat="yyyy-MM-dd"
          id='start'
          selected={realDate.startDate}
          onChange={(date => {
            handleDateChange('startDate', date);
          })}
          onKeyDown={(e) => { if (e.key === 'Enter') searchTable() }}
          placeholderText="보조기 착용 시작일"
        />
        <input
          id='type'
          type="text"
          value={filters.auxiliaryDeviceType}
          placeholder="보조기 종류"
          onChange={(e) => handleInputChange('auxiliaryDeviceType', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') searchTable() }}
        />
        <input
          id='manage'
          type="text"
          value={filters.responsiblePersonName}
          placeholder="담당자"
          onChange={(e) => handleInputChange('responsiblePersonName', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') searchTable() }}
        />
        <button onClick={searchTable}>검색</button>
      </div>
      <div className="userTableDiv">
        <table className="userTable">
          <thead>
            <tr>
              <th className='stateNoPrint'><input id='check' type="checkbox" onChange={(e) => AllCheck(e.target.checked)} checked={checkedData.length === filteredData.length ? true : false}></input>모두 체크</th>
              <th>보조기 종류</th>
              <th>병록 번호</th>
              <th>환자명</th>
              <th>성별</th>
              <th>생년월일</th>
              <th>착용 시작</th>
              <th>남은 기간</th>
              <th>담당자</th>
              <th className='stateNoPrint'>관리</th>
            </tr>
          </thead>
          <tbody className="userTableBody">
            {filteredData.map((row) => {
              const isChecked = checkedData.includes(row.medicalRecordNumber);
              return (
                <tr key={row.medicalRecordNumber} className={isChecked?'statePrint':'stateNoPrint'}>
                  <td className='stateNoPrint'><input name={row.medicalRecordNumber} type="checkbox" onChange={(e) => SingleCheck(e.target.checked, row.medicalRecordNumber)} checked={checkedData.includes(row.medicalRecordNumber) ? true : false}></input></td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.auxiliaryDeviceType}</td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.medicalRecordNumber}</td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.username}</td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.gender}</td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.dateOfBirth}</td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.startDate}</td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.remainingDays}</td>
                  <td className={isChecked?'statePrint':'stateNoPrint'}>{row.responsiblePersonName}</td>
                  <td className='stateNoPrint'><NavLink to={"/detail/" + row.medicalRecordNumber} style={activeStyle}>상세내용</NavLink></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className='forCall' ref={target}>더이상 불러올 데이터가 없습니다.
        </div>
      </div>
      <div className="under">
        <div className="count">
          {"총 " + total + "명 중 " + checkedData.length + "명"}
        </div>
        <div className="stateButton">
          <div className="checker">
            <button onClick={goModify}>수정</button>
            <button onClick={goDelete}>삭제</button>
          </div>
          <button onClick={goPrint}>인쇄</button>
        </div>
      </div>
    </div>
  );
}


const Register = () => {

  const [cookies, setCookie, removeCookie] = useCookies(['is_login']);
  const [regiData, setRegiData] = useState({});

  const kindList = [
    { value: "어깨", name: "어깨" },
    { value: "허리", name: "허리" },
    { value: "무릎", name: "무릎" },
  ];

  const genderList = [
    { value: "MALE", name: "남" },
    { value: "FEMALE", name: "여" }
  ]

  const [fileData, setFileData] = useState(null);

  const handleDetailChange = (type, value) => {
    if (!value) {
      value = null;
    };

    setRegiData({
      ...regiData,
      [type]: value
    });
  };

  const onSelectFile = (e) => {
    setFileData(e.target.files[0]);
  }


  const handleSubmit = (e) => {
    if (regiData.medicalRecordNumber) {
      if (!fileData) {
        return alert('파일을 선택해주세요.');
      } else {
        const sendData = JSON.stringify(regiData);
        axios.post(ip + '/patient/register', sendData,
          {
            headers: {
              Authorization: `Bearer ${cookies.is_login}`,
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            let formData = new FormData();
            formData.append('file', fileData);
            formData.append('medicalRecordNumber', regiData.medicalRecordNumber.toString())
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
                setFileData(null);
                setRegiData({});
                alert('환자 등록이 완료되었습니다.');
              })
              .catch((error) => {
                alert('서버 통신 중 오류가 발생했습니다.');
              })
          })
          .catch((error) => {
            alert('파일의 Columns(형식)을 확인해주세요');
          })
      }
    } else {
      alert('병록번호는 필수 입력입니다.');
    }
  }
  const [dateData, setDateData] = useState({
    registrationDate: null,
    dateOfBirth: null,
    endDate: null,
    startDate: null,
  });
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

  return (
    <div className="register">
      <div className='registerCenter'>
        <div className="regiInfo">
          <div className='regiInfoRow'>
            <div className='regiInfo1first'>보조기 종류</div>
            <div className='regiInfo2first'>
              <select onChange={(e) => {
                e.preventDefault();
                handleDetailChange('auxiliaryDeviceType', e.target.value);
              }}
                value={regiData.auxiliaryDeviceType}>
                <option value={""}>선택하세요</option>
                {kindList.map((item) => {
                  return <option value={item.value} key={item.value}>
                    {item.name}
                  </option>
                })}
              </select>
            </div>
          </div>
          <div className='regiInfoRow'>
            <div className='regiInfo1'>병록번호</div>
            <div className='regiInfo2'>
              <input type='text'
                value={regiData.medicalRecordNumber}
                onChange={(e) => {
                  e.preventDefault();
                  handleDetailChange('medicalRecordNumber', e.target.value);
                }}></input>
            </div>
          </div>
          <div className='regiInfoRow'>
            <div className='regiInfo1'>비밀번호</div>
            <div className='regiInfo2'>
              <input
                type='text'
                value={regiData.password}
                onChange={(e) => {
                  e.preventDefault();
                  handleDetailChange('password', e.target.value)
                }}></input>
            </div>
          </div>
          <div className='regiInfoRow'>
            <div className='regiInfo1'>성함</div>
            <div className='regiInfo2'>
              <input
                type='text'
                value={regiData.username}
                onChange={(e) => {
                  e.preventDefault();
                  handleDetailChange('username', e.target.value)
                }}></input>
            </div>
          </div>
          <div className='regiInfoRow'>
            <div className='regiInfo1'>성별</div>
            <div className='regiInfo2'>
              <select onChange={(e) => {
                e.preventDefault();
                handleDetailChange('gender', e.target.value);
              }}
                value={regiData.gender}>
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
                id='end_date'
                selected={dateData.dateOfBirth}
                onChange={date => {
                  setDateData({ ...dateData, 'dateOfBirth': date });
                  handleDetailChange('dateOfBirth', regularDate(date, 0));
                }}
                placeholderText="형식 : YYYY-MM-DD"
              />
            </div>
          </div>
          <div className='dateRow'>
            <div className='date1'>착용 시작일</div>
            <div className='date2'>
              <DatePicker
                dateFormat="yyyy-MM-dd"
                id='end_date'
                selected={dateData.startDate}
                onChange={date => {
                  setDateData({ ...dateData, 'startDate': date });
                  handleDetailChange('startDate', regularDate(date, 0));
                }}
                placeholderText="형식 : YYYY-MM-DD"
              />
            </div>
          </div>
          <div className='regiInfo1'>파일첨부</div>
          <div className='regiInfo2'>
            <div className='file-name'>{!fileData ? "파일을 업로드해주세요" : fileData.name}</div>
            <label className='file-label-upload' htmlFor="input-file">업로드</label>
            <input
              type='file'
              accept='.csv,.xls, .xlsx'
              id='input-file'
              onChange={onSelectFile}
            />
          </div>
        </div>
        <button className='regiSubmit' onClick={handleSubmit}>{'환자 등록'}</button>
        <div className='danger'>
          <div>주의사항</div>
          <ol className='dangerList'>
            <li>병록번호는 필수 입력이며 다른 환자와 중복된 값을 가질 수 없습니다.</li>
            <li>csv파일을 업로드하고 환자 등록 버튼을 누르면 분석이 시작됩니다.</li>
            <li>환자의 자세한 정보는 환자 관리 부분에서 수정, 추가하실 수 있습니다.</li>
            <li>계속 분석이 실패한다면 문의 부탁드립니다.</li>
            <li>엑셀파일만 업로드 가능하며 첫번째 시트(Sheet1)에 데이터가 있어야 합니다.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}


function State() {
  const [selectedMode, setSelectedMode] = useState(0);

  const selectMode = (mode) => {
    setSelectedMode(mode);
  };

  return (
    <div>
      <HeadBar />
      <div className="main">
        <div className="side">
          <div className='sideText'>메뉴<br />사이드바</div>
          <div className='sideButton'>
            <button onClick={() => selectMode(0)} style={{ background: !selectedMode ? "#813DF2" : "#611DF2" }}>환자 관리</button>
            <button onClick={() => selectMode(1)} style={{ background: selectedMode ? "#813DF2" : "#611DF2" }}>환자 등록</button>
          </div>
        </div>
        {selectedMode ? <Register /> : <SearchTable />}
      </div>
    </div>
  );
}

export default State;