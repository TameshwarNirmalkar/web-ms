const fs = require('fs');


// Fetch a list of blob directories from given blob storage.
exports.getBlobDirectoryList = function (blobServiceInstance, containerName, prefix, token, options) {

  return new Promise(function (resolve, reject) {

    blobServiceInstance
      .listBlobsSegmentedWithPrefix(containerName, prefix, null, options, function (err, result, response) {

        if (err) {

          console.log("Failed to retrieve list of blobs on there.");
          console.error(err);
          reject({
            success: false,
            data: err,
            message: "Failed to retrieve list of blobs on there."
          });

        } else {

          resolve({
            success: true,
            data: {
              result: result,
              response: response
            },
            message: 'Got list of blobs.'
          });

        }

      });

  });

};


// Marks a blob for deletion from a given blob container.
exports.deleteSingleBlob = function (blobServiceInstance, containerName, blobName, options) {

  return new Promise(function (resolve, reject) {

    blobServiceInstance.deleteBlobIfExists(containerName, blobName, options, function (error, result, response) {

      if (error) {

        reject(error);

      } else {

        resolve({
          result: result,
          response: response
        });

      }

    })

  })

};


exports.uploadFileToAzureStorage = function (blobServiceInstance, containerName, directoryName, file) {

  return new Promise(function (resolve, reject) {

    if (fs.statSync(file).isFile()) {

      let options = {};

      if (fs.existsSync(file) && fs.existsSync(file.replace("final/", ""))) {
        options = {
          contentSettings: {
            contentEncoding: fs.statSync(file).size < fs.statSync(file.replace("final/", "")).size ? 'gzip' : ''
          }
        };
      }

      blobServiceInstance.createBlockBlobFromLocalFile(containerName, (directoryName + '/') + file.replace("/dist/solitaire-app/final", ""), file, options, function (error, result, response) {

        if (error) {

          console.log("Failed to upload " + file + " to CDN.");
          console.error(error);
          reject({success: false, message: 'Failed to upload.', data: error, file: file});

        } else {

          resolve({
            success: true,
            message: 'Uploaded successfully',
            data: {
              result: result,
              response: response
            },
            file: file
          });

        }

      });

    } else {

      reject({
        success: false,
        message: "Not A File",
        data: null,
        file: file
      });

    }

  });

};


exports.uploadFileToAzureStorageForLogin = function (blobServiceInstance, containerName, directoryName, file) {

  return new Promise(function (resolve, reject) {

    if (fs.statSync(file).isFile()) {

      let options = {};

      if (fs.existsSync(file) && fs.existsSync(file.replace("final/", ""))) {
        options = {
          contentSettings: {
            contentEncoding: fs.statSync(file).size < fs.statSync(file.replace("final/", "")).size ? 'gzip' : ''
          }
        };
      }

      blobServiceInstance.createBlockBlobFromLocalFile(containerName, (directoryName + '/') + file.replace("/dist/login-app/final", ""), file, options, function (error, result, response) {

        if (error) {

          console.log("Failed to upload " + file + " to CDN.");
          console.error(error);
          reject({success: false, message: 'Failed to upload.', data: error, file: file});

        } else {

          resolve({
            success: true,
            message: 'Uploaded successfully',
            data: {
              result: result,
              response: response
            },
            file: file
          });

        }

      });

    } else {

      reject({
        success: false,
        message: "Not A File",
        data: null,
        file: file
      });

    }

  });

};





