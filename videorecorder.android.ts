import common = require('./videorecorder.common');
import permissions = require('nativescript-permissions');
import app = require('application');
const RESULT_CANCELED = 0;
const RESULT_OK = -1;
const REQUEST_VIDEO_CAPTURE = 999;
const REQUEST_CODE_ASK_PERMISSIONS = 1000;
const ORIENTATION_UNKNOWN = -1;
const PERMISSION_DENIED = -1;
const PERMISSION_GRANTED = 0;
const MARSHMALLOW = 23;
const packageName = app.android.context.getPackageName();
import fs = require("file-system");
import utils = require("utils/utils");

const currentapiVersion = android.os.Build.VERSION.SDK_INT;

export class VideoRecorder extends common.VideoRecorder {
    constructor() {
        super();
    }

    record(options: any): Promise<any> {
        return new Promise((resolve, reject) => {

            //let tempVideoPath = fs.path.join(utils.ad.getApplicationContext().getExternalFilesDir(null).getAbsolutePath(), "videoCapture_" + +new Date() + ".mp4");
            options = options || {}
            let data = null
            let file;
            options.size = options.size || 0;
            options.hd = options.hd ? 1 : 0;
            options.saveToGallery = options.saveToGallery || false;
            options.duration = options.duration || 0;
            options.explanation = options.explanation = "";

            let startRecording = () => {
                let intent = new android.content.Intent(android.provider.MediaStore.ACTION_VIDEO_CAPTURE);

                if (options.hd === 1) {
                    intent.putExtra(android.provider.MediaStore.EXTRA_VIDEO_QUALITY, 1);
                }
                if (options.size > 0) {
                    intent.putExtra(android.provider.MediaStore.EXTRA_SIZE_LIMIT, options.sizeLimit * 1024 * 1024);
                }
                if (!options.saveToGallery) {
                    file = new java.io.File(app.android.context.getFilesDir(), "videoCapture_" + +new Date() + ".mp4");
                    intent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, android.net.Uri.fromFile(file))
                } else {
                    file = new java.io.File(android.os.Environment.getExternalStoragePublicDirectory(
                        android.os.Environment.DIRECTORY_MOVIES).getAbsolutePath() + "/" + "videoCapture_" + +new Date() + ".mp4");

                    intent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, android.net.Uri.fromFile(file))
                }
                if (options.duration > 0) {
                    intent.putExtra(android.provider.MediaStore.EXTRA_DURATION_LIMIT, options.durationLimit);
                }

                if (intent.resolveActivity(app.android.currentContext.getPackageManager()) != null) {
                    app.android.currentContext.startActivityForResult(intent, REQUEST_VIDEO_CAPTURE);

                    app.android.on(app.AndroidApplication.activityResultEvent, (args: app.AndroidActivityResultEventData) => {

                        if (args.requestCode === REQUEST_VIDEO_CAPTURE && args.resultCode === RESULT_OK) {

                            if (options.saveToGallery) {
                                resolve({ file: file.toString() });
                            } else {
                                resolve({ file: file.toString() });
                            }


                        } else if (args.resultCode === RESULT_CANCELED) {
                            reject({ event: 'cancelled' })
                        } else {
                            reject({ event: 'failed' })
                        }

                    })
                } else {
                    reject({ event: 'failed' })
                }
            }

            if (currentapiVersion >= MARSHMALLOW) {

                if (options.explanation.length > 0) {
                    permissions.requestPermission(android.Manifest.permission.CAMERA, options.explanation)
                        .then(function () {
                            startRecording();
                        })
                        .catch(function () {
                            reject({ event: 'camera permission needed' })
                        });
                } else {
                    permissions.requestPermission(android.Manifest.permission.CAMERA)
                        .then(function () {
                            startRecording();
                        })
                        .catch(function () {
                            reject({ event: 'camera permission needed' })
                        });
                }
            }
            else {
                startRecording()
            }
        })

    }
}
