export enum Path {
  // general
  All= '',
  Home = 'home',
  NotFound = '404',
  WildCard = '**',

  // Account
  Account = 'accounts',
  Login = 'login',
  Logout = 'auth/logout',
  Register = 'register',
  CurrentUserDetails = 'auth/user',
  ForgotPassword = 'forgot-password',
  AuthToken = 'auth/Token',
  ForgetPassword = 'users/forgot-password',
  ChangePassword = 'users/change-password',
}
