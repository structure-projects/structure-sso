export default {
  // 路由国际化
  route: {
    dashboard: 'Dashboard',
    document: 'Document',
  },
  // 通用国际化
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    submit: 'Submit',
    reset: 'Reset',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    refresh: 'Refresh',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Operation Successful',
    error: 'Operation Failed',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    // 通用验证消息
    phoneRequired: 'Please enter phone number',
    phoneFormatError: 'Invalid phone number format',
    smsCodeRequired: 'Please enter SMS code',
    smsCodeLengthError: 'SMS code must be 6 digits',
    smsCodeSent: 'SMS code sent',
    smsCodeSendFailed: 'Failed to send SMS code, please try again',
    passwordRequired: 'Please enter password',
    passwordLengthError: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    usernameRequired: 'Please enter username',
    // 通用操作
    getSmsCode: 'Get SMS Code',
    registerNow: 'Register Now',
    backToLogin: 'Back to Login',
    nextStep: 'Next',
    // 用户协议
    userAgreement: 'User Agreement',
    privacyPolicy: 'Privacy Policy',
    agreementAnd: 'and',
  },
  // 登录页面国际化
  login: {
    username: 'Username',
    password: 'Password',
    login: 'Login',
    captchaCode: 'Verify Code',
    remember: 'Remember Me',
    forgotPassword: 'Forgot Password',
    // 标签页
    qrcodeLogin: 'QR Code Login',
    accountLogin: 'Username / Email',
    phoneLogin: 'Phone Login',
    socialLogin: 'Social Account',
    // 账户登录
    usernamePlaceholder: 'Please enter username / email / phone',
    passwordPlaceholder: 'Please enter password',
    captchaPlaceholder: 'Please enter verify code',
    loginButton: 'Login',
    // 验证消息
    usernameRequired: 'Please enter username / email / phone',
    emailFormatError: 'Invalid email format',
    passwordRequired: 'Please enter password',
    captchaRequired: 'Please enter verify code',
    captchaLengthError: 'Verify code must be 4 characters',
    // 输入类型提示
    inputTypePhone: 'Phone',
    inputTypeEmail: 'Email',
    inputTypeUsername: 'Username',
    // 独立登录页面
    accountPasswordLogin: 'Account Password Login',
    enterAccountInfo: 'Please enter your account information',
    enterUsernamePassword: 'Please enter username and password',
    phoneLoginTitle: 'Phone Login',
    enterPhoneNumber: 'Please enter your phone number',
    enterPhoneSmsCode: 'Please enter phone number and verify code',
    qrCodeLoginTitle: 'QR Code Login',
    scanQRCodeWithApp: 'Please scan the QR code with the app',
    accountLoginTab: 'Account Login',
    phoneLoginTab: 'Phone Login',
    // 手机登录
    phonePlaceholder: 'Please enter phone number',
    smsCodePlaceholder: 'Please enter SMS code',
    getSmsCode: 'Get SMS Code',
    phoneLoginButton: 'Login',
    // 安全验证弹窗
    securityVerification: 'Security Verification',
    sliderHint: 'Hold the slider and drag to the right',
    // 二维码登录
    generatingQRCode: 'Generating QR code...',
    qrCodeExpired: 'QR code expired',
    qrCodeExpiredTip: 'Please click refresh button',
    scanQRCode: 'Please scan the QR code with {appName}',
    qrCodeScanned: 'QR code scanned, please confirm login on your phone',
    loggingIn: 'Logging in, please wait...',
    scanStatusWaiting: 'Waiting for scan',
    scanStatusScanned: 'Scan successful',
    scanStatusLogging: 'Logging in',
    appName: 'App',
    // 社交登录
    socialLoginDesc: 'Quick login with social accounts',
    moreLoginMethods: 'More login methods',
    collapse: 'Collapse',
    socialLoginTip: 'By logging in, you agree to',
    // 链接
    downloadApp: 'Download App',
    backToMainLogin: 'Back to Main Account Login',
    // 错误消息
    loginFailed: 'Login failed, please try again',
    loginSuccess: 'Login successful',
    welcomeBack: 'Welcome back! You have successfully logged in',
  },
  // 注册页面国际化
  register: {
    title: 'Register New Account',
    subtitle: 'Fill in the following information to complete registration',
    username: 'Username',
    phone: 'Phone Number',
    smsCode: 'Verify Code',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    registerButton: 'Register Now',
    agreementPrefix: 'I have read and agree to',
    alreadyHasAccount: 'Already have an account?',
    goToLogin: 'Login Now',
    // 验证消息
    usernameLengthError: 'Username must be 3 to 20 characters',
    passwordLengthError: 'Password must be 6 to 20 characters',
    confirmPasswordRequired: 'Please enter password again',
    agreementRequired: 'Please read and agree to the user agreement and privacy policy',
    // 成功消息
    registerSuccess: 'Registration successful!',
    registerFailed: 'Registration failed, please try again',
  },
  // 忘记密码页面国际化
  forgotPassword: {
    title: 'Forgot Password',
    subtitle: 'Retrieve password through phone verification',
    phone: 'Registered phone number',
    smsCode: 'SMS Verify Code',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    resendSmsCode: 'Resend',
    resetPassword: 'Reset Password',
    // 步骤
    stepVerifyPhone: 'Verify Phone',
    stepSetPassword: 'Set Password',
    stepComplete: 'Complete',
    // 成功页面
    resetSuccess: 'Password Reset Successful',
    resetSuccessDesc: 'Please login with your new password',
    // 验证消息
    newPasswordRequired: 'Please enter new password',
    newPasswordLengthError: 'Password must be 8-20 characters',
    newPasswordFormatError: 'Password must contain at least two of: letters, numbers, special characters',
    confirmNewPasswordRequired: 'Please enter new password again',
    // 倒计时
    resendAfter: 'Resend after {count}s',
    countdownSuffix: 's',
    // 消息
    smsCodeResent: 'Verify code resent',
    verifySuccess: 'Verification successful',
    verifyFailed: 'Verification failed, please check the code',
    resetPasswordSuccess: 'Password reset successful',
    resetPasswordFailed: 'Failed to reset password',
    // 手机号显示
    smsCodeSentTo: 'Verify code sent to {phone}',
  },
  // 协议弹窗国际化
  agreement: {
    userAgreement: 'User Agreement',
    privacyPolicy: 'Privacy Policy',
    userAndPrivacyPolicy: 'User Agreement and Privacy Policy',
    iHaveRead: 'I have read',
    // 用户协议内容标题
    userServiceAgreement: 'User Service Agreement',
    agreementUpdateDate: 'User Agreement Update Date:',
    versionNumber: 'Version:',
    // 隐私政策内容标题
    privacyNotice: 'Privacy Policy',
    privacyUpdateDate: 'Privacy Policy Update Date:',
  },
  // 登录成功页面国际化
  loginSuccess: {
    title: 'Login Successful',
    desc: 'Welcome back! You have successfully logged in to the system',
    // 授权确认弹窗
    authConfirm: 'Authorization Confirmation',
    appRequestAccess: 'App Requests Access',
    appRequestAccessDesc: 'The current app requests access to your account information, do you authorize?',
    appName: 'App Name:',
    targetUrl: 'Target URL:',
    confirmAuth: 'Confirm Authorization',
  },
  // 导航栏国际化
  navbar: {
    dashboard: 'Dashboard',
    logout: 'Logout',
    document: 'Document',
    gitee: 'Gitee',
  },
  // 布局国际化
  layout: {
    logoAlt: 'Logo',
    appTitle: 'Cloud Yunjida',
    companyName: 'Yunshang Zhihui',
    copyright: 'Copyright © {year} yueyan.tech All Rights Reserved. {company} All Rights Reserved',
    icpNumber: 'Liaoning ICP No. 20006496-1',
  },
  // 语言选择器国际化
  langSelect: {
    chinese: '中文',
    english: 'English',
    switchSuccess: 'Switch Language Successful!',
  },
  // 下载页面国际化
  download: {
    title: 'Download App',
    subtitle: 'Scan the QR code below to download',
    qrCodePlaceholder: 'QR Code',
    scanTip: 'Scan with your phone to download and install the app',
    directDownload: 'Direct Download',
    backToLogin: 'Back to Login',
  },
  // APP 下载页面国际化
  appDownload: {
    appName: 'Cloud Yunjida',
    appDesc: 'Enterprise-level one-stop development platform, making development simpler',
    downloadIOS: 'Download for iOS',
    downloadAndroid: 'Download for Android',
    version: 'Version',
    updateDate: 'Update Date',
    featuresTitle: 'Features',
    feature1: 'Supports multiple login methods including account/password, SMS verification, enterprise QR code, etc.',
    feature2: 'Provides comprehensive user permission management, supports RAM sub-account system',
    feature3: 'Secure and reliable enterprise-level identity authentication service',
    qrHint: 'Scan with WeChat or browser to download',
    viewQRCode: 'Back to Login',
  },
};
