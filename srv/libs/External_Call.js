const axios = require('axios');
const vcap_app = process.env.VCAP_APPLICATION;
class External_Call {

  constructor() { };

  static async JOB_FEED(req, res, newBaseUrl, client_id, client_secret, TokenUrl) {
    var log_data = {
      SERVICE_ID: '10',
      OPERATION: req.event,
      TIMESTAMP: new Date().toISOString()
    }

    var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))

    var total = data.filter(i => {
      return i.SERVICE_NAME == 'Job Feed' && i.PARAMETER_NAME == 'READ'
    })

    const token = await this.generateBearerToken(client_id, client_secret, TokenUrl);
    const aOD = await this.getDataFromService(token, newBaseUrl);


    if (total[0].VALUE_ID == 'N') {
      log_data['DATA'] = 'Un Authorized'
      log_data['STATUS'] = "401"
      log_data['MESSAGE'] = "Request Rejected";
      await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      req.reject(401, 'Not Applicable');

    } else {
      log_data['DATA'] = req.method
      log_data['STATUS'] = "201"
      log_data['MESSAGE'] = "Get method";
      await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      return aOD

    }

  }

  static async CREATE_JOB(req, res, newBaseUrl, client_id, client_secret, TokenUrl, Job_Feed_Name, capservsb_url) {
    var log_data = {
      SERVICE_ID: '10',
      OPERATION: req.event,
      TIMESTAMP: new Date().toISOString()

    }
    var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))

    var total = data.filter(i => {
      return i.SERVICE_NAME == 'Job Feed' && i.PARAMETER_NAME == 'CREATE'
    })
    const token = await this.generateBearerToken(client_id, client_secret, TokenUrl);

    // const response = await this.createObj(token, newBaseUrl);
    // return response

    if (total[0].VALUE_ID == 'N') {
      log_data['DATA'] = 'Un Authorized'
      log_data['STATUS'] = "401"
      log_data['MESSAGE'] = "Request Rejected";
      // var gete_res = await service.tx(req).post("interface_log_table", log_data)
      await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      req.reject(401, 'Not Applicable');

    } else {
      log_data['DATA'] = JSON.stringify(req.data);
      log_data['STATUS'] = "201"
      const response = await this.createObj(token, newBaseUrl);
      log_data['MESSAGE'] = JSON.stringify(response);
      await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      await this.CreateConfigStatus(Job_Feed_Name, capservsb_url)
      return response
    }

  }

  static async JobFeedData(req, res, newBaseUrl, client_id, client_secret, TokenUrl) {
    var log_data = {
      SERVICE_ID: '10',
      OPERATION: req.event,
      TIMESTAMP: new Date().toISOString()
    }
    log_data['STATUS'] = "201";
    log_data['DATA'] = 'Un Authorized';
    await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))

    const token = await this.generateBearerToken(client_id, client_secret, TokenUrl);
    const aOD = await this.CallgetJobFeedinfo(token, newBaseUrl);

    return aOD

  }
  static async generateBearerToken(client_id, client_secret, TokenUrl) {
    const params = new URLSearchParams();

    params.append('grant_type', 'client_credentials');

    params.append('client_id', client_id);

    params.append('client_secret', client_secret);

    const response = await axios.post(TokenUrl, params);

    return response.data.access_token;
  }

  static async getDataFromService(token, newBaseUrl) {

    const response = await axios.get(newBaseUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.d;
  }

  static async createObj(token, newBaseUrl) {

    const response = await axios.get(newBaseUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.d;

  }

  static async CallgetJobFeedinfo(token, newBaseUrl) {
    const response = await axios.get(newBaseUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.d;
  }

  static async CreateConfigStatus(Job_Feed_Name, capservsb_url) {

    let getVaildation = await this.CheckConfigreReqVaild(Job_Feed_Name, capservsb_url)

    if (!getVaildation) {

      let Config_Job_Obj = {
        JOb_NAME: Job_Feed_Name,
        REQ_TYPE: "CREATE",
        Time: new Date().toISOString(),
        STATUS: "pending"
      }
      axios.post(capservsb_url, Config_Job_Obj, {
        auth: {
          username: 'vcpsteelcase',
          password: 'sbpcorp'
        }
      })

        .then(response => {
          console.log('Response:', response.data);
        })
        .catch(error => {
          console.error('Error:', error);
        });

    } 

  }

  static async CheckConfigreReqVaild(Job_Feed_Name, capservsb_url) {
    const response = await axios.get(capservsb_url, {
      auth: {
        username: 'vcpsteelcase',
        password: 'sbpcorp'
      }
    });
    let filtered_vaildation = response.data.value.filter(i => {
      return i.JOb_NAME == Job_Feed_Name && i.REQ_TYPE == 'CREATE' && i.STATUS == 'pending'
    })

    let state = (filtered_vaildation.length > 0) ? true : false;
    return state

  }

  static async service_call(req, res, entitySet, servname, targetEntity, id) {
    var log_data = {
      SERVICE_ID: id,
      OPERATION: req.event,
      TIMESTAMP: new Date().toISOString()
    }
    var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))
    var total = data.filter(i => {
      return i.SERVICE_NAME == servname && i.PARAMETER_NAME == req.event
    })

    if (req.event == 'CREATE') {
      if (total[0].VALUE_ID == 'AU') {
        var req_re = await service.tx(req).post(entitySet, req.data)
        log_data['DATA'] = JSON.stringify([req_re])
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = req.method;
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
        return "reject";

      }
      if (total[0].VALUE_ID == 'M') {
        log_data['DATA'] = JSON.stringify([req.data])
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = req.method
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      }
      if (total[0].VALUE_ID == 'N') {
        log_data['DATA'] = req.method
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = "Get method"
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
        return "reject";
      }
    }
    if (req.event == 'READ') {
      if (total[0].VALUE_ID == 'N') {
        log_data['DATA'] = req.method
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = "Get method";
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
        req.reject(401, 'Processed');
      }
      if (total[0].VALUE_ID == 'A') {
        log_data['DATA'] = JSON.stringify([req.req.query])
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = req.method
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      }
    }
    if (req.event == 'UPDATE') {
      if (total[0].VALUE_ID == 'AU') {
        var req_re = await service.tx(req).put(targetEntity, req.data)
        log_data['DATA'] = JSON.stringify([req_re])
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = req.method
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
        return "reject";
      }
      if (total[0].VALUE_ID == 'M') {
        log_data['DATA'] = JSON.stringify([req.data])
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = req.method
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      }
      if (total[0].VALUE_ID == 'N') {
        log_data['DATA'] = req.method
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = "Get method"
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
        return "reject";
      }
    }
    if (req.event == 'DELETE') {

      if (total[0].VALUE_ID == 'AU') {
        var req_re = await service.tx(req).delete(targetEntity)
        log_data['DATA'] = JSON.stringify([targetEntity])
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = req.method
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
        return "reject";
      }
      if (total[0].VALUE_ID == 'M') {
        log_data['DATA'] = JSON.stringify([req.data])
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = req.method
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
      }
      if (total[0].VALUE_ID == 'N') {
        log_data['DATA'] = req.method
        log_data['STATUS'] = "201"
        log_data['MESSAGE'] = "Get method"
        await cds.run(INSERT.into("APP_DB_INTERFACE_LOG_TABLE").entries(log_data))
        return "reject";
      }
    }


  }
}
module.exports = External_Call;