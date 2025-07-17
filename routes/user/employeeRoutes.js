const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/uploadEmployee"); // middleware multer
const employeeCtrl = require("../../controllers/user/employee.controller");

// login
router.post("/login", employeeCtrl.loginEmployee);

// CRUD
router.post("/create", upload.single("imageIden"), employeeCtrl.createEmployee);
router.get("/getAll", employeeCtrl.getAllEmployees);
router.get("/get:id", employeeCtrl.getEmployeeById);
router.put("/update:id", upload.single("imageIden"), employeeCtrl.updateEmployee);
router.delete("/delete:id", employeeCtrl.deleteEmployeeById);
router.delete("/deleteAll", employeeCtrl.deleteAllEmployees);

module.exports = router;