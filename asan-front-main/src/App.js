import React from 'react';
import State from "./pages/State/State"
import Login from "./pages/Login/Login"
import Modify from "./pages/Modify/Modify"
import Detail from "./pages/Detail/Detail"
import Sign from "./pages/Sign/Sign"
import LogDetail from "./pages/LogDetail/LogDetail"
import {Route, Routes} from "react-router-dom"

function App() {
  
  return (
    <Routes>
      <Route path="/state" element={<State/>}/>
      <Route path="/" element={<Login/>}/>
      <Route path="/modify/:id" element={<Modify/>}/>
      <Route path="/detail/:id" element={<Detail/>}/>
      <Route path="/sign" element={<Sign/>}/>
      <Route path="/logdetail/:id/:disconnectCount" element={<LogDetail/>}/>
    </Routes>
  );
}

export default App;