
export const getUserByToken = async (token) => {

    if(token !== 'abc123') return null;

    const user = {
        id: 1,
        nombre: 'Lucca Bertani',
        username: "LuccaTarta",
        rol: 'Médico',
        especialidades: ['Cardiología', 'Cirugía General'],
        practicas: ['Electrocardiograma', 'Ecografía Abdominal'],
        antiguedad: 5,
        telefono: '123456789',
        direccion: 'Calle Falsa 123',
        email: 'usuario@sweetmedical.com',
        avatar: '/chiqui.jpg'
    }

    return user;
}