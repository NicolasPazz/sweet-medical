export class Usuario {
  id;
  nombreUsuario;
  password;
  roles;

  constructor(nombreUsuario, password) {
    this.nombreUsuario = nombreUsuario;
    this.password = password;
    this.roles = [];
  }

  static get USUARIO_SISTEMA() {
    return new Usuario('SISTEMA', null);
  }
}
