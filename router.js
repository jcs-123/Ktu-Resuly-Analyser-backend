//import express
const express = require('express')
const regsitercontroller = require('./controller/registercontroller');
const multerConfig = require('./middleware/multermiddleware');
const rev2015scheme =require('./controller/rev2015scheme')
const depdatacontroller =require('./controller/depdatacontroller')
const credictcontroller = require('./controller/credictcontroller');
const exceluploadcontroller = require('./controller/excleuploadcontroller');
const elsecredictcontroller = require('./controller/elsecreditcontroller');

//instance router
const router = new express.Router()

//add register
router.post('/add-register', regsitercontroller.addRegister )
router.post('/login', regsitercontroller.loginUser);
// 🔐 Forgot Password (send OTP to email)
router.post('/forgot-password', regsitercontroller.forgotPassword);

// 🔁 Reset Password using OTP
router.post('/reset-password', regsitercontroller.resetPassword);
// POST route to upload PDF (field name: filerev2015)
router.post(
  '/upload-rev2015',
  multerConfig.single('filerev2015'),
  rev2015scheme.uploadRevision2015File
);

// GET route to fetch parsed results (optionally by filename)
router.get('/revision2015', rev2015scheme.getRevision2015Data);
//depdaat
router.get('/depdata', depdatacontroller.getDepData); // GET /api/depdata
router.post('/add-depdata', depdatacontroller.addDepData);
// credict get
router.get('/getcredict', credictcontroller.getSemesterCredit); // GET /api/depdata
router.get('/getelsecredict', elsecredictcontroller.getelseSemesterCredit); // GET /api/depdata

// excel download
router.post(
  '/exceldownload',
  multerConfig.single('excelFile'),
  exceluploadcontroller.uploadExcel
);
// ✅ Get All Uploaded Excel Files (from MongoDB)
router.get('/exceldownload', exceluploadcontroller.getAllExcelFiles);

// ✅ Download Specific Excel File
router.get('/exceldownload/:filename', exceluploadcontroller.downloadExcelFile);
// Export
module.exports = router