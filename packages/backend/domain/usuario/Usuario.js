export class Usuario {
  id;
  nombreUsuario;
  email;
  password;
  roles;
  dni;
  nombre;
  activo;

  // Usuario del sistema para operaciones internas
  static USUARIO_SISTEMA = { id: null, _id: null, nombreUsuario: 'SISTEMA' };

  static setUsuarioSistema(usuario) {
    Usuario.USUARIO_SISTEMA = usuario;
  }

  constructor(nombreUsuario, password) {
    this.nombreUsuario = nombreUsuario;
    this.password = password;
    this.roles = [];
    this.activo = false;
  }
}
