const express = require("express");
const router = express.Router();

const {
  getBootCamp,
  getBootCamps,
  createBootCamp,
  deleteBootCamp,
  updateBootCamp,
} = require("../controllers/bootcampController");

router.route("/").get(getBootCamps).post(createBootCamp);
router
  .route("/:id")
  .get(getBootCamp)
  .put(updateBootCamp)
  .delete(deleteBootCamp);

module.exports = router;
