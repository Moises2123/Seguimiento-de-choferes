// Variables globales
let registros = [];
let editandoId = null;

// Inicialización cuando el DOM está listo
$(document).ready(function() {
    inicializarApp();
});

// Función principal de inicialización
function inicializarApp() {
    configurarEventos();
    actualizarReloj();
    cargarRegistros();
    configurarAnimaciones();
    
    // Actualizar reloj cada segundo
    setInterval(actualizarReloj, 1000);
    
    // Mostrar formulario por defecto
    mostrarFormulario();
    
    console.log('🚀 TranspoControl inicializado correctamente');
}

// Configurar todos los eventos
function configurarEventos() {
    // Evento de envío del formulario
    $('#registroForm').on('submit', function(e) {
        e.preventDefault();
        guardarRegistro();
    });
    
    // Eventos de navegación
    $('.nav-link').on('click', function(e) {
        e.preventDefault();
        actualizarNavegacionActiva($(this));
    });
    
    // Eventos de teclado
    $(document).on('keydown', function(e) {
        // ESC para limpiar formulario
        if (e.key === 'Escape') {
            limpiarFormulario();
        }
        // Ctrl+S para guardar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            $('#registroForm').submit();
        }
    });
    
    // Eventos de inputs con validación en tiempo real
    $('.glass-input').on('input', function() {
        validarCampoEnTiempoReal($(this));
    });
    
    // Evento para detectar cambios en el tipo de registro
    $('#tipo').on('change', function() {
        actualizarPlaceholdersSegunTipo($(this).val());
    });
}

