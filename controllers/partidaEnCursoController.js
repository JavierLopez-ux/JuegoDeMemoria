const PartidaEnCurso = require('../models/PartidaEnCurso');
const Estadisticas = require('../models/Estadisticas');

// Función para generar un tablero aleatorio de 4x4 (8 pares de cartas)
const generarTableroAleatorio = () => {
    const frutas = ['🍎', '🍌', '🍒', '🍓', '🍊', '🍉', '🍍', '🍑'];
    const tablero = [...frutas, ...frutas]; // Duplicar las frutas para tener pares
    return tablero.sort(() => Math.random() - 0.5); // Mezclar el tablero
};

// Función para verificar si el jugador ha ganado
const verificarVictoria = (partida) => {
    return partida.paresEncontrados === 8; // 8 pares en total en el tablero 4x4
};


// Iniciar una nueva partida
exports.iniciarPartida = async (req, res) => {
    const { usuarioId, tiempoLimite } = req.body;

    try {
        // Verificar si ya hay una partida en curso para el usuario
        const partidaExistente = await PartidaEnCurso.findOne({ usuario: usuarioId, estado: 'en curso' });

        if (partidaExistente) {
            return res.status(400).json({ error: 'Ya tienes una partida en curso. Finaliza o abandona la partida actual antes de iniciar una nueva.' });
        }

        // Generar un tablero aleatorio
        const tablero = generarTableroAleatorio();

        // Crear una nueva partida en curso
        const partidaEnCurso = new PartidaEnCurso({
            usuario: usuarioId,
            tablero,
            tiempoLimite,
            estado: 'en curso',
            tiempoInicio: new Date(),
            paresEncontrados: 0,
            cartasReveladas: []
        });

        // Guardar la partida en la base de datos
        await partidaEnCurso.save();

        // Responder con la partida creada
        res.status(201).json({ message: 'Partida iniciada', partidaEnCurso });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar la partida', details: error.message });
    }
};


// Procesar un intento de revelar cartas
exports.intentar = async (req, res) => {
    const { partidaId, carta1Index, carta2Index } = req.body;

    try {
        // Buscar la partida en curso
        const partidaEnCurso = await PartidaEnCurso.findById(partidaId);
        if (!partidaEnCurso) {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }

        // Verificar si las cartas ya están reveladas
        if (partidaEnCurso.cartasReveladas.includes(carta1Index) || partidaEnCurso.cartasReveladas.includes(carta2Index)) {
            return res.status(400).json({ error: 'Una o ambas cartas ya están reveladas' });
        }

        // Revelar las cartas
        partidaEnCurso.cartasReveladas.push(carta1Index, carta2Index);

        // Verificar si las cartas coinciden
        if (partidaEnCurso.tablero[carta1Index] === partidaEnCurso.tablero[carta2Index]) {
            partidaEnCurso.paresEncontrados += 1; // Incrementar el contador de pares encontrados
        }

        // Guardar los cambios en la base de datos
        await partidaEnCurso.save();

        // Verificar victoria
        const victoria = verificarVictoria(partidaEnCurso);
        if (victoria) {
            partidaEnCurso.estado = 'finalizada';
            await partidaEnCurso.save();

            // Actualizar estadísticas con victoria
            const estadisticas = await Estadisticas.findOne({ usuario: partidaEnCurso.usuario });
            if (!estadisticas) {
                await new Estadisticas({ usuario: partidaEnCurso.usuario, victorias: 1 }).save();
            } else {
                estadisticas.victorias += 1;
                await estadisticas.save();
            }

            return res.json({ message: 'Victoria', partidaEnCurso });
        }

        // Responder con el estado actual de la partida
        res.status(200).json({ message: 'Intento procesado', partidaEnCurso });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar el intento', details: error.message });
    }
};

// Finalizar una partida
exports.finalizarPartida = async (req, res) => {
    const { partidaId } = req.body;

    try {
        // Buscar la partida en curso
        const partidaEnCurso = await PartidaEnCurso.findById(partidaId);
        if (!partidaEnCurso) {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }

        // Verificar si el tiempo se ha agotado
        const tiempoTranscurrido = (new Date() - new Date(partidaEnCurso.tiempoInicio)) / 1000;
        if (partidaEnCurso.tiempoLimite && tiempoTranscurrido > partidaEnCurso.tiempoLimite) {
            partidaEnCurso.estado = 'finalizada';
            await partidaEnCurso.save();

            // Actualizar estadísticas con derrota
            const estadisticas = await Estadisticas.findOne({ usuario: partidaEnCurso.usuario });
            if (!estadisticas) {
                await new Estadisticas({ usuario: partidaEnCurso.usuario, victorias: 0 }).save();
            } else {
                estadisticas.victorias += 0; // No se incrementan las victorias
                await estadisticas.save();
            }

            return res.json({ message: 'Tiempo agotado. Derrota', partidaEnCurso });
        }

        // Responder si la partida no ha finalizado
        res.status(200).json({ message: 'Partida no finalizada aún', partidaEnCurso });
    } catch (error) {
        res.status(500).json({ error: 'Error al finalizar la partida', details: error.message });
    }
};

// Abandonar una partida
exports.abandonarPartida = async (req, res) => {
    const { usuarioId } = req.body;

    try {
        // Buscar la partida en curso del usuario
        const partidaEnCurso = await PartidaEnCurso.findOne({ usuario: usuarioId, estado: 'en curso' });

        if (!partidaEnCurso) {
            return res.status(404).json({ error: 'No tienes una partida en curso' });
        }

        // Cambiar el estado de la partida a "abandonada"
        partidaEnCurso.estado = 'abandonada';
        await partidaEnCurso.save();

        // Responder con la partida abandonada
        res.status(200).json({ message: 'Partida abandonada', partidaEnCurso });
    } catch (error) {
        res.status(500).json({ error: 'Error al abandonar la partida', details: error.message });
    }
};