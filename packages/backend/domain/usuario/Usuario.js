export class Usuario {
  id;
  nombreUsuario;
  password;
  roles;

  constructor(nombreUsuario, password) {
    /*if (
      nombreUsuario &&
      typeof nombreUsuario === 'object' &&
      !nombreUsuario.constructor.name.includes('ObjectId')
    ) {
      Object.assign(this, nombreUsuario);
      this.id = this.id || this._id;
      return;
    }*/

    this.nombreUsuario = nombreUsuario;
    this.password = password;
    this.roles = [];
  }

  static USUARIO_SISTEMA = (() => {
    const admin = new Usuario('ADMIN', '123456789');
    admin.roles = ['ADMIN'];
    admin.id = '000000000000000000000001';
    return admin;
  })();
}
