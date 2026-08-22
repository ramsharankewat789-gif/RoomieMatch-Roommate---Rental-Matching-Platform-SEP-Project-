/**
 * favouriteRoutes.js
 *
 * GET    /api/favourites                       List own favourites
 * POST   /api/favourites                       Save a property
 * GET    /api/favourites/:propertyId/status    Check if saved
 * DELETE /api/favourites/:propertyId           Remove
 */
const express = require("express");
const router  = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  listFavourites,
  addFavourite,
  removeFavourite,
  getFavouriteStatus
} = require("../controllers/favouriteController");

router.get("/",                        requireAuth, listFavourites);
router.post("/",                       requireAuth, addFavourite);
router.get("/:propertyId/status",      requireAuth, getFavouriteStatus);
router.delete("/:propertyId",          requireAuth, removeFavourite);

module.exports = router;
