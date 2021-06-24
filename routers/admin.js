const router = require("express").Router();
const { getAccessToRoute, getAdminAcces } = require("../middlewares/authorization/auth")
const { blockUser,deleteUser} = require("../controllers/admin")
const { checkUserExits } = require("../middlewares/database/databaseErrorHelper")




router.use([getAccessToRoute, getAdminAcces]);

//checkUserExits ile bu gelen id yi db de var mı yok mu onu kontrol edecek
router.get("/block/:id", checkUserExits, blockUser)
router.delete("/user/:id", checkUserExits, deleteUser)




module.exports = router