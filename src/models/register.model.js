export class RegisterModel {
  constructor(email = "", password = "", confirmPassword = "") {
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}
