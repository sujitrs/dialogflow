//https://test.nsdlasp.co.in/URAChatBot/tax-liability/vat/56ABA4768S/3/2020

const one='/URAChatBot/tax-liability/vat/56ABA4768S/5/2020';
const two='/URAChatBot/tax-pay-defaulter/vat/27ABFPD402/3/2020';
const three='/URAChatBot/tax-return-defaulter/vat/27ABFPD402/2/2020';
const four='/URAChatBot/is-notice/56AAE1335L';

//https://nsdletax.com/URAChatBot/tax-pay-defaulter/excise/00IDT8569W/5/2020   
const https = require('https')
const options = {
  hostname: 'nsdletax.com',
  port: 443,
  path: one,//two,//one,
  method: 'GET'
}

require('https').globalAgent.options.ca = require('ssl-root-cas').create();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)
  res.on('data', d => {
    if(res.statusCode===200){
      var jsonObj = JSON.parse(d);
      console.log(jsonObj); 
      if(jsonObj.res_data){
        if(jsonObj.res_data.TaxLiability){
          console.log(jsonObj.res_data.TaxLiability);
        }else if(jsonObj.res_data.taxPayDefaulter){
          console.log(jsonObj.res_data.taxPayDefaulter);
        }else if(jsonObj.res_data.taxReturnDefaulter){
          console.log(jsonObj.res_data.taxReturnDefaulter);
        }else if(jsonObj.res_data.isNotice){
          console.log(jsonObj.res_data.isNotice);
        }
      }else if (jsonObj.error_msg){
        if(jsonObj.error_msg==='No records found for provided tin'){
          console.log('Information for provided TIN not present');
        }
      }
    }else{
      console.log('Unable to get response from System');
    }
  })
})

req.on('error', error => {
  console.error(error)
})
req.end()