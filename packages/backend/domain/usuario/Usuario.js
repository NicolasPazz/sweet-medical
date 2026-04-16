export class Usuario {
  constructor(id, nombreUsuario, password) {
    this.id = id;
    this.nombreUsuario = nombreUsuario;
    this.password = password;
  }

  static get USUARIO_SISTEMA() {
    return new Usuario("SYS-000", "SISTEMA", null);
  }
}
