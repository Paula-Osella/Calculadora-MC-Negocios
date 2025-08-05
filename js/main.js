document.addEventListener("DOMContentLoaded", function () {
    // --- Elementos del DOM ---
    const compraForm = document.getElementById("compraForm");
    const facturaContainer = document.getElementById("factura-container");
    const facturaPreview = document.getElementById("factura-preview");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const newCalculationBtn = document.getElementById("newCalculationBtn");
    const themeToggleBtn = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moonIcon"); // Corregido el ID si es necesario, asegúrate que coincida con tu HTML
    const historialContainer = document.getElementById("historial-container"); // Asegúrate de tener este ID en tu HTML
    const tablaHistorialBody = document.getElementById("tablaHistorialBody");
    const filtroHistorialForm = document.getElementById("filtroHistorial");
    const filtroFechaDesde = document.getElementById("filtroFechaDesde");
    const filtroFechaHasta = document.getElementById("filtroFechaHasta");
    const filtroCartaPorte = document.getElementById("filtroCartaPorte");
    const limpiarFiltrosBtn = document.getElementById("limpiarFiltros"); // ID actualizado para coincidir con tu HTML
    const verTodasFacturasBtn = document.getElementById("verTodasFacturas"); // ID actualizado para coincidir con tu HTML

    // Array para almacenar el historial de facturas
    let facturasGuardadas = [];

    // Función para cargar facturas del historial (simulado)
    function cargarHistorialSimulado() {
        // Datos de ejemplo para el historial. Puedes cargar esto desde localStorage si ya lo tienes implementado.
        facturasGuardadas = JSON.parse(localStorage.getItem('historialFacturas')) || [
            { fecha: "2025-07-16", cartaPorte: "450", producto: "Soja", kilos: 4, precio: 200, descuento: 4, impuesto: 0, totalFinal: 768 },
            { fecha: "2025-07-30", cartaPorte: "200", producto: "Maíz", kilos: 5, precio: 600, descuento: 7, impuesto: 0, totalFinal: 2790 },
            { fecha: "2025-07-30", cartaPorte: "5004", producto: "Trigo", kilos: 7, precio: 200, descuento: 4, impuesto: 0, totalFinal: 1344 },
            { fecha: "2025-07-30", cartaPorte: "589", producto: "Cebada", kilos: 4, precio: 1500, descuento: 4, impuesto: 0, totalFinal: 5760 },
            { fecha: "2025-07-30", cartaPorte: "200", producto: "Maíz", kilos: 7, precio: 500, descuento: 7, impuesto: 0, totalFinal: 3255 },
            { fecha: "2025-07-30", cartaPorte: "789", producto: "Trigo", kilos: 7, precio: 1000, descuento: 7, impuesto: 0, totalFinal: 6510 },
            { fecha: "2025-07-30", cartaPorte: "123", producto: "Soja", kilos: 4, precio: 500, descuento: 0, impuesto: 0, totalFinal: 2000 },
        ];
        mostrarHistorial(facturasGuardadas);
    }

    // Función para mostrar el historial en la tabla
    function mostrarHistorial(facturasAMostrar) {
        const tbody = document.getElementById('tablaHistorialBody');
        tbody.innerHTML = ''; // Limpiar tabla

        if (facturasAMostrar.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No se encontraron facturas</td></tr>`;
            return;
        }

        facturasAMostrar.forEach(factura => {
            const tr = document.createElement('tr');
            tr.classList.add('border-b', 'border-[#b89b5e]');

            tr.innerHTML = `
                <td class="border px-3 py-1 whitespace-nowrap">${factura.fecha}</td>
                <td class="border px-3 py-1 whitespace-nowrap">${factura.cartaPorte}</td>
                <td class="border px-3 py-1 whitespace-nowrap">${factura.producto}</td>
                <td class="border px-3 py-1 whitespace-nowrap">${factura.kilos.toLocaleString('es-AR')}</td>
                <td class="border px-3 py-1 whitespace-nowrap">$${factura.precio.toFixed(2)}</td>
                <td class="border px-3 py-1 whitespace-nowrap">${factura.descuento}%</td>
                <td class="border px-3 py-1 whitespace-nowrap">${factura.impuesto}%</td>
                <td class="border px-3 py-1 whitespace-nowrap">$${factura.totalFinal.toFixed(2)}</td>
                <td class="border px-3 py-1 whitespace-nowrap text-center">
                    <button class="eliminar-btn" data-carta="${factura.cartaPorte}">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.eliminar-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const carta = this.getAttribute('data-carta');

                Swal.fire({
                    title: '¿Estás seguro?',
                    text: `Vas a eliminar la factura N° ${carta}`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#c19a43',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        popup: 'my-responsive-popup'
                    }
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        eliminarFactura(carta);
                        Swal.fire({
                            title: '🗑️ Eliminada',
                            text: `La factura fue eliminada correctamente.`,
                            icon: 'success',
                            confirmButtonColor: '#c19a43',
                            customClass: {
                                popup: 'my-responsive-popup'
                            }
                        });
                    }
                });
            });
        });
    }

    // Cargar historial al inicio
    cargarHistorialSimulado();

    // Establecer la fecha actual por defecto en el campo de fecha
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-11
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById("fecha").value = `${yyyy}-${mm}-${dd}`;

    // -------------------------------
    //       MODO OSCURO (THEME)
    // -------------------------------
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            document.body.classList.remove('dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    });

    // -------------------------------
    //       MENSAJES DE ESTADO
    // -------------------------------
    function showStatusMessage(message, type = "info") {
        let statusDiv = document.getElementById("statusMessage");
        if (!statusDiv) {
            statusDiv = document.createElement("div");
            statusDiv.id = "statusMessage";
            document.body.appendChild(statusDiv);
        }

        statusDiv.textContent = message;
        statusDiv.className = "show";

        if (type === "error") statusDiv.classList.add("error");
        else if (type === "success") statusDiv.classList.add("success");
        else statusDiv.classList.add("info");

        statusDiv.style.display = "block";

        setTimeout(() => {
            statusDiv.classList.remove("show");
            setTimeout(() => {
                statusDiv.style.display = "none";
            }, 400);
        }, 5000);
    }

    function hideStatusMessage() {
        const statusDiv = document.getElementById("statusMessage");
        if (statusDiv) {
            statusDiv.classList.remove("show");
            setTimeout(() => {
                statusDiv.style.display = "none";
            }, 400);
        }
    }

    // -------------------------------
    //       HISTORIAL DE FACTURAS (Funciones de CRUD en localStorage)
    // -------------------------------
    function guardarFacturaEnHistorial(factura) {
        const historial = JSON.parse(localStorage.getItem('historialFacturas')) || [];
        historial.push(factura);
        localStorage.setItem('historialFacturas', JSON.stringify(historial));
    }

    function cargarHistorial() {
        return JSON.parse(localStorage.getItem('historialFacturas')) || [];
    }

    function eliminarFactura(cartaPorte) {
        let historial = cargarHistorial();
        const nuevoHistorial = historial.filter(f => f.cartaPorte !== cartaPorte);
        localStorage.setItem('historialFacturas', JSON.stringify(nuevoHistorial));
        renderizarHistorial(nuevoHistorial);
        showStatusMessage("Factura eliminada correctamente.", "success");
    }

    function filtrarHistorial(event) {
        event.preventDefault();

        const desde = document.getElementById('filtroFechaDesde').value;
        const hasta = document.getElementById('filtroFechaHasta').value;
        const carta = document.getElementById('filtroCartaPorte').value.trim().toLowerCase();

        let facturas = cargarHistorial();

        if (desde) facturas = facturas.filter(f => f.fecha >= desde);
        if (hasta) facturas = facturas.filter(f => f.fecha <= hasta);
        if (carta) facturas = facturas.filter(f => f.cartaPorte.toLowerCase().includes(carta));

        renderizarHistorial(facturas);
    }

    function limpiarFiltros() {
        document.getElementById('filtroFechaDesde').value = '';
        document.getElementById('filtroFechaHasta').value = '';
        document.getElementById('filtroCartaPorte').value = '';
        renderizarHistorial(cargarHistorial());
    }

    // -------------------------------
    //       EVENTOS DEL FORMULARIO
    // -------------------------------
    compraForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fecha = document.getElementById("fecha").value;
        const cartaPorte = document.getElementById("cartaPorte").value.trim();
        const producto = document.getElementById("producto").value;
        const kilos = parseFloat(document.getElementById("kilos").value);
        const precio = parseFloat(document.getElementById("precio").value);
        const descuento = parseFloat(document.getElementById("descuento").value) || 0;
        const impuesto = parseFloat(document.getElementById("impuesto").value) || 0;

        if (isNaN(kilos) || isNaN(precio) || kilos <= 0 || precio <= 0) {
            showStatusMessage("Por favor, ingrese valores válidos y positivos para Kilogramos y Precio por Kilo.", "error");
            return;
        }

        const subtotal = kilos * precio;
        const descuentoMonto = subtotal * (descuento / 100);
        const impuestoMonto = subtotal * (impuesto / 100);
        const totalFinal = subtotal - descuentoMonto + impuestoMonto;

        // Generar el HTML de la factura para previsualización con estilos en línea para impresión
        facturaPreview.innerHTML = `
            <div style="padding: 20px; font-family: 'Inter', sans-serif; border: 1px solid black; margin: 0 auto; max-width: 600px; background-color: white; border-radius: 0; box-shadow: none; color: black;">
                <h2 style="text-align: center; font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; color: black;">Comprobante de Compra – No Fiscal</h2>
                <p style="margin-bottom: 0.5rem; color: black;"><strong>Fecha:</strong> ${fecha}</p>
                <p style="margin-bottom: 0.5rem; color: black;"><strong>N° Carta de Porte:</strong> ${cartaPorte}</p>
                <hr style="border-top: 1px solid black; margin: 10px 0;">
                <p style="margin-bottom: 0.5rem; color: black;"><strong>Producto:</strong> ${producto}</p>
                <p style="margin-bottom: 0.5rem; color: black;"><strong>Kilogramos:</strong> ${kilos.toLocaleString('es-AR', { maximumFractionDigits: 2 })} kg</p>
                <p style="margin-bottom: 0.5rem; color: black;"><strong>Precio por kilo:</strong> $${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p style="margin-bottom: 0.5rem; color: black;"><strong>Subtotal:</strong> $${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p style="margin-bottom: 0.5rem; color: black;"><strong>Descuento (${descuento}%):</strong> -$${descuentoMonto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p style="margin-bottom: 0.5rem; color: black;"><strong>Impuesto (${impuesto}%):</strong> +$${impuestoMonto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <hr style="border-top: 1px solid black; margin: 10px 0;">
                <h3 style="text-align: right; font-size: 1.5rem; font-weight: 700; color: black;"><strong>Total Final:</strong> $${totalFinal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
        `;

        guardarFacturaEnHistorial({
            fecha,
            cartaPorte,
            producto,
            kilos,
            precio,
            descuento,
            impuesto,
            totalFinal
        });

        facturaContainer.style.display = "flex";
        compraForm.style.display = "none";
        // Asegúrate de que el historial se oculte cuando se muestra la factura
        if (document.getElementById("historial-container")) {
            document.getElementById("historial-container").style.display = "none";
        }
    });

    // Manejador para el botón de descarga del PDF
    downloadPdfBtn.addEventListener("click", function () {
        // Asegúrate de que el contenedor de la factura esté visible para html2canvas
        facturaContainer.style.display = "flex";

        // Pequeño retraso para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                console.error("Error: La librería jsPDF no está cargada o no está definida correctamente.");
                showStatusMessage("Error: La librería jsPDF no está cargada. Revise la consola del navegador.", "error");
                return;
            }

            const { jsPDF } = window.jspdf;

            html2canvas(facturaPreview, {
                scale: 2, // Aumentar la escala para mejor calidad del PDF
                useCORS: true // Importante si tienes imágenes de diferentes orígenes
            }).then(canvas => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgWidth = pdf.internal.pageSize.getWidth(); // Ancho real de la página A4 en mm
                const pageHeight = pdf.internal.pageSize.getHeight(); // Alto real de la página A4 en mm

                const imgHeight = canvas.height * imgWidth / canvas.width; // Alto de la imagen escalada para ajustarse al ancho del PDF
                let heightLeft = imgHeight; // Alto restante de la imagen por colocar

                let position = 0; // Posición Y inicial en la página del PDF (0 para el inicio)

                // Añadir la primera parte de la imagen al PDF
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight; // Restar la altura de la primera página

                // Si queda contenido, añadir nuevas páginas y desplazar la imagen hacia arriba
                while (heightLeft > 0) {
                    position = position - pageHeight; // Mover la imagen hacia arriba por la altura de una página
                    pdf.addPage(); // Añadir una nueva página
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight); // Añadir la imagen con la nueva posición
                    heightLeft -= pageHeight; // Restar la altura de la página actual
                }

                const cartaPorte = document.getElementById("cartaPorte").value.trim() || "sin-carta";
                pdf.save(`factura-${cartaPorte}.pdf`);
                showStatusMessage("Factura descargada correctamente.", "success");
            }).catch(error => {
                console.error("Error al generar el PDF:", error);
                showStatusMessage("Hubo un error al generar el PDF. Por favor, inténtelo de nuevo.", "error");
            });
        }, 50); // Pequeño retraso para asegurar la renderización
    });

    // Manejador para el botón "Nueva Cálculo"
    newCalculationBtn.addEventListener("click", function () {
        compraForm.reset(); // Restablecer campos del formulario
        document.getElementById("fecha").value = `${yyyy}-${mm}-${dd}`; // Restablecer fecha actual
        facturaContainer.style.display = "none"; // Ocultar previsualización de factura
        compraForm.style.display = "grid"; // Mostrar formulario de compra
        facturaPreview.innerHTML = ''; // Limpiar contenido de previsualización
        hideStatusMessage(); // Ocultar mensajes de estado
        // Asegúrate de que el historial se muestre al volver al formulario
        if (document.getElementById("historial-container")) {
            document.getElementById("historial-container").style.display = "block"; // O "flex" si es tu estilo original
        }
    });

    // -------------------------------
    //       EVENTOS DE FILTROS
    // -------------------------------
    document.getElementById('filtroHistorial').addEventListener('submit', filtrarHistorial);
    document.getElementById('limpiarFiltros').addEventListener('click', limpiarFiltros);

    document.getElementById('verTodasFacturas').addEventListener('click', function () {
        const todas = cargarHistorial();
        if (todas.length === 0) {
            showStatusMessage("No hay facturas guardadas para mostrar.", "info");
        }
        renderizarHistorial(todas);
    });

    // Render inicial del historial al cargar la página
    renderizarHistorial(cargarHistorial());
});
