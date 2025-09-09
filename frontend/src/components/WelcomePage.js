import React from "react";
import "./WelcomePage.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import logoImage from "./assets/Logo.png";
import logoSLT from "./assets/LogoNew.png";
import NocApp from "./assets/NocApp.png";
import slider from "./assets/SliderImage.png";

import nocCIDR from "./assets/website.png";
import nocPortal from "./assets/online.png";
import raspberry from "./assets/raspberryLogo.png";
import appMontoring from "./assets/appMonitoring.png";
import issueRegister from "./assets/issueRegister.png";
import networkMonitoring from "./assets/networkMonitoring.png";
import faultHandling from "./assets/faultHandling.png";
import digitalService from "./assets/digitalService.png";
import noFlash from "./assets/no-flash.png";
import schedule from "./assets/schedule.png";
import kpi from "./assets/kpi.png";

import { MdGetApp } from "react-icons/md";
import { FaAndroid } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

import {Component} from 'react';

class WelcomePage extends Component{

  constructor(props){
    super(props)
    this.state={
      submissions:[],
      successMessage: ""
    }
  }

  API_URL="/api/access-requests";
  APK_URL = "/public/nocapp.apk";
  GUIDEBOOK_URL = "/public/Guidebook.pdf";


  componentDidMount(){
    this.refreshSubmissions();
  }

  async refreshSubmissions() {
    fetch(this.API_URL + "/getDetails")
      .then((response) => response.json())
      .then((data) => {
        // Sort submissions based on timestamp in descending order
        const sortedSubmissions = data.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        this.setState({ submissions: sortedSubmissions });
      });
  }

  async addClick(event) {
    event.preventDefault();

    // Getting form input values
    var newSubmissionName = document.getElementById("inputName").value;
    var newSubmissionSNO = document.getElementById("inputServiceNO").value;
    var newSubmissionOption = document.getElementById("inputOption").value;
    var newSubmissionReason = document.getElementById("reason").value;

    // Checking if any field is empty
    if (!newSubmissionName || !newSubmissionSNO || !newSubmissionOption || !newSubmissionReason || newSubmissionOption === 'defaultOption') {
      alert("Please fill all the fields..");
      return;
    }

    // Constructing timestamp
    var timestamp = new Date().getTime();
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    // Format the date components as needed
    var newSubmissionTimestamp = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    const data = new FormData();
    data.append("newSubmissionName", newSubmissionName);
    data.append("newSubmissionSNO", newSubmissionSNO);
    data.append("newSubmissionOption", newSubmissionOption);
    data.append("newSubmissionReason", newSubmissionReason);
    data.append("newSubmissionTimestamp", newSubmissionTimestamp);

    fetch(this.API_URL + "/submitData", {
      method: "POST",
      body: data
    }).then(res => res.json())
      .then((result) => {
        this.setState({ successMessage: "Access Request submitted successfully!" });
        // alert(result);
        this.refreshSubmissions();
        // Clearing form fields after successful submission
        document.getElementById("inputName").value = "";
        document.getElementById("inputServiceNO").value = "";
        document.getElementById("inputOption").value = "";
        document.getElementById("reason").value = "";
        setTimeout(() => {
          this.setState({ successMessage: "" });
        }, 5000);
      });
  }

  // // Function to handle downloading the APK
  // downloadAPK = () => {
  //   // Replace 'APK_URL' with the actual URL of your APK file
  //   const APK_URL = "https://drive.google.com/file/d/1gC6DnHQo1Kvj3wwCfOG5amiVM112-lM8/view?usp=drive_link";
  //   window.open(APK_URL, "_blank");
  // };

