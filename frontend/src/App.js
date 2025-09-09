//app.js ek

import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Currentmonthtab from "./components/Currentmonthtab";
import Footer from "./components/Footer";
import FormWithDropdowns1 from "./components/FormWithDropdowns1";
import FormWithDropdowns4 from "./components/FormWithDropdowns4";
import FormWithDropdowns5 from "./components/FormWithDropdowns5";
import FormWithDropdowns7 from "./components/FormWithDropdowns7";
import FormWithDropdowns8 from "./components/FormWithDropdowns8";
import FormWithDropdowns9 from "./components/FormWithDropdowns9";
import MultiPlatformTables from "./components/MultiPlatformTables";
import MultiRowTable from "./components/MultiRowTable";
import Navbar from "./components/Navbar";
import NewMaintenanceTables from "./components/NewMaintenanceTables";
import ServFulOk from "./components/ServFulOk"; // Import the new ServFulOk component
import ADMIN1 from './components/admin1';
import ADMIN2 from './components/admin2';
import ADMIN3 from './components/admin3';
import ADMIN4 from './components/admin4';
import ADMIN5 from './components/admin5';
import ADMIN6 from './components/admin6';
import FinalTables from "./components/finalTables";
import Homepage from "./components/home";
import LOGIN from './components/login';
import ADMINREGISTER from './components/adminregister';
import ADMINPAGE from './components/adminpage';
import USERREGISTER from './components/userRegister';

import AuthGuard from './guards/AuthGuard';
import UnauthOrize from './components/unauthorize';
import GRAPH from './components/graph';
import GRAPH1 from './components/graph1';
import ADMIN7 from './components/admin7';
import ADMIN8 from './components/admin8';
import ADMIN9 from './components/admin9';
import ADMIN10 from './components/admin10';
import WelcomePage from "./components/WelcomePage"; 

// Home Page Component
function HomePage() {
  return (
    <div>
      <Navbar />
      <FinalTables />
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <Footer />
    </div>
  );
}

// About Page Component
function AboutPage() {
  return (
    <div>
      <Navbar />
      <h1>About Page</h1>
      <p>This is the about page!</p>
      <Footer />
    </div>
  );
}


function GraphPage() {
  return (
    <div>
      <Navbar />
      <GRAPH />

      <Footer />
    </div>
  );
}

function GraphPage1() {
  return (
    <div>
      <Navbar />
      <GRAPH1 />

      <Footer />
    </div>
  );
}


// Form Page Components
function FormPage1() {
  return (
    <div>
      <Navbar />
      <FormWithDropdowns1 />
      <br />
      <br />
      <Footer />
    </div>
  );
}

function FormPage4() {
  return (
    <div>
      <Navbar />
      <FormWithDropdowns4 />
      <br />
      <br />
      <Footer />
    </div>
  );
}

function FormPage5() {
  return (
    <div>
      <Navbar />
      <FormWithDropdowns5 />
      <br />
      <br />
      <Footer />
    </div>
  );
}

function FormPage7() {
  return (
    <div>
      <Navbar />
      <FormWithDropdowns7 />
      <br />
      <br />
      <Footer />
    </div>
  );
}

function FormPage8() {
  return (
    <div>
      <Navbar />
      <FormWithDropdowns8 />
      <br />
      <br />
      <Footer />
    </div>
  );
}

function FormPage9() {
  return (
    <div>
      <Navbar />
      <FormWithDropdowns9 />
      <br />
      <br />
      <Footer />
    </div>
  );
}

// Admin Page Component


// New Maintenance Tables Component
function MaintenanceTablesPage() {
  return (
    <div>
      <Navbar />
      <NewMaintenanceTables />
      <br />
      <br />
      <Footer />
    </div>
  );
}

// Multi-Platform Tables Component
function MultiPlatformTablesPage() {
  return (
    <div>
      <Navbar />
      <MultiPlatformTables />
      <br />
      <br />
      <Footer />
    </div>
  );
}

// Current Month Tab Component
function CurrentMonthTabPage() {
  return (
    <div>
      <Navbar />
      <Currentmonthtab />

      <Footer />
    </div>
  );
}

// MultiRowTable Page Component
function MultiRowTablePage() {
  return (
    <div>
      <Navbar />
      <MultiRowTable />
      <br />
      <br />
      <Footer />
    </div>
  );
}


