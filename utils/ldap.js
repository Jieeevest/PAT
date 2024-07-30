
const soap = require('strong-soap').soap;
const { promisify } = require('util');

const validateUsernamePassword = async (username, password) => {
  // const wsdlUrl = "https://wsuser.bri.co.id/beranda/ldap/ws/ws_adUser.php?wsdl"
  const wsdlUrl = process.cwd() + "/ws_adUser.wsdl"
  const asoapClient =  promisify(soap.createClient);
  const wsuserSoapClient = await asoapClient(wsdlUrl);
  const aValidateAduser = promisify(wsuserSoapClient.validate_aduser).bind(wsuserSoapClient);
  const result = await aValidateAduser({ldap_user: username, ldap_pass: password});

  return result;
}

module.exports = {
  validateUsernamePassword
}