  // // Function to handle downloading the guidebook
  // downloadGuidebook = () => {
  //   // Replace 'GUIDEBOOK_URL' with the actual URL of your guidebook file
  //   const GUIDEBOOK_URL = "https://drive.google.com/file/d/1g5BJ_roy3KgyU7MAbi8l5Lhl2NaohpmD/view?usp=drive_link";
  //   window.open(GUIDEBOOK_URL, "_blank");
  // };
  

render() {
  const {submissions, successMessage} = this.state;
  const cardsData = [
    { id: 1, value: "SLT NOC Portal", title: "SLT NOC Portal", description: "Monitor Network Alarms and Escalations", imageUrl: nocPortal },
    { id: 2, value: "SLT NOC CDR Portal", title: "SLT NOC CDR Portal", description: "Get the summary of call records of NOC and new connection testing", imageUrl: nocCIDR },
    { id: 4, value: "Raspberry RTU Monitoring", title: "Raspberry RTU Monitoring", description: "Telemetry Unit maintenance and Alarm configuring portal", imageUrl: raspberry },
    { id: 5, value: "Issue Register Portal", title: "Issue Register Portal", description: "Log any with the contractors during the project completion", imageUrl: issueRegister },
    { id: 6, value: "Network Log Monitoring", title: "Network Log Monitoring", description: "View real time network alarm monitoring", imageUrl: networkMonitoring },
    { id: 7, value: "LTE Fault Handling", title: "LTE Fault Handling", description: "Integrated with necessary system logs to support LTE fault handling", imageUrl: faultHandling },
    { id: 8, value: "Digital Enabled Service", title: "Digital Enabled Service", description: "Inventory Management system for the Managed Services Operation", imageUrl: digitalService },
    { id: 9, value: "Commercial Planned Power Outages", title: "Commercial Planned Power Outages", description: "View Planned Commercial Power Outages of CEB and LECO", imageUrl: noFlash },
    { id: 10, value: "Maintenance Calendar", title: "Maintenance Calendar", description: "Schedule routine maintenance of equipment rooms in regions and HQ", imageUrl: schedule },
    { id: 3, value: "Application Monitoring Dashboard", title: "Application Monitoring Dashboard", description: "Monitor running console application status", imageUrl: appMontoring },
    { id: 11, value: "KPI Dashboard", title: "Key Performance Indicator (KPI) Dashboard", description: "Network key performance indicator monitoring", imageUrl: kpi },
  
  ];
  

  function getCardUrl(cardId) {
    switch (cardId) {
      case 1:
        return "http://172.25.37.246/tms/login.aspx";
      case 2:
        return "http://172.25.37.193/cdr/home.aspx";
      case 3:
        return "http://172.25.37.193/monitor/home.aspx";
      case 4:
        return "http://220.247.222.67/rpb/login.aspx";
      case 5:
        return "http://172.25.37.251:8080/IssueRegister/";
      case 6:
        return "http://172.25.37.251:8080/NetworkLogMonitoring_1/revenue.jsp";
      case 7:
        return "http://172.25.37.251:8080/LTEFaultHandling/";
      case 8:
        return "http://172.25.37.251:8080/DigitalEnabledService_IM/summary.jsp";
      case 9:
        return "http://172.25.37.251:8080/CommercialPlannedPowerOutage/";
      case 10:
        return "http://172.25.37.246/maintenance_schedule/login.aspx";
      case 11:
        return "http://localhost:3000/kpi";
      default:
        return "#"; // Default URL or fallback
    }
  }

  return (
    <div className="bg App">
      <nav className="navbar navbar-expand-lg navbar-light px-3 bg-white fixed-top">
        <div className="container-fluid">
          {/* <a className="navbar-brand" href="#">SLT SOC & NM</a> */}
          <a href="#"><img src={logoImage} className="navbar-brand img-fluid" width="150" alt="Logo" /></a>

          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#navbarNavOffcanvas" aria-controls="navbarNavOffcanvas" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-start" id="navbarNavOffcanvas" aria-labelledby="navbarNavOffcanvasLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="navbarNavOffcanvasLabel">Menu</h5>
              <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" href="#services">Services</a>
                </li>
                {/* <li className="nav-item">
                  <a className="nav-link" href="#">Contact</a>
                </li> */}
              </ul>
              <ul className="navbar-nav ms-auto">
                <li className="nav-item nav-item-1">
                  <button className="btn btn-primary me-2 " data-bs-toggle="offcanvas" data-bs-target="#staticBackdrop" aria-controls="staticBackdrop" href="#" onClick={() => window.open(this.APK_URL, "_blank")}>
                  <MdGetApp /> NOC APP
                  </button>
                </li>
                <div className="dropdown">
                  <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Access Requests
                  </button>
                  <ul className="dropdown-menu">
                    <li><button className="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#accessRequest" aria-controls="staticBackdrop">All</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={() => document.getElementById("requestAccess").scrollIntoView()}>Request Access</button></li>
                  </ul>
                </div>
                {/* <li className="nav-item">
                  <a href="#requestAccess">
                  <button className="btn btn-secondary" data-bs-target="#staticBackdrop" aria-controls="staticBackdrop">Request Access</button>
                  </a>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div id="carouselExampleDark" className="carousel carousel-dark slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active" data-bs-interval="10000">
            <div className="container-fluid text-light px-5 py-lg-4 py-5 animate-bg1">
              <div className="row flex-lg-row-reverse align-items-center mt-5 g-1 py-3">
                <div className="col-12 col-sm-12 col-lg-6 text-center">
                  <img src= {slider} className="d-block mx-auto img-fluid" alt="Bootstrap Themes" width="auto" loading="lazy" />
                </div>
                <div className="col-lg-6 px-1">
                  <h2 className="display-6 lh-1 mt-3 mb-2">Welcome to</h2>
                  <h3 className="display-3 fw-bold lh-1 mb-1">SLT SOC & NM</h3>
                  <h3 className="display-3 fw-bold lh-1 mb-3">Dashboard</h3>
                  <p className="lead">Your gateway to seamless access to our suite of web applications.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item" data-bs-interval="10000">
            <div className="container-fluid bg-white text-dark px-5 py-4">
              <div className="row flex-lg-row-reverse align-items-center mt-5 g-0 py-3">
                <div className="col-12 col-sm-12 col-lg-6 text-center">
                  <img src={NocApp} className="d-block mx-auto img-fluid" alt="Bootstrap Themes" width="auto" loading="lazy" />
                </div>
                <div className="col-lg-6 px-1">
                  <h2 className="display-6 lh-1 mt-3 mb-2">Introducing</h2>
                  <h3 className="display-3 fw-bold lh-1 mb-1" style={{ color: "#0055a2" }}>SLT NOC Portal</h3>
                  <h3 className="display-3 fw-bold lh-1 mb-3"><span style={{ color: "green" }}>V2.0</span>
                  </h3>
                  <p className="lead">Your All-in-One Network Operations Companion</p>
                  <div className="mt-3 mb-3">
                    <button className="btn btn-primary me-3" onClick={() => window.open(this.APK_URL, "_blank")}>Download APK / <FaAndroid /></button>
                    <button className="btn btn-secondary" onClick={() => window.open(this.GUIDEBOOK_URL, "_blank")}>Guidebook</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-5" id="services"> {/* Add pt-5 class for padding top */}
        <h4 className="display-5 mb-5">Select your <span className="fw-bold">Service</span></h4>
      </div>
      <div className="container px-4 mb-4">
        <div className="row">
          {cardsData.map(card => (
            <div key={card.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div className="card card-hover">
                <img src={card.imageUrl} className="card-img-top mt-2 w-25 mx-auto" alt={card.title} />
                <div className="card-body">
                  <h5 className="card-title">{card.title}</h5>
                  <p className="card-text">{card.description}</p>
                  <a href={getCardUrl(card.id)} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3">Navigate</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        <div className="bg-white">
          <div className="container bg-white py-5 px-4">
            <div className="container" id="requestAccess">
              <h4 className="display-5 mb-5">Make an <span className="fw-bold">Access Request</span></h4>
            </div>
            <form className="px-lg-5">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="inputName">Name:</label>
                    <input type="text" className="form-control" id="inputName" placeholder="Enter your name.." required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputServiceNO">Service Number:</label>
                    <input type="text" className="form-control" id="inputServiceNO" placeholder="Enter your 6-digit service number.." required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="application">Application you want access:</label>
                    <select
                      className="form-select form-select-md"
                      id="inputOption"
                      aria-label="Default select example"
                      defaultValue="defaultOption"
                    >
                      <option value="defaultOption" disabled>Select an application..</option>
                      {cardsData.map(card => (
                        <option key={card.id} value={card.value}>{card.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="reason">Why do you need access?</label>
                    <textarea type="text" className="form-control" id="reason" placeholder="Type here.." required></textarea>
                  </div>
                  <div className=" d-flex align-items-end">
                    <button onClick={(e) => this.addClick(e)} type="submit" className="btn btn-primary w-100">Submit</button>
                  </div>
                </div>

              </div>
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  <IoIosCheckmarkCircleOutline style={{ fontSize: '2em'}}/> {successMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      

      <div className="offcanvas offcanvas-end" data-bs-scroll="false" data-bs-backdrop="false" tabIndex="-1" id="accessRequest" aria-labelledby="staticBackdropLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="staticBackdropLabel">All Access Requests</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div>
          {submissions.map(submissions=>
            <div className="card cardOffCanvas mb-3">
              <h6 className="card-header ">Request ID: #{submissions.id}</h6>
              <div className="card-body">
                <h5 className="card-title">{submissions.option}</h5>
                <p className="card-text"><span className="fw-bold">Service No:</span> {submissions.serviceNo}</p>
                <p className="card-text"><span className="fw-bold">Name:</span> {submissions.name}</p>
                <p className="card-text"><span className="fw-bold">Timestamp:</span> {submissions.timestamp}</p>
                <p className="card-text"><span className="fw-bold">Reason:</span> {submissions.reason}</p>
              </div>
            </div>
            )}
            {/* <div className="card cardOffCanvas mb-3">
              <h5 className="card-header bg-dark text-light">Request ID: #000001</h5>
              <div className="card-body">
                <h5 className="card-title">Raspberry RTU Monitoring</h5>
                <p className="card-text"><span className="fw-bold">Service No:</span> 123456</p>
                <p className="card-text"><span className="fw-bold">Timestamp:</span> 2024-03-14 16:13:43</p>
                <p className="card-text"><span className="fw-bold">Reason:</span> I am requesting access to Raspberry RTU Monitoring in order to briefly describe the specific tasks or responsibilities you need to perform. Access to this application is crucial for me to explain how accessing the application will contribute to your work or project.</p>
              </div>
            </div>
            <div className="card cardOffCanvas mb-3">
              <h5 className="card-header bg-dark text-light">Request ID: #000001</h5>
              <div className="card-body">
                <h5 className="card-title">Raspberry RTU Monitoring</h5>
                <p className="card-text"><span className="fw-bold">Service No:</span> 123456</p>
                <p className="card-text"><span className="fw-bold">Timestamp:</span> 2024-03-14 16:13:43</p>
                <p className="card-text"><span className="fw-bold">Reason:</span> I am requesting access to Raspberry RTU Monitoring in order to briefly describe the specific tasks or responsibilities you need to perform. Access to this application is crucial for me to explain how accessing the application will contribute to your work or project.</p>
              </div>
            </div>
            <div className="card cardOffCanvas mb-3">
              <h5 className="card-header bg-dark text-light">Request ID: #000001</h5>
              <div className="card-body">
                <h5 className="card-title">Raspberry RTU Monitoring</h5>
                <p className="card-text"><span className="fw-bold">Service No:</span> 123456</p>
                <p className="card-text"><span className="fw-bold">Timestamp:</span> 2024-03-14 16:13:43</p>
                <p className="card-text"><span className="fw-bold">Reason:</span> I am requesting access to Raspberry RTU Monitoring in order to briefly describe the specific tasks or responsibilities you need to perform. Access to this application is crucial for me to explain how accessing the application will contribute to your work or project.</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="container">
        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3">
          <div className="col-md-6 d-flex align-items-center justify-content-center justify-content-md-start">
            <span className="mb-3 mb-md-0 me-2 me-md-2 text-muted">&copy; 2024 SLT SOC & NM</span>
            {/* <a href="#" className="mb-3 me-2 mb-md-0 text-muted text-decoration-none lh-1">
              <img src={logoImage} className="navbar-brand" width="100" alt="Card Image" />
            </a>
            <span className="mb-3 mb-md-0 me-2 me-md-2 text-muted"> | All Rights Reserved</span> */}
          </div>
          <ul className="nav col-md-4 justify-content-center justify-content-md-end list-unstyled d-flex">
            <span className="mb-3 mb-md-0 me-2  text-muted">Powered by </span>
            <a href="#" className="text-muted text-decoration-none lh-1">
              <img src={logoSLT} className="navbar-brand" width="20" alt="SLT logo" />
            </a>
          </ul>
        </footer>
      </div>
    </div>
  );
}
}
export default WelcomePage;