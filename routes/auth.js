const router = require("express").Router();
const { login } = require("../controllers/authController");

router.post("/login", login);

// root route
router.get("/", (request, response) => {
  response.send({
    name: "Payout-Management-MVP-API",
    date: new Date(),
    test: "1",
  });
});

module.exports = router;