// Admin Page Component
function Admin1() {
  return (
    <div>
      <Navbar />
      <ADMIN1 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Admin2() {
  return (
    <div>
      <Navbar />
      <ADMIN2 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Admin3() {
  return (
    <div>
      <Navbar />
      <ADMIN3 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Admin4() {
  return (
    <div>
      <Navbar />
      <ADMIN4 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Login() {
  return (
    <div>
      <LOGIN />
    </div>
  );
}





function Admin5() {
  return (
    <div>
      <Navbar />
      <ADMIN5 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Admin6() {
  return (
    <div>
      <Navbar />
      <ADMIN6 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Admin7() {
  return (
    <div>
      <Navbar />
      <ADMIN7 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Admin8() {
  return (
    <div>
      <Navbar />
      <ADMIN8 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Admin9() {
  return (
    <div>
      <Navbar />
      <ADMIN9 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}
function Admin10() {
  return (
    <div>
      <Navbar />
      <ADMIN10 />
      {/* <br /><br /> */}
      <Footer />
    </div>
  );
}

function Adminpage() {
  return (
    <div>
      <Navbar />
      <ADMINPAGE />
      <br /><br />
      <Footer />
    </div>
  );
}


function Adminregister() {
  return (
    <div>
      <Navbar />
      <ADMINREGISTER />
      <br /><br />
      <Footer />
    </div>
  );
}
function Userregister() {
  return (
    <div>
      <Navbar />
      <USERREGISTER />
      
      <Footer />
    </div>
  );
}

// ServFulOk Page Component
function ServFulOkPage() {
  return (
    <div>
      <Navbar />
      <ServFulOk />
      <br />
      <br />
      <Footer />
    </div>
  );
}

function Unauthorize() {
  return (
    <div>
      <Navbar />
      <UnauthOrize />
      <br />
      <br />
      <Footer />
    </div>
  );
}


// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/final-tables" element={ <HomePage />} />
          {/* <Route path="/final-tables" element={<FinalTables />} /> */}
          <Route path="/unauthorized" element={<Unauthorize />} />
          <Route path="/service_fulfilment" element={<AuthGuard requiredPage="SERVICE FULFILMENT"> <FormPage1 /></AuthGuard>} />

          {/* <Route path="/adminpage" element={ <AuthGuard requiredPage="admin"><Adminpage /></AuthGuard>}/> */}


          <Route path="/ip_nw_op" element={<AuthGuard requiredPage="IP NW OP"> <FormPage4 /></AuthGuard>} />
          <Route path="/bb_anw" element={<AuthGuard requiredPage="BB ANW"><FormPage5 /></AuthGuard>} />
          <Route path="/int_&_nt_op" element={<AuthGuard requiredPage="OTN OP"><FormPage7 /></AuthGuard>} />
          <Route path="/form9" element={<AuthGuard requiredPage="form9"><FormPage8 /></AuthGuard>} />
          <Route path="/form10" element={<AuthGuard requiredPage="form10"><FormPage9 /></AuthGuard>} />
          <Route path="/service_fulfilment_form" element={<AuthGuard requiredPage="service_fulfilment_form"><Admin1 /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/ip_nw_op_form" element={<AuthGuard requiredPage="ip_nw_op_form"><Admin2 /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/bb_anw_form" element={<AuthGuard requiredPage="bb_anw_form"><Admin3 /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/int_&_nt_op_form1" element={<AuthGuard requiredPage="int_&_nt_op_form1"><Admin4 /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/int_&_nt_op_form2" element={<AuthGuard requiredPage="int_&_nt_op_form2"><Admin5 /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/tower_mtce_acievement_form" element={<AuthGuard requiredPage="tower_mtce_acievement_form"><Admin6 /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/adminregister" element={<AuthGuard requiredPage="adminpage"><Adminregister /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/userRegister" element={<AuthGuard requiredPage="userRegister"><Userregister /></AuthGuard>} /> 
          <Route path="/adminpage" element={<AuthGuard requiredPage="adminpage"><Adminpage /></AuthGuard>} /> {/* Admin Page route */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/kpi" element={<Login />} /> 
          <Route path="/tm_activity_plan" element={<AuthGuard requiredPage="TM Activity Plan"><MaintenanceTablesPage /></AuthGuard>} />
          <Route path="/routine_mtnc" element={<AuthGuard requiredPage="ROUTINE MTNC"><MultiPlatformTablesPage /></AuthGuard>} />
          <Route path="/tower_mtce_acievement" element={<AuthGuard requiredPage="TOWER MTCE ACIEVEMENT"><CurrentMonthTabPage /></AuthGuard>} />
          
          <Route path="/about" element={<AuthGuard requiredPage="about"><AboutPage /></AuthGuard>} />
          <Route path="/multi-row-table" element={<AuthGuard requiredPage="multi-row-table"><MultiRowTablePage /></AuthGuard>} />
          <Route path="/servfulok" element={<ServFulOkPage />} />
          <Route path="/home" element={<GraphPage/>} />
          <Route path="/home1" element={<GraphPage1/>} />
          <Route path="/tm_activity_plan_form" element={<AuthGuard requiredPage="tm_activity_plan_form"><Admin7/></AuthGuard>} />
          <Route path="/routine_mtnc_form" element={<AuthGuard requiredPage="routine_mtnc_form"><Admin8/></AuthGuard>} />
          <Route path="/email" element={<AuthGuard requiredPage="routine_mtnc_form"><Admin9/></AuthGuard>} />
          <Route path="/Final_table_Frm" element={<Admin10/>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
