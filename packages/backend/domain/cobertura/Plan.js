export class Plan{

    id;
    nombre;
    coberturasEspecialidad;
    coberturasPractica;

    constructor(id, nombre){
        this.id = id;
        this.nombre = nombre;
        this.coberturasEspecialidad = [];
        this.coberturasPractica = [];
    }

    obtenerCobertura(especialidad){
        return this.coberturasEspecialidad.find(cobertura => cobertura.especialidad.id == especialidad.id);
    }

    obtenerCobertura(practica){
        return this.coberturasEspecialidad.find(cobertura => cobertura.practica.id == practica.id);
    }

}