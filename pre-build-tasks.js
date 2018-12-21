const gulp = require('gulp');
const fs = require('fs');
let angularConfig = require('./.angular-cli.json');

gulp.task('default', function () {

  // The environment name will be will be set by Jenkins.
  // the declaration and initialisation is different on purpose.
  let envName = 'ENV_NAME';

  let metaBuildData = {
    envName : envName,
    containerName : 'srkweb',
    appName: 'web-solitaire'
  };

  // Throw build if Environment is Unknown.
  if(envName.toLowerCase() === 'env_name') {

    throw new Error("Unable to determine environment. Please check Jenkins config and ensure that Jenkins will replace envName variable properly.")

  } else {

    angularConfig.apps[0].deployUrl = 'https://pck.azureedge.net/' + metaBuildData.containerName + '/' + metaBuildData.appName + '/' + metaBuildData.envName + '/';
    angularConfig.metaBuildData = metaBuildData;

    fs.writeFileSync('.angular-cli.json', JSON.stringify(angularConfig, null, 4));

  }

});
