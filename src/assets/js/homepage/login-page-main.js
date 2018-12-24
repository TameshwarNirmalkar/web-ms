"use strict";

(function () {

  function getBrowserInfo() {
    let browserDtl = {
      name: '',
      version: ''
    };
    let ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|edge|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      browserDtl.name = 'IE';
      browserDtl.version = tem[1] || '';
      return browserDtl;
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
        browserDtl.name = 'Opera';
        browserDtl.version = tem[1] || '';
        return browserDtl;
      }
      tem = ua.match(/\bEdge\/(\d+)/);
      if (tem != null) {
        browserDtl.name = 'Edge';
        browserDtl.version = tem[1] || '';
        return browserDtl;
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    browserDtl.name = M[0];
    browserDtl.version = M[1];
    return browserDtl;
  }

  let countryDetailsFetched = false;
  let environmentDetailsFetched = false;
  let auditDetailsFetched = false;
  let browserInfo = getBrowserInfo();
  let env = "";
  let timer;
  const COUNTRY_API_URL = 'https://freegeoip.net/json/?callback=country_callback';
  let deviceDetails = {
    country_code: "",
    device_type: browserInfo.device_type,
    ip: "",
    model: browserInfo.model,
    name: browserInfo.model,
    version: browserInfo.version
  };

  // Generic function to make Ajax calls.
  function makeAjaxCall(request, callback) {

    let xhr = new XMLHttpRequest();

    xhr.open(request.requestMethod, request.url, true);

    if (request.headers && Array.isArray(request.headers)) {

      for (let i = 0; i < request.headers.length; i++) {

        xhr.setRequestHeader(request.headers[i].header, request.headers[i].value);

      }

    }

    xhr.send(request.data || null);

    xhr.onreadystatechange = function () {

      if (xhr.readyState === 4) {

        if (xhr.status === 200) {

          if (request.parseResponse === false) {

            if (request.isLogin === true) {

              callback(null, xhr);

            } else {

              callback(null, xhr.response);

            }

          } else {

            let response = JSON.parse(xhr.response);

            callback(null, response);

            response = null;

          }

        } else {

          callback(xhr.response);

        }

      }

    }

  }

  // Generic function to display and hide errors.
  function displayError(errorMessage, errorContainer, color, duration) {

    let message = errorMessage || "Something went wrong, please try again in a few moments or contact support.";
    let textColor = color || "#ff0000";
    let time = duration || 3000;

    document.getElementById(errorContainer).innerText = message;
    document.getElementById(errorContainer).style.color = textColor;
    document.getElementById(errorContainer).style.display = "block";

    setTimeout(function () {

      document.getElementById(errorContainer).innerText = "";
      // document.getElementById(errorContainer).style.display = "none";
      document.getElementById(errorContainer).style.color = textColor;

    }, time);

    message = null;
    textColor = null;
    time = null;

  }


  let fetchCountryDetails = function (callback) {

    let req = {};

    req.requestMethod = "GET";
    req.url = COUNTRY_API_URL;
    req.parseResponse = false;

    makeAjaxCall(req, function (err, countryDetails) {

      if (err) {

        callback(new Error("Failed to fetch user ip." + JSON.stringify(err)));

      } else {

        callback(null, countryDetails);
      }

    });

    req = null;

  };


  let initEnvironment = function (callback) {

    let req = {};

    req.requestMethod = "GET";
    req.url = "/assets/env/environment.json";

    makeAjaxCall(req, function (err, res) {

      if (err) {

        callback(new Error("Failed to initialise environment. " + res));
        console.trace();

      } else {

        callback(null, res);

      }

    });

  };


  // Try to get the preferred language from the browser or fallback to en.
  function initLanguage() {

    let language = window.navigator.language.split("-")[0];

    if (language && (language === "en" || language === "es" || language === "zh")) {

      window.localStorage.setItem("lang", language);

    } else {

      window.localStorage.setItem("lang", "en");

    }

  }

  function initAuditSettings() {

    let req = {};

    req.requestMethod = "GET";
    req.url = env.AuditApi + '/exposed/audit/list/' + env.AuditApiVersion;
    req.headers = [{
      "header": "calling_entity",
      "value": "UI"
    }, {
      "header": "token",
      "value": "solitaire"
    }];

    makeAjaxCall(req, function (err, response) {

      if (err) {

        console.error("Failed to initialise audit.");
        console.error(err);

      } else {

        window.localStorage.setItem("srk-audit-setting", JSON.stringify(response.data));
        auditDetailsFetched = true;

      }

    });

  }


  function makeAuditActivityCall(activity) {

    let activityList = JSON.parse(window.localStorage.getItem("srk-audit-setting")).activity_list;
    let activityID = activityList.find(function (elm) {

      return elm.activity_name === activity;

    });

    if (activityID) {

      let req = {
        requestMethod: "POST",
        url: env.AuditApi + '/exposed/audit/activity/' + env.AuditApiVersion,
        data: JSON.stringify({
          'activity_id': activityID.activity_id,
          'ip_address': deviceDetails.ip,
          'app_code': 13
        }),
        headers: [{
          "header": "calling_entity",
          "value": "UI"
        }, {
          "header": "token",
          "value": "solitaire"
        }]

      };

      makeAjaxCall(req, function (err, res) {

        if (err) {

          console.error("Failed to record activity load");
          console.error(err);

        } else {

          // console.log("Successfully recorded the activity load");
          // console.log(res);

        }

      });

    } else {

      console.log("Invalid activity");

    }

  }


  function makeAuditActionCall(action) {

    console.log("action is " + action);
    console.log(typeof action);

    let actionList = JSON.parse(window.localStorage.getItem("srk-audit-setting")).action_list;
    let actionID = actionList.find(function (elm) {

      return elm.action_name === action;

    });

    if (actionID) {

      let req = {
        requestMethod: "POST",
        url: env.AuditApi + '/exposed/audit/activity/' + env.AuditApiVersion,
        data: JSON.stringify({
          'activity_id': actionID.action_id,
          'ip_address': deviceDetails.ip,
          'app_code': 13
        }),
        headers: [{
          "header": "calling_entity",
          "value": "UI"
        }, {
          "header": "token",
          "value": "solitaire"
        }]

      };

      makeAjaxCall(req, function (err, res) {

        if (err) {

          console.error("Failed to record activity load");
          console.error(err);

        } else {

          console.log("Successfully recorded the action.");
          console.log(res);

        }

      });

    } else {

      console.log("Failed");
      console.log(actionID);

    }

  }


  let fetchPermissionList = function (list) {

    const htmlElementJson = {};
    const urlJson = {};

    for (let element in list) {
      if (list.hasOwnProperty(element)) {
        const listData = list[element];
        if (listData.resource_type === 'HTML-ELEMENT') {
          htmlElementJson[element] = listData;
        } else {
          urlJson[element] = listData;
        }
      }
    }

    return JSON.stringify(htmlElementJson);

  };


  let setAuthData = function (data, token) {

    let loginName = data.data.user_payload.user_detail.login_name;

    window.localStorage.setItem('login-name', loginName);
    window.localStorage.setItem(loginName + '-auth-token', token);
    window.localStorage.setItem(loginName + '-user-detail', JSON.stringify(data.data.user_payload.user_detail));
    window.localStorage.setItem(loginName + '-user-role', JSON.stringify(data.data.roles));
    const roleNames = Object.keys(data.data.roles);
    window.localStorage.setItem(loginName + '-element-list', fetchPermissionList(data.data.roles[roleNames[0]]));

  };


  function getUserToken() {

    return window.localStorage.getItem(window.localStorage.getItem("login-name") + "-auth-token");

  }


  let initApplicationSettings = function () {

    let req = {
      requestMethod: "GET",
      url: env.ApplicationApi + '/clientConfig/getDefaultConfiguration/' + env.ApplicationVersion + '/application_settings',
      headers: [{
        "header": "calling_entity",
        "value": "UI"
      }, {
        "header": "token",
        "value": "solitaire"
      }]
    };

    makeAjaxCall(req, function (err, res) {

      if (err) {

        console.error("Failed to initialise application settings.");
        console.error(err);

      } else {

        window.localStorage.setItem('srk-application-setting', JSON.stringify(res.data.config_values));

      }

    });

  };


  function resendOTP(evt, otpType) {

    let userDetail = JSON.parse(window.localStorage.getItem(window.localStorage.getItem("login-name") + "-user-detail"));

    let requestData = {
      'receiverList': {
        'phoneNumber': userDetail.contact,
        'email': userDetail.email
      },
      'sendSMSOTP': otpType === "mobile",
      'sendEmailOTP': otpType === "email",
      'token': getUserToken()
    };

    let req = {
      requestMethod: "POST",
      url: env.NotificationApi + '/notification/SMS/sendOTPSMSandMail/' + env.NotificationVersion,
      data: JSON.stringify(requestData),
      headers: [{
        "header": "calling_entity",
        "value": "UI"
      }, {
        "header": "token",
        "value": getUserToken()
      }]
    };

    makeAjaxCall(req, function (err, res) {

      if (err) {

        displayError(err.message, "errorVerifyOTPMessageOnHomepage");

      } else {

        displayError(res[0].message, "errorVerifyOTPMessageOnHomepage", "#009900");

      }

    });

  }


  function verifyOTP() {

    let otp = parseInt(document.getElementById("otp-input").value);
    let token = getUserToken();

    if (otp && token) {

      let requestData = JSON.stringify({
        otp: otp,
        token: getUserToken()
      });

      let req = {
        requestMethod: "POST",
        url: env.NotificationApi + '/notification/SMS/verifyOTP/' + env.NotificationVersion,
        data: requestData,
        headers: [{
          "header": "calling_entity",
          "value": "UI"
        }, {
          "header": "token",
          "value": getUserToken()
        }]
      };

      makeAjaxCall(req, function (err, res) {

        if (err) {

          console.error("Failed when trying to verify OTP.");
          console.error(err);
          displayError(err.message, "errorVerifyOTPMessageOnHomepage");

        } else {

          if (res.error_status === false) {

            window.location.href = "/web/dashboard";

          } else {


            displayError(res.message, "errorVerifyOTPMessageOnHomepage", "#009900");

          }

        }

      });

    } else {

      displayError("Please enter a valid OTP", "errorVerifyOTPMessageOnHomepage", null);

    }

  }


  function promptForOTP() {

    // TODO Display the OTP Screen here.
    document.getElementById("login-section").style.display = "none";

    document.getElementById("registration-container").style.display = "none";

    document.getElementById("verify-otp-section").style.display = "block";

  }


  let submitForm = function (event) {

    event.preventDefault();

    if (countryDetailsFetched && environmentDetailsFetched) {

      let username = document.getElementById("username").value;
      let password = document.getElementById("password").value;

      document.getElementById("loginSubmitButton").classList.add("ui-state-disabled");
      document.getElementById("loginFormLoading").style.display = "block";

      let requestData = JSON.stringify({
        'login_name': username.trim(),
        'password': password,
        'app_name': 'solitaire',
        'org_name': 'srkexports',
        'app_code': 13,
        device_details: deviceDetails
      });


      let req = {
        requestMethod: "POST",
        url: env.AuthenticationApi + "/auth/login/" + env.AuthenticationVersion,
        data: requestData,
        isLogin: true,
        parseResponse: false,
        headers: [{
          "header": "calling_entity",
          "value": "UI"
        }, {
          "header": "token",
          "value": "solitaire"
        }]
      };

      makeAjaxCall(req, function (err, res) {

        if (err) {

          console.error("Auth Failed");
          console.error(err);

          document.getElementById("loginFormLoading").style.display = "block";

          document.getElementById("errorLoginMessageOnHomepage").style = err.message || "Some technical problem occurred. please try again in a few moments.";
          document.getElementById("errorLoginMessageOnHomepage").style.display = "block";

          setTimeout(function () {

            document.getElementById("errorLoginMessageOnHomepage").style = "";
            document.getElementById("errorLoginMessageOnHomepage").style.display = "none";


          }, 3000)

        } else {

          document.getElementById("loginFormLoading").style.display = "none";

          let result = JSON.parse(res.response);

          if (!result.error_status) {

            let token = res.getResponseHeader("token");
            setAuthData(result, token);

            if (result.data && result.data.enable_otp === true) {

              promptForOTP(result);

            } else {

              window.location.href = "/web/dashboard";

            }

          } else {

            document.getElementById("loginFormLoading").style.display = "none";
            displayError(result.message, "errorLoginMessageOnHomepage", null);

          }

        }

      });

    } else {

      console.info("Please wait for the form to initialise.")

    }

  };


  function submitForgotPassword(evt) {

    const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const email = document.getElementById("emailid").value;

    if (email.match(regex)) {

      let forgotJson = JSON.stringify({
        email_id: email,
        org_name: "srkexports",
        app_name: "solitaire",
        app_code: 13,
        device_details: deviceDetails
      });

      let req = {
        requestMethod: "POST",
        url: env.AuthenticationApi + '/auth/forgot/password/' + env.AuthenticationVersion,
        data: forgotJson,
        headers: [{
          "header": "Accept",
          "value": "application/json"
        }, {
          "header": "calling_entity",
          "value": "UI"
        }]
      };

      makeAjaxCall(req, function (err, res) {

        if (err) {

          displayError(err.message, "errorForgotMessageOnHomepage", null);

        } else {

          displayError(res.message, "errorForgotMessageOnHomepage", "#009900");

          if (!res.error_status) {

            setTimeout(function () {

              showLogin(null);

            }, 3100)

          }

        }

      });


    } else {

      document.getElementById("errorForgotMessageOnHomepage").innerText = "Please Enter a valid email value.";
      document.getElementById("errorForgotMessageOnHomepage").style.display = "block";
      setTimeout(function () {

        document.getElementById("errorForgotMessageOnHomepage").innerText = "";
        document.getElementById("errorForgotMessageOnHomepage").style.display = "none";

      }, 3000);

    }

  }


  function showForgotPassword(evt) {

    document.getElementById("login-section").style.display = "none";
    document.getElementById("forgot-password-section").style.display = "block";

    document.getElementById("login-container").style.display = "flex";
    document.getElementById("registration-container").style.display = "none";

  }

  function showLogin(evt) {

    document.getElementById("forgot-password-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("verify-otp-section").style.display = "none";

    document.getElementById("registration-container").style.display = "none";
    document.getElementById("login-container").style.display = "flex";

  }


  function showRegistration() {

    document.getElementById("login-container").style.display = "none";
    document.getElementById("registration-container").style.display = "block";

  }


  /*function handleRegistrationFormSubmit(evt) {

    let form = document.getElementById("registration-form");
    let formData = new FormData(form);
    let JSONData = {};

    for(let pair of formData.entries()) {
      JSONData[pair[0]] = pair[1];
    }
    JSONData['registration-image'] = null;

    JSONData.country = JSONData.country && !isNaN(JSONData.country) ? parseInt(JSONData.country) : "";
    JSONData.state = JSONData.state && !isNaN(JSONData.state) ? parseInt(JSONData.state): "";
    JSONData.city = JSONData.city && !isNaN(JSONData.city) ? parseInt(JSONData.city): "";

    JSONData.third_party_country = JSONData.third_party_country && !isNaN(JSONData.third_party_country) ? parseInt(JSONData.third_party_country): "";
    JSONData.third_party_state = JSONData.third_party_state && !isNaN(JSONData.third_party_state) ? parseInt(JSONData.third_party_state): "";
    JSONData.third_party_city = JSONData.third_party_city && !isNaN(JSONData.third_party_city) ? parseInt(JSONData.third_party_city): "";

    JSONData.agree = JSONData.agree ? 1 : 0;
    JSONData.recieve_notification = JSONData.recieve_notification ? 1 : 0;

    let req = {
      requestMethod: "POST",
      url: env.AuthenticationApi + '/auth/registration/' + env.AuthenticationVersion,
      data: JSON.stringify(JSONData),
      headers: [{
        "header": "calling_entity",
        "value": "UI"
      }, {
        "header": "token",
        "value": "solitaire"
      }]
    };

    makeAjaxCall(req, function (err, res) {

      if (err) {

        console.error("Failed in the registration process ");
        console.error(err);

      } else {

        console.log("Well registration has worked so here the response ");
        console.log(res);

        let uploadFileRequest = new XMLHttpRequest();

        uploadFileRequest.open("POST", env.AuthenticationApi + '/auth/ftp/file/upload/uploadFile/' + env.AuthenticationVersion, true);

        uploadFileRequest.setRequestHeader('enctype', 'multipart/form-data');
        uploadFileRequest.setRequestHeader('Accept', 'application/json');
        uploadFileRequest.setRequestHeader('calling_entity', 'UI');
        uploadFileRequest.setRequestHeader('token', getUserToken());

        uploadFileRequest.send(document.getElementById("registration-document").files[0]);

        uploadFileRequest.onreadystatechange = function () {

          if (uploadFileRequest.readyState === 4) {

            if (uploadFileRequest.status === 200) {

              console.log("Document proof uploaded successfully");

            } else {

              console.log("Failed to upload document proof");

            }

          }

        }

      }

    });

  }*/

  function getCountries() {

    let req = {
      requestMethod: "GET",
      url: env.DashboardApi + '/dashboard/country/details/' + env.DashboardVersion,
    };

    makeAjaxCall(req, function (err, res) {

      if (err) {

        console.log("Failed to get a list of cities");
        console.error(err);

      } else {

        if (res.error_status && res.error_status === false) {

          document.getElementById("company-country-select").options.length = 0;

          for (let i = 0; i < res.data.length; i++) {

            document.getElementById("company-country-select").options[i] = new Option(res.data[i].country_name, res.data[i].country_code);

          }

        }

      }

    })

  }

  function getStates(country_code) {

    let req = {
      requestMethod: "GET",
      url: env.DashboardApi + '/dashboard/country/details/' + env.DashboardVersion + '?country_code=' + country_code
    };

    makeAjaxCall(req, function (err, res) {

      if (err) {

        console.log("Failed to get States for a specific country");
        console.error(err);

      } else {

        console.log("The states for this city are ");
        console.log(res);

        if (res.error_status === false) {

          document.getElementById("company-state-select").options.length = 0;

          for (let i = 0; i < res.data.length; i++) {

            document.getElementById("company-state-select").options[i] = new Option(res.data[i].region_name, res.data[i].region_code);

          }


        }


      }

    })

  }


  function getCities(country_code, state_code) {

    let req = {
      requestMethod: "GET",
      url: env.DashboardApi + '/dashboard/country/details/' + env.DashboardVersion + '?country_code=' + country_code + '&region_code=' + state_code
    };

    makeAjaxCall(req, function (err, res) {

      if (err) {

        console.log("Failed to fetch list of cities");
        console.error(err);

      } else {

        console.log("Get ciries ka response hai ");
        console.log(res);

        if (res.error_status === false) {


          document.getElementById("company-city-select").options.length = 0;

          for (let i = 0; i < res.data.length; i++) {

            document.getElementById("company-city-select").options[i] = new Option(res.data[i].city_name, res.data[i].city_code);

          }


        }

      }

    })

  }

  // Hide the html homepage when the path is not home.
  function hideShowApp() {

    let path = window.location.pathname;

    document.getElementById("htmlHomepage").style.display = path !== "/" ? "none" : "block";
    document.getElementById("loading-splash").style.display = path === "/" ? "none" : "block";

    if (path !== "/") {

      document.getElementById('login-page-stylesheet').remove();

    }

  }

  function activateLoginButton(usernameFilled, passwordFilled) {

    if (usernameFilled && passwordFilled) {

      document.getElementById("loginSubmitButton").removeAttribute("disabled");
      document.getElementById("loginSubmitButton").classList.remove("ui-state-disabled");

    } else {

      document.getElementById("loginSubmitButton").setAttribute("disabled", "true");
      document.getElementById("loginSubmitButton").classList.add("ui-state-disabled");

    }

  }

  /*
  END Declarations and begin the actual code.
  */

  // Hide the app on the homepage since its just an empty element at this point.
  hideShowApp();

  // Set language in localStorage.
  initLanguage();

  // Initialise the environment for the app
  initEnvironment(function (err, environment) {

    if (err) {

      console.error("Failed to initialise environment.");
      console.error(err);

    } else {

      env = environment;
      environmentDetailsFetched = true;
      initApplicationSettings();
      getCountries();
      initAuditSettings();

    }

  });

  // Fetch IP AADDRESS
  function fetchIpAddress() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", env.IpAddressAPI + "/smartapp/smartapp.asmx/GetIPAddress", true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const json = JSON.parse(xhr.responseText);
          deviceDetails['ip'] = json.Result;
        }
      }
    };
    xhr.onerror = function (e) {
      // console.error(xhr.statusText);
    };
    xhr.send(null);
  }


  // Get country details needed for device details.
  fetchCountryDetails(function (err, countryDetails) {
    fetchIpAddress();
    let f = new Function("country_callback", countryDetails);

    if (err) {

      console.error("Failed to fetch Country Details.");
      console.error(err);

    } else {

      f(function (json) {
        deviceDetails.country_code = json.country_code;


        countryDetailsFetched = true;

        let temp_timer = setInterval(function () {

          if (auditDetailsFetched && countryDetailsFetched) {

            console.log("Running");
            makeAuditActivityCall('index');
            clearInterval(temp_timer)

          }


        }, 200);

      });

    }

  });

  if (document.getElementById('loginForm')) {

    let usernameFilled = false;
    let passwordFilled = false;

    document.getElementById('loginForm').addEventListener("submit", function (event) {

      makeAuditActionCall("LOGIN");
      submitForm(event);

    }, false);

    let events = ["keyup", "blur", "change"];

    for (let i = 0; i < events.length; i++) {

      document.getElementById('username').addEventListener(events[i], function (event) {

        if (event.target.value === "") {

          displayError("Please enter username", "errorUserNameOnHomepage", null);
          usernameFilled = false;

        } else {

          usernameFilled = true;

        }

        activateLoginButton(usernameFilled, passwordFilled);

      }, false);

      document.getElementById('password').addEventListener(events[i], function (event) {

        if (event.target.value === "") {

          displayError("Please enter password", "errorPasswordOnHomepage", null);
          passwordFilled = false;

        } else {

          passwordFilled = true;

        }

        activateLoginButton(usernameFilled, passwordFilled);

      }, false);

    }

  }

  if (document.getElementById("forgot_password_link")) {

    document.getElementById("forgot_password_link").addEventListener("click", function (event) {

      showForgotPassword(event);

    }, false);

  }

  if (document.getElementById("forgotPasswordButton")) {

    document.getElementById("forgotPasswordButton").addEventListener("click", function (event) {

      makeAuditActionCall("FORGOT PASSWORD");
      submitForgotPassword(event);

    }, false);

    document.getElementById("emailid").addEventListener("keyup", function (event) {

      const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

      if (event.target.value.match(regex)) {

        document.getElementById("forgotPasswordButton").removeAttribute("disabled");
        document.getElementById("forgotPasswordButton").classList.remove("ui-state-disabled");

      } else {

        document.getElementById("forgotPasswordButton").classList.add("ui-state-disabled");
        document.getElementById("forgotPasswordButton").setAttribute("disabled", "true");

      }

    }, false);

  }

  let closeButtons = document.getElementsByClassName("closeButton");

  for (let i = 0; i < closeButtons.length; i++) {

    closeButtons[i].addEventListener("click", function (event) {

      showLogin(event);

    });

  }

  document.getElementById("registration-form").addEventListener("submit", function (event) {

    event.preventDefault();
    // handleRegistrationFormSubmit(event);

  }, false);


  document.getElementById("company-country-select").addEventListener("change", function (event) {

    getStates(document.getElementById("company-country-select").value);

  }, false);

  document.getElementById("company-state-select").addEventListener("change", function (event) {

    getCities(document.getElementById("company-country-select").value, document.getElementById("company-state-select").value);

  }, false);


  document.getElementById("verifyOTPButton").addEventListener("click", function (event) {

    verifyOTP(event);

  });

  document.getElementById("resendMobileButtonOnHomePage").addEventListener("click", function (event) {

    resendOTP(event, "mobile");

  });

  document.getElementById("resendEmailButtonOnHomePage").addEventListener("click", function (event) {

    resendOTP(event, "email");

  });

  timer = setInterval(function () {

    console.log(document.getElementById("username").value);

    if (document.getElementById("username").value === "") {

      activateLoginButton(false, false);

    } else {

      activateLoginButton(true, true);
      clearInterval(timer);

    }


  }, 500)


})();
