// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');


//https://test.nsdlasp.co.in/URAChatBot/
const BASE_HOST='test.nsdlasp.co.in';//'14.142.129.237';//'test.nsdlasp.co.in/URAChatBot';
const BASE_PORT='443';

const PATH_TAX_LIABILITY='/URAChatBot/tax-liability';//TIN/MONTH/YEAR;
const PATH_IS_TAX_PAY_DEFAULTER='/URAChatBot/tax-pay-defaulter';//3232323
const PATH_IS_TAX_RETURN_DEFAULTER='/URAChatBot/tax-return-defaulter';//3232323
const PATH_HAVE_RECEIVED_NOCTICS='/URAChatBot/is-notice';//3232323

const PATH_SHOW_MY_NOTICES='/URAChatBot/get-notices';//tin#
const PATH_SHOW_VAT_LEDGER='/URAChatBot/vat-ledger';//tin#
const YEAR='2020';
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function urlCaller(PATH){
    return new Promise((resolve, reject) => {
      const https = require('https');
      const options = {hostname: BASE_HOST, port: BASE_PORT, path: PATH, method: 'GET'};
      const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);
        res.on('data', d => {
          if(res.statusCode===200){
            var jsonObj = JSON.parse(d);
             
            if(jsonObj.res_data){
                  
              var resultJson=jsonObj.res_data;
              console.log('response from system==>'+resultJson);
              if(resultJson.TaxLiability){
                resolve('Tax Liability is '+resultJson.TaxLiability);
              }else if(resultJson.taxPayDefaulter){
                resolve(resultJson.taxPayDefaulter);
              }else if(resultJson.taxReturnDefaulter){
                resolve(resultJson.taxReturnDefaulter);
              }else if(resultJson.isNotice){
                resolve(resultJson.isNotice);
              }else{
                console.log('Unkown JSON Structure received==>'+resultJson);
                reject('Unkown JSON Structure received==>'+resultJson);
              }
            }else if (jsonObj.error_msg){
              if(jsonObj.error_msg==='No records found for provided tin'){
                console.log('Information for provided TIN is not present');
                resolve('Information for provided TIN is not present');
              }
            } else{
                console.log('Unable to parse response');
                reject('Unable to parse response');
            }
          }else{
            console.log('Unable to get response from System');
            reject('Unable to get response from System');    
          }
        });
      });

      req.on('error', error => {
        console.error(error);
        reject(error);
      });
      req.end();
    });
  }
  
 // https://test.nsdlasp.co.in/URAChatBot/tax-liability/vat/56ABA4768S/3/2020
  function taxLiability(agent){
    
    var path=PATH_TAX_LIABILITY+'/'+getTaxType(agent)+'/'+getTin(agent)+'/'+getMonth(agent)+'/'+getYear(agent);
    console.log('path==>'+path);
    
    return urlCaller(path).then((value) => {
      agent.add(value);
      suggestions(agent); 
    }).catch((value) => {
      agent.add('Failed to Process the request');
      agent.add(value);
      suggestions(agent); 
    });    
  }

  //https://test.nsdlasp.co.in/URAChatBot/is-notice/56AAE1335L      
  function haveAnyNotices(agent){
    
    var path=PATH_HAVE_RECEIVED_NOCTICS+'/'+getTin(agent);//+'/'+month+'/'+YEAR;
    console.log('path==>'+path);
    
    return urlCaller(path).then((value) => {
      agent.add(value);
      suggestions(agent); 
    }).catch((value) => {
      agent.add('Failed to Process the request');
      agent.add(value);
      suggestions(agent); 
    });    
  }


  //https://test.nsdlasp.co.in/URAChatBot/tax-pay-defaulter/vat/27ABFPD402/3/2020                  
  function isTaxPayDefaulter(agent){

    console.log('Checking whether Tax payer has defaulted for Tax Payment');
    
    var path=PATH_IS_TAX_PAY_DEFAULTER+'/'+getTaxType(agent)+'/'+getTin(agent)+'/'+getMonth(agent)+'/'+getYear(agent);
    console.log('path==>'+path);
    
    return urlCaller(path).then((value) => {
      agent.add(value);
      suggestions(agent); 
    }).catch((value) => {
      agent.add('Failed to Process the request');
      agent.add(value);
      suggestions(agent); 
    });    
  }

//https://test.nsdlasp.co.in/URAChatBot/tax-return-defaulter/vat/27ABFPD402/2/2020                           
function isTaxReturnDefaulter(agent){

    console.log('Checking whether Tax payer has defaulted for Tax Return');
    
    var path=PATH_IS_TAX_RETURN_DEFAULTER+'/'+getTaxType(agent)+'/'+getTin(agent)+'/'+getMonth(agent)+'/'+getYear(agent);
    console.log('path==>'+path);
    
    return urlCaller(path).then((value) => {
      agent.add(value);
      suggestions(agent); 
    }).catch((value) => {
      agent.add('Failed to Process the request');
      agent.add(value);
      suggestions(agent); 
    });    
  }

  function getTin(agent){
    var contextIn = agent.getContext('tin-service-yes-followup');
    return contextIn.parameters.TIN;
  }

  function getMonth(agent){
    var contextIn = agent.getContext('tin-service-yes-followup');
    return contextIn.parameters.Month;
    
  }

  function getTaxType(agent){
    var contextIn = agent.getContext('tin-service-yes-followup');
    return contextIn.parameters.TaxType;
  }

  function getYear(agent){
    var contextIn = agent.getContext('tin-service-yes-followup');
    return contextIn.parameters.Year;
  }

  function suggestions(agent){
 	agent.add('Information you can request for TIN:'+getTin(agent)+ ', TaxType:'+getTaxType(agent)+', Month:'+getMonth(agent)+', Year:'+getYear(agent));
    agent.add(new Suggestion('Notices'));
    agent.add(new Suggestion('Liability'));
    agent.add(new Suggestion('Payment Default'));
    agent.add(new Suggestion('Return Default'));
  }
  

  let intentMap = new Map();
  intentMap.set('TIN-Service-Yes', suggestions);
  intentMap.set('TIN-Service-Yes-Liability', taxLiability);
  intentMap.set('TIN-Service-Yes-Notices', haveAnyNotices);
  intentMap.set('TIN-Service-Yes-Tax-Pay-Default', isTaxPayDefaulter); 
  intentMap.set('return-default', isTaxReturnDefaulter); 
  agent.handleRequest(intentMap);
});

