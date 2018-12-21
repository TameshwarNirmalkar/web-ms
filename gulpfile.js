const gulp = require('gulp');
const gzip = require('gulp-gzip');
const azure = require('azure-storage');
const glob = require('glob');
const azureService = require('./gulp-azure-sync-assets');
const angularConfig = require('./.angular-cli.json');
let fs = require('fs');

//Get current Environment
let envName = angularConfig.metaBuildData.envName;

// The Blob Storage Container to use.
let containerName = angularConfig.metaBuildData.containerName;

// Generate a directory name to use with a timestamp to manage storage.
const directoryName = angularConfig.metaBuildData.appName + '/' + angularConfig.metaBuildData.envName;

// Compress the files before uploading to CDN.
gulp.task('compress', function () {

  return gulp
    .src([
      'dist/solitaire-app/*.{js,css,png,jpg,gif,svg,eot,ttf,woff,woff2,txt}',
      'dist/solitaire-app/!login-index.html'
    ], {base: './dist/solitaire-app'})
    .pipe(gzip({
      append: false,
      threshold: 860,
      skipGrowingFiles: true
    }))
    .pipe(gulp.dest('./dist/solitaire-app/final/'));

});


gulp.task('copyAssets', function () {

  return gulp
    .src(['dist/solitaire-app/assets/**', 'dist/solitaire-app/index.html'], {base: './dist/solitaire-app'})
    .pipe(gulp.dest('dist/'))

});

// Upload the files to Azure blob container.
gulp.task('default', ['compress', 'copyAssets'], function () {

  // Open authenticated connection to Blob Storage.
  let blobService = azure.createBlobService('pck', 'CDN_PWD');

  // Since we filter what to gzip already.
  // All static assets will be uploaded to CDN, hence the glob-star.
  let files = glob.sync('./dist/solitaire-app/final/**');

  let prefix = directoryName + '/';

  azureService
    .getBlobDirectoryList(blobService, containerName, prefix, null, {})
    .then(response => {

      fs.writeFileSync('response-blobs.json', JSON.stringify(response, null, 4));

      let blobsToDelete = [];

      if (response.success) {

        for(let i = 0; i < response.data.result.entries.length; i++){

          let index = files.indexOf(response.data.result.entries[i].name.replace(prefix, "./dist/solitaire-app/final/"));

          if(index > -1){

            // The file exists on the cdn and also in the new build.
            // This would mean that the file has not changed and does
            // not need to pushed again.
            files.splice(index, 1);

          } else {

            // This means the file exists on the CDN and not in the build
            // This is now safe to be deleted in order to save space on the CDN Storage.
            blobsToDelete.push(response.data.result.entries[i]);

          }

        }

        let uploads = files.map(file => {

          return azureService.uploadFileToAzureStorage(blobService, containerName, directoryName, file)
            .then( uploaded => {
              return uploaded;
            })
            .catch( failed => {
              return failed;
            })

        });

        Promise.all(uploads)
          .then( data => {

            let failedFiles = data.filter( elm => { return !elm.success && elm.message !== 'Not A File'; });

            if(failedFiles.length > 0 ){

              console.info("Failed to upload " + failedFiles.length + " files re-trying once again.");

              let retryUpload = failedFiles.map(retryFile => {

                return azureService.uploadFileToAzureStorage(blobService, containerName, directoryName, retryFile)
                  .then( uploaded => {
                    return uploaded;
                  })
                  .catch( failed => {
                    return failed;
                  })

              });

              Promise.all(retryUpload)
                .then(retryData => {

                  let retryFailed = retryData.filter( elm => { return !elm.success && elm.message !== 'Not A File'; });

                  console.log("Failed to upload " + retryFailed.length + " not trying again.");

                  let deleteList = blobsToDelete.map( removeBlob => {

                    return azureService.deleteSingleBlob(blobService, containerName, removeBlob.name, {})

                  });

                  Promise.all(deleteList)
                    .then( deleted => {

                      console.log("Deleted all Blobs successfully");

                    })
                    .catch( error => {

                      console.log("Failed to delete some blobs they will have to be deleted manually ");
                      console.error(error);

                    });

                })
                .catch(error => {

                  console.log("Failed when retrying to upload files");
                  console.error(error)

                });

            } else {

              console.info("All files uploaded to CDN successfully.");

              let deleteList = blobsToDelete.map( removeBlob => {

                return azureService.deleteSingleBlob(blobService, containerName, removeBlob.name, {})

              });

              Promise.all(deleteList)
                .then( deleted => {

                  console.log("The deleted result is ");

                })
                .catch( error => {

                  console.log("Failed to delete some blobs they will have to be deleted manually ");
                  console.error(error);

                });

            }

          })
          .catch( error => {

            console.log("Failed when uploading file");
            console.error(error);

          });

      } else {

        throw new Error('Something went wrong while fetching a list of the blobs on the blob storage.', response);

      }

    })
    .catch(error => {

      console.log("Failed to get a list of all the blobs.");
      console.error(error);

    });

});

