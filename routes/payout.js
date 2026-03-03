const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const controller = require("../controllers/payoutController");

router.get("/", auth, controller.list);
router.post("/", auth, controller.create);

router.post("/:id/submit", auth,  controller.submit);
router.post("/:id/approve", auth, controller.approve);
router.post("/:id/reject", auth, controller.reject);

router.get("/:id", auth, controller.getOne);

module.exports = router;