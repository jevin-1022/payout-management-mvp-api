const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const controller = require("../controllers/vendorController");

router.get("/", auth, controller.list);
router.post("/", auth, controller.create);

module.exports = router;