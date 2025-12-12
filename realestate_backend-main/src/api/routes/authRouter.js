const router = require("express").Router();
const authCtrl = require("../controllers/authController");

const auth = require("../middleware/auth");


router.post("/register-email", authCtrl.registerEmail);
router.get("/email-verification", authCtrl.verifyEmail);
router.post("/resend-email-verification", authCtrl.resendEmail);



router.post("/register-phone", authCtrl.registerPhone);
router.post("/verify-otp", authCtrl.verifyOTP);
router.post("/resend-otp", authCtrl.resendOTP);


router.post("/login", authCtrl.login);
router.post("/login-phone", authCtrl.loginPhone);

router.post("/forgot-password-email", authCtrl.forgotPasswordEmail);
router.post("/reset-password-email", authCtrl.resetPasswordEmail);

router.post("/forgot-password-phone", authCtrl.forgotPasswordPhone);
router.post("/reset-password-phone", authCtrl.resetPasswordPhone);

router.post("/logout", auth, authCtrl.logout);

module.exports = router;
