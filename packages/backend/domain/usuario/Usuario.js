export class Usuario {
  id;
  nombreUsuario;
  password;

  constructor(nombreUsuario, password) {
    this.nombreUsuario = nombreUsuario;
    this.password = password;
  }

  static get USUARIO_SISTEMA() {
    return new Usuario("SISTEMA", null);
  }
}
