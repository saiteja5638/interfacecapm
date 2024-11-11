var cds = require('@sap/cds');
const xsenv = require('@sap/xsenv');
const axios = require('axios');

const vcap_app = process.env.VCAP_APPLICATION;

var Ext_Process = require('./libs/External_Call')

module.exports = async srv => {

    srv.on('getJobFeedLog', async (req, res) => {
        try {
            await cds.run(`DELETE FROM APP_DB_CONFIG_JOB_STATUS WHERE STATUS != 'pending'`);

            let Job_Name = req.data.jobName;

            function getBaseUrl() {
                var tag = new RegExp('"application_uris"(.*)');
                var uri = vcap_app.match(tag);
                if (uri) {
                    var tag1 = new RegExp('"(.*)');
                    uri = uri[1].match(tag1);
                    let application_uris = "";
                    for (let index = 0; index < uri[1].length; index++) {
                        if (uri[1][index] != '"') {
                            application_uris = application_uris + uri[1][index];
                        }
                        else {
                            index = uri[1].length;
                        }
                    }

                    return application_uris;

                }

            }

            let user_provided_credentials = JSON.parse(process.env.config_products)

            let baseUrl = "https://" + getBaseUrl() + `/v2/jobs/getJobFeedLog?jobName=${Job_Name}`
            let newBaseUrl = baseUrl.replace('capservsb', 'config-products');
            let client_id = user_provided_credentials.clientid;
            let client_secret = user_provided_credentials.clientsecret;
            let TokenUrl = user_provided_credentials.url + "/oauth/token";

            let get_data = await cds.run(`select * from APP_DB_CONFIG_JOB_STATUS where STATUS ='pending' AND JOB_NAME = '${Job_Name}' AND REQ_TYPE = 'READ'`)

            if (get_data.length > 0) {

                const diffInMilliseconds = new Date() - new Date(get_data[0].TIME);

                const diffInMinutes = diffInMilliseconds / (1000 * 60);

                if (Math.floor(diffInMinutes) >= 5) {

                    await cds.run(`delete  from  "APP_DB_CONFIG_JOB_STATUS" where JOB_NAME = '${Job_Name}'`)

                    let return_response = await Ext_Process.JOB_FEED(req, res, newBaseUrl, client_id, client_secret, TokenUrl)

                    let Config_Job_Obj = {
                        JOb_NAME: Job_Name,
                        REQ_TYPE:"READ",
                        Time: new Date().toISOString(),
                        STATUS: "pending"
                    }
                    let create_job_feed = await cds.run(INSERT.into("APP_DB_CONFIG_JOB_STATUS").entries(Config_Job_Obj))

                    return return_response

                } else {
                    var obj ={
                        Type: "WARNING",
                        Description: "Cannot Process,job execution is already in progress for Job Feed: " + Job_Name,
                        statusCode: 199
                      }
                    req.reply(obj)
                }

            } else {
                let return_response = await Ext_Process.JOB_FEED(req, res, newBaseUrl, client_id, client_secret, TokenUrl)
                let Config_Job_Obj = {
                    JOb_NAME: Job_Name,
                    REQ_TYPE:"READ",
                    Time: new Date().toISOString(),
                    STATUS: "pending"
                }
                let create_job_feed = await cds.run(INSERT.into("APP_DB_CONFIG_JOB_STATUS").entries(Config_Job_Obj))
                return return_response
            }

        } catch (error) {
            console.log(error)
        }
    })

    srv.on('getJobFeedData',async(req,res)=>{
        try {
            function getBaseUrl() {
                var tag = new RegExp('"application_uris"(.*)');
                var uri = vcap_app.match(tag);
                if (uri) {
                    var tag1 = new RegExp('"(.*)');
                    uri = uri[1].match(tag1);
                    let application_uris = "";
                    for (let index = 0; index < uri[1].length; index++) {
                        if (uri[1][index] != '"') {
                            application_uris = application_uris + uri[1][index];
                        }
                        else {
                            index = uri[1].length;
                        }
                    }

                    return application_uris;

                }

            }

            let user_provided_credentials = JSON.parse(process.env.config_products)

            let baseUrl = "https://" + getBaseUrl() + `/v2/jobs/getJobFeedData`
            let newBaseUrl = baseUrl.replace('capservsb', 'config-products');
            let client_id = user_provided_credentials.clientid;
            let client_secret = user_provided_credentials.clientsecret;
            let TokenUrl = user_provided_credentials.url + "/oauth/token";

            let return_response = await Ext_Process.JobFeedData(req, res, newBaseUrl, client_id, client_secret, TokenUrl)

            return return_response

            
            
        } catch (error) {
            console.log(error)
        }
    })

    srv.on('createJobFeed', async (req, res) => {
        try {
            await cds.run(`DELETE FROM APP_DB_CONFIG_JOB_STATUS WHERE STATUS != 'pending'`);
            let Job_Feed_Name = req.data.jobFeedName;
            let USER_NAME = (req.data.userName.trim() == "") ? 'External User' : req.data.userName;

            function getBaseUrl() {
                var tag = new RegExp('"application_uris"(.*)');
                var uri = vcap_app.match(tag);
                if (uri) {
                    var tag1 = new RegExp('"(.*)');
                    uri = uri[1].match(tag1);
                    let application_uris = "";
                    for (let index = 0; index < uri[1].length; index++) {
                        if (uri[1][index] != '"') {
                            application_uris = application_uris + uri[1][index];
                        }
                        else {
                            index = uri[1].length;
                        }
                    }

                    return application_uris;

                }

            }
            let user_provided_credentials = JSON.parse(process.env.config_products)

            let baseUrl = "https://" + getBaseUrl() + `/v2/jobs/createJobFeed?jobFeedName=${Job_Feed_Name}&userName=${USER_NAME}`;
            let newBaseUrl = baseUrl.replace('capservsb', 'config-products');
            let capservsb_url = "https://" + getBaseUrl() +'/catalog/Config_Job_Status';
            let client_id = user_provided_credentials.clientid;
            let client_secret = user_provided_credentials.clientsecret;
            let TokenUrl = user_provided_credentials.url + "/oauth/token";
            let return_response = await Ext_Process.CREATE_JOB(req, res, newBaseUrl, client_id, client_secret, TokenUrl, Job_Feed_Name,capservsb_url)


            return new Promise((resolve, reject) => {
                try {

                    let intial_time  = 0;
                    let hit_time = 10000;
        
                    let data = async ()=>{
        
                        let get_jobstatu =  await cds.run(`select * from APP_DB_CONFIG_JOB_STATUS where JOB_NAME = '${Job_Feed_Name}' and REQ_TYPE ='CREATE' and  STATUS ='pending'`)
        

                        if (intial_time > 600000) {
                            await cds.run(`DELETE FROM APP_DB_CONFIG_JOB_STATUS WHERE STATUS != 'pending'`);

                            let obj = {
                                Type: "PENDING",
                                Description: "Processing  with job Name: " + Job_Feed_Name,
                                statusCode: 202
                         
                        }
                            
                            resolve(obj)
                            
                        }
        
                        if (get_jobstatu.length==0) {
                            await cds.run(`DELETE FROM APP_DB_CONFIG_JOB_STATUS WHERE STATUS != 'pending'`);
                            let obj = {
                                Type: "ACCEPTED",
                                Description: "Started Processing  with job Name: " + Job_Feed_Name,
                                statusCode: 202
                         
                        }

                            resolve(obj)
                        }
                        else {
                            intial_time = intial_time + hit_time;
                            setTimeout(data,hit_time)
                        }
                    
   
        
                    }
                    setTimeout(data,hit_time)
                    
                } catch (error) {
                    return {
                        jobName: Job_Feed_Name,
                        status: "Error starting the job",
                        error: error.message
                    };
                }
            })






            
            // let get_data = await cds.run(`select * from APP_DB_CONFIG_JOB_STATUS where STATUS ='pending' AND JOB_NAME = '${Job_Feed_Name}' AND REQ_TYPE = 'CREATE'`)

            // if (get_data.length > 0) {

            //     const diffInMilliseconds = new Date() - new Date(get_data[0].TIME);

            //     const diffInMinutes = diffInMilliseconds / (1000 * 60);

            //     if (Math.floor(diffInMinutes) >= 10) {

            //         await cds.run(`delete  from  "APP_DB_CONFIG_JOB_STATUS" where JOB_NAME = '${Job_Feed_Name}'`)

            //         let return_response = await Ext_Process.CREATE_JOB(req, res, newBaseUrl, client_id, client_secret, TokenUrl, Job_Feed_Name)

            //         let Config_Job_Obj = {
            //             JOb_NAME: Job_Feed_Name,
            //             REQ_TYPE:"CREATE",
            //             Time: new Date().toISOString(),
            //             STATUS: "pending"
            //         }
            //         let create_job_feed = await cds.run(INSERT.into("APP_DB_CONFIG_JOB_STATUS").entries(Config_Job_Obj))

            //         return return_response

            //     } else {

            //         var obj ={
            //             Type: "WARNING",
            //             Description: "Cannot Process,job execution is already in progress for Job Feed: " + Job_Feed_Name,
            //             statusCode: 199
            //           }
            //         req.reply(obj)
            //     }

            // } else {
            //     let return_response = await Ext_Process.CREATE_JOB(req, res, newBaseUrl, client_id, client_secret, TokenUrl, Job_Feed_Name)
            //     let Config_Job_Obj = {
            //         JOb_NAME: Job_Feed_Name,
            //         REQ_TYPE:"CREATE",
            //         Time: new Date().toISOString(),
            //         STATUS: "pending"
            //     }
            //     let create_job_feed = await cds.run(INSERT.into("APP_DB_CONFIG_JOB_STATUS").entries(Config_Job_Obj))
            //     return return_response
            // }

        } catch (error) {
            console.log(error)
        }
    })
    srv.before(['READ',], '*', async (req, res) => {
        await cds.run(`DELETE FROM APP_DB_CONFIG_JOB_STATUS WHERE STATUS != 'pending'`);
        const tx = cds.transaction(req);
        try {
            let a = await tx.run(`select COUNT(*) AS "SERVICE_ID" from "APP_DB_INTERFACE_LOG_TABLE"`);
            let length = a[0].SERVICE_ID

            if (length > 40000) {
                await tx.run(`DELETE FROM "APP_DB_INTERFACE_LOG_TABLE"`);
            }

        } catch (error) {
            console.log(error)
        }
    })

    // location interface
    srv.before(['READ', 'UPDATE', 'DELETE', 'CREATE'], 'LOCATION_STB', async (req, res) => {
        try {
            const entitySet = 'LOCATION';
            const servname = 'LOCATION_INTERFACE';
            const targetEntity = `/${entitySet}/${req.data.LOCATION_ID}`;
            const id = 1;
            let get_result = await Ext_Process.service_call(req, res, entitySet, servname, targetEntity, id);
            if (get_result == 'reject') {
                req.reject(401, "Object Created")
            }
        } catch (error) {
            console.log(error)
        }
    })
    //customer_interface_call
    srv.before(['READ', 'CREATE', 'UPDATE', 'DELETE'], 'customer_group', async (req, res) => {
        try {
            const entitySet = 'CUSTOMERS';
            const servname = 'CUSTOMER_INTERFACE';
            const id = 2;
            const targetEntity = `/${entitySet}/${req.data.CUSTOMER_GROUP}`;
            let get_result = await Ext_Process.service_call(req, res, entitySet, servname, targetEntity, id);
            if (get_result == 'reject') {
                req.reject(401, "Object Created")
            }

        } catch (error) {
            console.log(error)
        }
    });
    // maintain mrp interface
    srv.before(['READ', 'CREATE', 'UPDATE', 'DELETE'], 'MAINT_MRP_STB', async (req, res) => {
        try {
            const entitySet = 'MAINT_MRP';
            const servname = 'MAINTAIN MRP';
            const id = 4;
            const targetEntity = `/${entitySet}/${req.data.LOCATION_ID}/${req.data.MRP_GROUP}`;
            let get_result = await Ext_Process.service_call(req, res, entitySet, servname, targetEntity, id);
            if (get_result == 'reject') {
                req.reject(401, "Object Created")
            }
        } catch (error) {
            console.log(error)
        }
    });
    // dervied characteristics 
    srv.before(['READ', 'CREATE', 'UPDATE', 'DELETE'], 'DERIVECHAR_STB', async (req, res) => {
        try {
            const entitySet = 'DERIVECHAR';
            const servname = 'DERIVED CHARACTERISTICS INTERFACE';
            const id = 8;
            const targetEntity = `/${entitySet}/${req.data.PRODUCT_ID}/${req.data.RECORD_TYPE}/${req.data.CLAUSE}/${req.data.DEP_NAME}/${req.data.CHAR_NUM}/${req.data.CHARVAL_NUM}/${req.data.SORT_COUNTER}/${req.data.CHAR_COUNTER}/${req.data.INT_CLS_NUMBER}`;
            let get_result = await Ext_Process.service_call(req, res, entitySet, servname, targetEntity, id);
            if (get_result == 'reject') {
                req.reject(401, "Object Created")
            }
        } catch (error) {
            console.log(error)
        }
    });

    // SALES ORDER INTERFACE
    srv.before(['READ', 'CREATE', 'UPDATE', 'DELETE'], 'SALES_STB', async (req, res) => {
        try {
            const entitySet = 'SALES';
            const servname = 'SALES ORDER INTERFACE';
            const id = 9;
            const targetEntity = `/${entitySet}/${req.data.SALES_DOCUMENT}/${req.data.SALES_DOCUMENT_ITEM}`;
            let get_result = await Ext_Process.service_call(req, res, entitySet, servname, targetEntity, id);
            if (get_result == 'reject') {
                req.reject(401, "Object Created")
            }
        } catch (error) {
            console.log(error)
        }
    });

    srv.before(['READ', 'CREATE', 'UPDATE', 'DELETE'], 'SALES_HIS_STB', async (req, res) => {
        try {
            const entitySet = 'SALES_HIS';
            const servname = 'SALES ORDER INTERFACE';
            const id = 9;
            const targetEntity = `/${entitySet}/${req.data.SALES_DOCUMENT}/${req.data.SALES_DOCUMENT_ITEM}/${req.data.CHARACTERSTIC}`;
            let get_result = await Ext_Process.service_call(req, res, entitySet, servname, targetEntity, id);
            if (get_result == 'reject') {
                req.reject(401, "Object Created")
            }

        } catch (error) {
            console.log(error)
        }
    });

    // external service calls 
    srv.on('VC_interface', async (req, res) => {
        if (req.data.FLAG === "C") {
            var Data = JSON.parse(req.data.Data)
            try {
                for (let index = 0; index < Data.length; index++) {
                    let element = Data[index];
                    if (element.auth_type == "NoAuth") {
                        await axios.get(element.path)
                            .then(response => {
                                if (!(response.data.value == undefined)) {
                                    var BTP_GetData = response.data.value;

                                    if (element.approval_type == "Automated") {
                                        BTP_GetData.forEach(async item => {
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(item))
                                        })
                                    }
                                    if (element.approval_type == "Manual") {
                                        BTP_GetData.forEach(async item => {
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(item))
                                        })
                                    }
                                }
                                if (!(response.data.d == undefined)) {
                                    var insrt_obj = {}
                                    var S4getData = response.data.d.results;
                                    if (element.approval_type == "Automated") {
                                        S4getData.forEach(async item => {
                                            insrt_obj['LOCATION_ID'] = item.Plant
                                            insrt_obj['LOCATION_DESC'] = item.PlantName
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(insrt_obj))
                                        })
                                    }
                                    if (element.approval_type == "Manual") {
                                        S4getData.forEach(async item => {
                                            insrt_obj['LOCATION_ID'] = item.Plant
                                            insrt_obj['LOCATION_DESC'] = item.PlantName
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(insrt_obj))
                                        })
                                    }
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });

                    }
                    if (element.auth_type == "Basic") {

                        await axios.get(element.path, {
                            auth: {
                                username: element.username,
                                password: element.password
                            }
                        })
                            .then(response => {
                                if (!(response.data.value == undefined)) {
                                    var BTP_GetData = response.data.value;

                                    if (element.approval_type == "Automated") {
                                        BTP_GetData.forEach(async item => {
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(item))
                                        })
                                    }
                                    if (element.approval_type == "Manual") {
                                        BTP_GetData.forEach(async item => {

                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(item))
                                        })
                                    }
                                }
                                if (!(response.data.d == undefined)) {

                                    var S4getData = response.data.d.results;
                                    if (element.approval_type == "Automated") {

                                        S4getData.forEach(async item => {
                                            var insrt_obj = {}
                                            insrt_obj['LOCATION_ID'] = item.Plant
                                            insrt_obj['LOCATION_DESC'] = item.PlantName
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(insrt_obj))

                                        })
                                    }
                                    if (element.approval_type == "Manual") {
                                        S4getData.forEach(async item => {
                                            var insrt_obj = {}
                                            insrt_obj['LOCATION_ID'] = item.Plant
                                            insrt_obj['LOCATION_DESC'] = item.PlantName
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(insrt_obj))

                                        })
                                    }
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                    }
                    if (element.auth_type == "oAuth2.0") {
                        const clientId = element.clientID;
                        const clientSecret1 = element.clientSecret;
                        const params = new URLSearchParams();

                        params.append('grant_type', 'client_credentials');

                        params.append('client_id', clientId);

                        params.append('client_secret', clientSecret1);

                        var tokenUrl1 = element.tokenUrl;

                        axios.post(tokenUrl1, params)
                            .then(response => {
                                const accessToken = response.data.access_token;
                                makeGetRequest(accessToken)
                            }).catch(error => {
                                console.error("Error obtaining access token:", error);
                            });
                        function makeGetRequest(accessToken) {
                            const odataUrl = element.path;
                            axios.get(odataUrl, {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            })
                                .then(response => {
                                    if (!(response.data.value == undefined)) {
                                        var BTP_GetData = response.data.value;

                                        if (element.approval_type == "Automated") {
                                            BTP_GetData.forEach(async item => {
                                                var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(item))
                                            })
                                        }
                                        if (element.approval_type == "Manual") {
                                            BTP_GetData.forEach(async item => {
                                                var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(item))
                                            })
                                        }
                                    }
                                    if (!(response.data.d == undefined)) {
                                        var S4getData = response.data.d.results;
                                        if (element.approval_type == "Automated") {
                                            S4getData.forEach(async item => {
                                                var insrt_obj = {}
                                                insrt_obj['LOCATION_ID'] = item.Plant
                                                insrt_obj['LOCATION_DESC'] = item.PlantName
                                                var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(insrt_obj))
                                            })
                                        }
                                        if (element.approval_type == "Manual") {
                                            S4getData.forEach(async item => {
                                                var insrt_obj = {}
                                                insrt_obj['LOCATION_ID'] = item.Plant
                                                insrt_obj['LOCATION_DESC'] = item.PlantName
                                                var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(insrt_obj))
                                            })
                                        }
                                    }
                                })
                                .catch(error => {
                                    console.error("Error making GET request:", error);
                                });
                        }
                    }
                    if (element.auth_type == "oAuth2.0 JWT") {
                        const odataUrl = element.path;
                        var tokenUrl1 = element.tokenUrl;
                        const axiosConfig = {
                            headers: {
                                'Authorization': `Bearer ${tokenUrl1}`
                            }
                        }
                        await axios.get(odataUrl, axiosConfig)
                            .then(response => {
                                if (!(response.data.value == undefined)) {
                                    var BTP_GetData = response.data.value;

                                    if (element.approval_type == "Automated") {
                                        BTP_GetData.forEach(async item => {
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(item))
                                        })
                                    }
                                    if (element.approval_type == "Manual") {
                                        BTP_GetData.forEach(async item => {
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(item))
                                        })
                                    }
                                }
                                if (!(response.data.d == undefined)) {
                                    var S4getData = response.data.d.results;
                                    if (element.approval_type == "Automated") {
                                        S4getData.forEach(async item => {
                                            var insrt_obj = {}
                                            insrt_obj['LOCATION_ID'] = item.Plant
                                            insrt_obj['LOCATION_DESC'] = item.PlantName
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION").entries(insrt_obj))
                                        })
                                    }
                                    if (element.approval_type == "Manual") {
                                        S4getData.forEach(async item => {
                                            var insrt_obj = {}
                                            insrt_obj['LOCATION_ID'] = item.Plant
                                            insrt_obj['LOCATION_DESC'] = item.PlantName
                                            var post_obj = await cds.run(INSERT.into("APP_DB_LOCATION_STB").entries(insrt_obj))
                                        })
                                    }
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching data:', error);
                            });
                    }
                }

            } catch (error) {
                return error
            }

        }
    })

    srv.before(['READ', 'CREATE', 'UPDATE', 'DELETE'], 'Data_S4', async (req, res) => {
        try {
            let req_data = req.data.DATA;
            let BTP_GetData = JSON.parse(req_data)

            for (let index = 0; index < BTP_GetData.length; index++) {
                const item = BTP_GetData[index];
                var post_obj = await cds.run(INSERT.into("APP_DB_SALES_HIS_STB2").entries(item))
            }

        } catch (error) {
            console.log(error)
        }
    })

    srv.on('process_dependency', async (req, res) => {
        try {
            return Ext_Process.customer_group(req, res)
        } catch (error) {
            console.log(error)
        }

    })
}

// async function generateBearerToken(client_id, client_secret, TokenUrl) {
//     const clientId = "sb-configproductsoauth-SBPBTP_vcpprovider-sc0jeojq-dev!t94427";
//     const clientSecret1 = "8NnbsalVUyzlH+5mR9y1ANeACDA=";
//     const params = new URLSearchParams();

//     params.append('grant_type', 'client_credentials');

//     params.append('client_id', clientId);

//     params.append('client_secret', clientSecret1);

//     var tokenUrl1 = "https://vcpprovider-sc0jeojq.authentication.us10.hana.ondemand.com/oauth/token";

//     const response = await axios.post(tokenUrl1, params);


//     return response.data.access_token;
// }

// async function getDataFromService(token, newBaseUrl) {
//     const serviceUrl = newBaseUrl;

//     const response = await axios.get("https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/v2/jobs/createJobFeed?jobFeedName=IBP_JOB FEED&userName=external", {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });

//    console.log(response)
// }
