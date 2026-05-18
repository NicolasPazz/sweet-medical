export class Usuario {
  id;
  nombreUsuario;
  password;
  roles;

  // Usuario del sistema para operaciones internas
  static USUARIO_SISTEMA = { id: null, _id: null, nombreUsuario: 'SISTEMA' };

  static setUsuarioSistema(usuario) {
    Usuario.USUARIO_SISTEMA = usuario;
  }

  constructor(nombreUsuario, password) {
    this.nombreUsuario = nombreUsuario;
    this.password = password;
    this.roles = [];
  }
}
