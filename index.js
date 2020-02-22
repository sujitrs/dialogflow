// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

const BASE_HOST='52.172.189.82';
const BASE_PORT='80';

const PATH_VAT_TAX_LIABILITY='/vat-tax-liability';//TIN/MONTH/YEAR;
const PATH_SHOW_MY_NOTICES='/get-notices';//tin
const PATH_SHOW_VAT_LEDGER='/vat-ledger';//tin
const PATH_IS_TAX_PAY_DEFAULTER='/tax-pay-defaulter';//3232323
const PATH_IS_TAX_RETURN_DEFAULTER='/tax-return-defaulter';//3232323
const PATH_HAVE_RECEIVED_NOCTICS='/is-notice';//3232323

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to Tax Ginie!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  
  function VAT_Tax_Liability(agent){
    
    var tin= agent.parameters.tin;
    var month= agent.parameters.month;
    return liable(tin,month).then((value) => {
      agent.add('Tax Liability is'+value);
    }).catch(() => {
      agent.add('Failed to calculate liability');
    });    
  }
  
  function liable(tin,month){
        return new Promise((resolve, reject) => {
            const https = require('http');
            const options = {
                hostname: BASE_HOST,
                port: BASE_PORT,
                path: PATH_VAT_TAX_LIABILITY+'/'+tin+'/'+month+'/2020',
                method: 'GET'
            };

            const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`);
            res.on('data', d => {
            var jsonObj = JSON.parse(d);
            console.log(jsonObj.res_data.taxliability);
            resolve(jsonObj.res_data.taxliability);
            });
        });

            req.on('error', error => {
            console.error(error);
            reject(error);
        });
            req.end();
            });
    }
  
  //"calculate/math/paye.php?pay_period=month&salary=400000000000&benefits=0&deduct_lst=yes&deduct_social=yes&relief=0&residency=resident&email=results@calculator.co.ke&rand=34793941"
  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('vat-tax-liability-1', VAT_Tax_Liability);
  
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
