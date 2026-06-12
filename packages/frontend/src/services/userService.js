export const getUserByToken = async (token) => {
  
  console.log("TOKEN: ", token);

  if (token !== 'abc123') return null;

  
    const user = {
        id: "6a0f950c7469fbef799921bc",
        nombre: 'Lucca Bertani',
        username: "LuccaTarta",
        rol: 'Médico',
        especialidades: ['Cardiología', 'Cirugía General'],
        practicas: ['Electrocardiograma', 'Ecografía Abdominal'],
        antiguedad: 5,
        telefono: '123456789',
        direccion: 'Calle Falsa 123',
        email: 'usuario@sweetmedical.com',
        avatar: '/chiqui.jpg',
        obraSocial: "SWISS_MEDICAL",
        plan: "PREMIUM",
        coberturasEspecialidad: ["CARDIOLOGÍA", "PEDIATRÍA"],
        coberturasPractica: ["ELECTROCARDIOGRAMA"]
    }

  return user;
};