// Actualizar reloj en tiempo real
function actualizarReloj() {
    const ahora = new Date();
    const opciones = {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const fechaHora = ahora.toLocaleString('es-PE', opciones);
    $('#currentDateTime').text(fechaHora);
}

// Navegación entre secciones
function mostrarFormulario() {
    cambiarSeccion('formularioRegistro', 'Nuevo Registro', 'fas fa-plus-circle');
    limpiarFormulario();
}

function mostrarHistorial() {
    cambiarSeccion('historialRegistros', 'Historial de Registros', 'fas fa-history');
    cargarTablaRegistros();
}

function cambiarSeccion(seccionId, titulo, icono) {
    // Ocultar todas las secciones
    $('.content-section').hide();
    
    // Mostrar la sección seleccionada con animación
    $(`#${seccionId}`).show().addClass('animate__animated animate__fadeIn');
    
    // Actualizar título del header
    $('#pageTitleHeader').html(`
        <span class="title-icon">
            <i class="${icono}"></i>
        </span>
        ${titulo}
    `);
    
    // Actualizar navegación activa
    $('.nav-link').removeClass('active');
    $(`.nav-link[onclick*="${seccionId.includes('formulario') ? 'mostrarFormulario' : 'mostrarHistorial'}"]`).addClass('active');
}

function actualizarNavegacionActiva(elemento) {
    $('.nav-link').removeClass('active');
    elemento.addClass('active');
}

// Gestión del formulario
function guardarRegistro() {
    if (!validarFormulario()) {
        return;
    }
    
    mostrarCargando(true);
    
    const datosFormulario = obtenerDatosFormulario();
    
    // Simular llamada a API
    setTimeout(() => {
        try {
            if (editandoId) {
                actualizarRegistro(editandoId, datosFormulario);
            } else {
                crearNuevoRegistro(datosFormulario);
            }
            
            mostrarNotificacion('success', '¡Éxito!', 'Registro guardado correctamente');
            limpiarFormulario();
            cargarTablaRegistros();
            
        } catch (error) {
            mostrarNotificacion('error', 'Error', 'No se pudo guardar el registro');
            console.error('Error al guardar:', error);
        } finally {
            mostrarCargando(false);
        }
    }, 1000);
}

function obtenerDatosFormulario() {
    return {
        id: editandoId || generarId(),
        nombre_chofer: $('#nombre_chofer').val(),
        tipo: $('#tipo').val(),
        destino: $('#destino').val(),
        diligencia: $('#diligencia').val(),
        sustento: $('#sustento').val(),
        solicitud: $('#solicitud').val(),
        responsable: $('#responsable').val(),
        fecha_hora: new Date().toLocaleString('es-PE', {
            timeZone: 'America/Lima',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
}

function crearNuevoRegistro(datos) {
    registros.unshift(datos);
    guardarEnStorage();
    animarNuevoRegistro();
}

function actualizarRegistro(id, datos) {
    const index = registros.findIndex(r => r.id === id);
    if (index !== -1) {
        registros[index] = { ...datos, id };
        guardarEnStorage();
        editandoId = null;
    }
}

function limpiarFormulario() {
    $('#registroForm')[0].reset();
    $('#registroId').val('');
    editandoId = null;
    
    // Remover clases de validación
    $('.glass-input').removeClass('is-valid is-invalid');
    $('.form-group').removeClass('has-error has-success');
    
    // Animar limpieza
    $('.glass-input').addClass('animate__animated animate__pulse');
    setTimeout(() => {
        $('.glass-input').removeClass('animate__animated animate__pulse');
    }, 500);
    
    // Actualizar botón
    $('.gradient-btn').html('<i class="fas fa-save"></i> Guardar');
}

// Validación del formulario
function validarFormulario() {
    let esValido = true;
    const campos = ['nombre_chofer', 'tipo', 'destino', 'diligencia', 'sustento', 'solicitud', 'responsable'];
    
    campos.forEach(campo => {
        const elemento = $(`#${campo}`);
        if (!elemento.val().trim()) {
            marcarCampoInvalido(elemento);
            esValido = false;
        } else {
            marcarCampoValido(elemento);
        }
    });
    
    if (!esValido) {
        mostrarNotificacion('warning', 'Campos incompletos', 'Por favor completa todos los campos requeridos');
        // Hacer scroll al primer campo inválido
        $('.is-invalid').first().focus();
    }
    
    return esValido;
}

function validarCampoEnTiempoReal(elemento) {
    const valor = elemento.val().trim();
    
    if (valor) {
        marcarCampoValido(elemento);
    } else {
        elemento.removeClass('is-valid is-invalid');
    }
}

function marcarCampoValido(elemento) {
    elemento.removeClass('is-invalid').addClass('is-valid');
    elemento.closest('.form-group').removeClass('has-error').addClass('has-success');
}

function marcarCampoInvalido(elemento) {
    elemento.removeClass('is-valid').addClass('is-invalid');
    elemento.closest('.form-group').removeClass('has-success').addClass('has-error');
    
    // Efecto de vibración
    elemento.addClass('animate__animated animate__shakeX');
    setTimeout(() => {
        elemento.removeClass('animate__animated animate__shakeX');
    }, 600);
}

// Gestión de la tabla de registros
function cargarTablaRegistros() {
    const tbody = $('#tablaRegistros');
    tbody.empty();
    
    if (registros.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="10" class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-inbox fa-3x mb-3" style="color: var(--text-secondary); opacity: 0.5;"></i>
                        <h5 style="color: var(--text-secondary);">No hay registros</h5>
                        <p style="color: var(--text-secondary); opacity: 0.7;">Comienza agregando un nuevo registro de movilidad</p>
                    </div>
                </td>
            </tr>
        `);
        return;
    }
    
    registros.forEach((registro, index) => {
        const fila = crearFilaTabla(registro, index);
        tbody.append(fila);
    });
    
    // Animar aparición de filas
    tbody.find('tr').each(function(index) {
        $(this).css('animation-delay', `${index * 0.1}s`).addClass('animate-slide-left');
    });
}

function crearFilaTabla(registro, index) {
    const badgeClass = registro.tipo === 'Entrada' ? 'badge-entrada' : 'badge-salida';
    const iconoTipo = registro.tipo === 'Entrada' ? 'fa-sign-in-alt' : 'fa-sign-out-alt';
    
    return `
        <tr data-id="${registro.id}" style="animation-delay: ${index * 0.1}s">
            <td><strong>#${registro.id}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="user-avatar-sm me-2">
                        <i class="fas fa-user-circle fa-2x" style="color: var(--primary-color);"></i>
                    </div>
                    <div>
                        <strong>${registro.nombre_chofer}</strong>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge ${badgeClass}">
                    <i class="fas ${iconoTipo}"></i>
                    ${registro.tipo}
                </span>
            </td>
            <td>
                <i class="fas fa-map-marker-alt me-1" style="color: var(--accent-color);"></i>
                ${registro.destino}
            </td>
            <td>${registro.diligencia}</td>
            <td>${registro.sustento}</td>
            <td>${registro.solicitud}</td>
            <td>
                <i class="fas fa-user-tie me-1" style="color: var(--secondary-color);"></i>
                ${registro.responsable}
            </td>
            <td>
                <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>
                    ${registro.fecha_hora}
                </small>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="editarRegistro('${registro.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="eliminarRegistro('${registro.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Funciones CRUD
function editarRegistro(id) {
    const registro = registros.find(r => r.id === id);
    if (!registro) return;
    
    // Llenar formulario con datos del registro
    $('#nombre_chofer').val(registro.nombre_chofer);
    $('#tipo').val(registro.tipo);
    $('#destino').val(registro.destino);
    $('#diligencia').val(registro.diligencia);
    $('#sustento').val(registro.sustento);
    $('#solicitud').val(registro.solicitud);
    $('#responsable').val(registro.responsable);
    $('#registroId').val(id);
    
    editandoId = id;
    
    // Cambiar texto del botón
    $('.gradient-btn').html('<i class="fas fa-edit"></i> Actualizar');
    
    // Cambiar a la vista del formulario
    mostrarFormulario();
    
    // Notificación
    mostrarNotificacion('info', 'Modo Edición', `Editando registro de ${registro.nombre_chofer}`);
    
    // Scroll al formulario
    $('html, body').animate({
        scrollTop: $('#formularioRegistro').offset().top - 100
    }, 500);
}

function eliminarRegistro(id) {
    const registro = registros.find(r => r.id === id);
    if (!registro) return;
    
    Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará el registro de ${registro.nombre_chofer}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        backdrop: 'rgba(15, 23, 42, 0.8)'
    }).then((result) => {
        if (result.isConfirmed) {
            // Animar eliminación
            const fila = $(`tr[data-id="${id}"]`);
            fila.addClass('animate__animated animate__fadeOutRight');
            
            setTimeout(() => {
                registros = registros.filter(r => r.id !== id);
                guardarEnStorage();
                cargarTablaRegistros();
                
                mostrarNotificacion('success', 'Eliminado', 'Registro eliminado correctamente');
            }, 500);
        }
    });
}

function recargarHistorial() {
    mostrarCargando(true);
    
    // Simular recarga
    setTimeout(() => {
        cargarRegistros();
        cargarTablaRegistros();
        mostrarCargando(false);
        mostrarNotificacion('info', 'Actualizado', 'Historial actualizado correctamente');
    }, 800);
}

// Gestión de almacenamiento local
function guardarEnStorage() {
    try {
        localStorage.setItem('transpocontrol_registros', JSON.stringify(registros));
    } catch (error) {
        console.warn('No se pudo guardar en localStorage:', error);
    }
}

function cargarRegistros() {
    try {
        const datosGuardados = localStorage.getItem('transpocontrol_registros');
        if (datosGuardados) {
            registros = JSON.parse(datosGuardados);
        } else {
            // Datos de ejemplo si no hay registros guardados
            registros = generarDatosEjemplo();
            guardarEnStorage();
        }
    } catch (error) {
        console.warn('Error al cargar registros:', error);
        registros = generarDatosEjemplo();
    }
}

function generarDatosEjemplo() {
    return [
        {
            id: generarId(),
            nombre_chofer: 'Juan Pérez',
            tipo: 'Salida',
            destino: 'Centro de Lima',
            diligencia: 'Reunión con proveedores',
            sustento: 'Memorándum N° 001-2024',
            solicitud: 'SOL-001-2024',
            responsable: 'María González',
            fecha_hora: new Date(Date.now() - 86400000).toLocaleString('es-PE')
        },
        {
            id: generarId(),
            nombre_chofer: 'Carlos Rodríguez',
            tipo: 'Entrada',
            destino: 'Oficina Principal',
            diligencia: 'Retorno de comisión',
            sustento: 'Informe de actividades',
            solicitud: 'SOL-002-2024',
            responsable: 'Ana Martínez',
            fecha_hora: new Date(Date.now() - 43200000).toLocaleString('es-PE')
        }
    ];
}

// Utilidades
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function mostrarCargando(mostrar) {
    const overlay = $('#loadingOverlay');
    if (mostrar) {
        overlay.addClass('show');
    } else {
        overlay.removeClass('show');
    }
}

function mostrarNotificacion(tipo, titulo, mensaje) {
    const iconos = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    
    Swal.fire({
        icon: iconos[tipo] || 'info',
        title: titulo,
        text: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        backdrop: 'transparent'
    });
}

function actualizarPlaceholdersSegunTipo(tipo) {
    const placeholders = {
        'Entrada': {
            destino: 'Lugar de procedencia',
            diligencia: 'Actividad realizada',
            sustento: 'Documento que sustenta el regreso'
        },
        'Salida': {
            destino: 'Lugar de destino',
            diligencia: 'Actividad a realizar',
            sustento: 'Documento que autoriza la salida'
        }
    };
    
    if (placeholders[tipo]) {
        $('#destino').attr('placeholder', placeholders[tipo].destino);
        $('#diligencia').attr('placeholder', placeholders[tipo].diligencia);
        $('#sustento').attr('placeholder', placeholders[tipo].sustento);
        
        // Efecto visual
        $('.glass-input').addClass('animate__animated animate__pulse');
        setTimeout(() => {
            $('.glass-input').removeClass('animate__animated animate__pulse');
        }, 600);
    }
}

function configurarAnimaciones() {
    // Animación de entrada para elementos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    });
    
    // Observar elementos que necesitan animación
    document.querySelectorAll('.glass-card, .glass-widget').forEach(el => {
        observer.observe(el);
    });
}

function animarNuevoRegistro() {
    // Efecto de confetti para nuevo registro
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// Funciones adicionales para mejorar UX
function exportarDatos() {
    if (registros.length === 0) {
        mostrarNotificacion('warning', 'Sin datos', 'No hay registros para exportar');
        return;
    }
    
    const datosCSV = convertirACSV(registros);
    descargarArchivo(datosCSV, 'registros_movilidad.csv', 'text/csv');
    mostrarNotificacion('success', 'Exportado', 'Datos exportados correctamente');
}

function convertirACSV(datos) {
    const headers = ['ID', 'Chofer', 'Tipo', 'Destino', 'Diligencia', 'Sustento', 'Solicitud', 'Responsable', 'Fecha y Hora'];
    const csv = [headers.join(',')];
    
    datos.forEach(registro => {
        const fila = [
            registro.id,
            `"${registro.nombre_chofer}"`,
            registro.tipo,
            `"${registro.destino}"`,
            `"${registro.diligencia}"`,
            `"${registro.sustento}"`,
            `"${registro.solicitud}"`,
            `"${registro.responsable}"`,
            `"${registro.fecha_hora}"`
        ];
        csv.push(fila.join(','));
    });
    
    return csv.join('\n');
}

function descargarArchivo(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
}

// Búsqueda en tiempo real
function configurarBusqueda() {
    const inputBusqueda = $('<input>', {
        type: 'text',
        class: 'form-control glass-input',
        placeholder: 'Buscar registros...',
        id: 'busquedaInput'
    });
    
    $('#historialRegistros .header-actions').prepend(
        $('<div>', { class: 'search-container me-3' }).append(
            $('<i>', { class: 'fas fa-search search-icon' }),
            inputBusqueda
        )
    );
    
    inputBusqueda.on('input', function() {
        const termino = $(this).val().toLowerCase();
        filtrarRegistros(termino);
    });
}

function filtrarRegistros(termino) {
    const registrosFiltrados = registros.filter(registro => 
        Object.values(registro).some(valor => 
            valor.toString().toLowerCase().includes(termino)
        )
    );
    
    mostrarRegistrosFiltrados(registrosFiltrados);
}

function mostrarRegistrosFiltrados(registrosFiltrados) {
    const tbody = $('#tablaRegistros');
    tbody.empty();
    
    if (registrosFiltrados.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="10" class="text-center py-5">
                    <i class="fas fa-search fa-2x mb-3" style="color: var(--text-secondary); opacity: 0.5;"></i>
                    <h5 style="color: var(--text-secondary);">No se encontraron resultados</h5>
                </td>
            </tr>
        `);
        return;
    }
    
    registrosFiltrados.forEach((registro, index) => {
        const fila = crearFilaTabla(registro, index);
        tbody.append(fila);
    });
}

// Estadísticas básicas
function mostrarEstadisticas() {
    const stats = calcularEstadisticas();
    
    Swal.fire({
        title: 'Estadísticas del Sistema',
        html: `
            <div class="stats-container">
                <div class="stat-item">
                    <i class="fas fa-chart-bar"></i>
                    <h3>${stats.total}</h3>
                    <p>Total de Registros</p>
                </div>
                <div class="stat-item">
                    <i class="fas fa-sign-out-alt text-danger"></i>
                    <h3>${stats.salidas}</h3>
                    <p>Salidas</p>
                </div>
                <div class="stat-item">
                    <i class="fas fa-sign-in-alt text-success"></i>
                    <h3>${stats.entradas}</h3>
                    <p>Entradas</p>
                </div>
                <div class="stat-item">
                    <i class="fas fa-users"></i>
                    <h3>${stats.choferes}</h3>
                    <p>Choferes Únicos</p>
                </div>
            </div>
        `,
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        showConfirmButton: true,
        confirmButtonText: 'Cerrar'
    });
}

function calcularEstadisticas() {
    const chofereUnicos = [...new Set(registros.map(r => r.nombre_chofer))];
    
    return {
        total: registros.length,
        salidas: registros.filter(r => r.tipo === 'Salida').length,
        entradas: registros.filter(r => r.tipo === 'Entrada').length,
        choferes: chofereUnicos.length
    };
}

// Tema oscuro/claro (opcional)
function toggleTema() {
    document.body.classList.toggle('tema-claro');
    const esClaro = document.body.classList.contains('tema-claro');
    localStorage.setItem('tema', esClaro ? 'claro' : 'oscuro');
}

// Inicializar tema guardado
function inicializarTema() {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'claro') {
        document.body.classList.add('tema-claro');
    }
}

// Event listeners adicionales para funciones avanzadas
$(document).ready(function() {
    // Configurar búsqueda cuando se muestre el historial
    $(document).on('click', '[onclick*="mostrarHistorial"]', function() {
        setTimeout(configurarBusqueda, 100);
    });
    
    // Atajos de teclado
    $(document).on('keydown', function(e) {
        if (e.ctrlKey) {
            switch(e.key) {
                case 'e':
                    e.preventDefault();
                    exportarDatos();
                    break;
                case 'h':
                    e.preventDefault();
                    mostrarHistorial();
                    break;
                case 'n':
                    e.preventDefault();
                    mostrarFormulario();
                    break;
            }
        }
    });
    
    // Inicializar tema
    inicializarTema();
});

console.log('✅ Sistema TranspoControl cargado completamente');