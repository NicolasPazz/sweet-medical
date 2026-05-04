import { logger } from "../domain/utils/logger.js";
import { Usuario } from "../domain/usuario/Usuario.js";
import { Medico } from "../domain/usuario/Medico.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { MedicoRepository } from "../repositories/MedicoRepository.js";

export class MedicoController {

    constructor({ usuarioRepository = new UsuarioRepository() } = {}, { medicoRepository = new MedicoRepository() } = {}){
        this.usuarioRepository = usuarioRepository;
        this.medicoRepository = medicoRepository;
    }

    cargarDatosIniciales = async (req, res) => {
        try {

            for (let i = 1; i <= 10; i++) {
                // 1. Creamos el objeto Usuario (Credenciales)
                const nombreUsuario = `medico${i}`;
                const password = `pass123_${i}`;
                const nuevoUsuario = new Usuario(nombreUsuario, password);

                // 2. Creamos el objeto Medico vinculando el usuario anterior
                const matricula = `MAT-${1000 + i}`;
                const nombreCompleto = `Dr. Especialista ${i}`;
                const nuevoMedico = new Medico(nuevoUsuario, matricula, nombreCompleto);

                nuevoUsuario.roles.push(nuevoMedico);
                // Agregamos a la lista de resultados
                this.usuarioRepository.save(nuevoUsuario);
                this.medicoRepository.save(nuevoMedico);
            }
            return res.status(201).json({
                status: "success",
                data: "Carga completada",
            });
        } catch (error) {
            logger.error(error);
        }
    };

    leerDatosIniciales = async(req, res) => {

        try{

            const medicos = await this.medicoRepository.findAll();

            const dataParaEnviar = Object.values(medicos).map(m => {
            const { usuario, ...resto } = m; 
            return { ...resto, nombreUsuario: usuario.nombreUsuario };
            });

            return res.status(200).json({
                status: "success",
                data: dataParaEnviar
            })
        } catch(error){
            logger.error(error);
        }


    }


}