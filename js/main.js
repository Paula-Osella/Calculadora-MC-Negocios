document.addEventListener("DOMContentLoaded", function () {
    // --- Elementos del DOM ---
    const compraForm = document.getElementById("compraForm");
    const facturaContainer = document.getElementById("factura-container");
    const facturaPreview = document.getElementById("factura-preview");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const sharePdfBtn = document.getElementById("sharePdfBtn"); // Nuevo botón para compartir
    const newCalculationBtn = document.getElementById("newCalculationBtn");
    const themeToggleBtn = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    // --- Setear fecha actual por defecto ---
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
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
    //       HISTORIAL DE FACTURAS
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

    function renderizarHistorial(facturas) {
        const tbody = document.getElementById('tablaHistorialBody');
        tbody.innerHTML = '';

        if (facturas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No se encontraron facturas</td></tr>`;
            return;
        }

        facturas.forEach(factura => {
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

        // Modificación del PDF monocromático
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

        renderizarHistorial(cargarHistorial());
    });

    // Evento para descargar el PDF (funcionalidad original)
    downloadPdfBtn.addEventListener("click", function () {
        const cartaPorte = document.getElementById("cartaPorte").value.trim();
        if (!cartaPorte) {
            showStatusMessage("Debe ingresar el N° de Carta de Porte para descargar la factura.", "error");
            return;
        }

        facturaContainer.style.display = "flex";

        setTimeout(() => {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error("Error: jsPDF no está definido.");
                showStatusMessage("Error: jsPDF no está cargado.", "error");
                return;
            }

            const { jsPDF } = window.jspdf;

            const content = facturaPreview.innerHTML;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            tempDiv.style.width = '800px';
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            html2canvas(tempDiv, { scale: 2, useCORS: true }).then(canvas => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save(`factura-${cartaPorte}.pdf`);
                showStatusMessage("Factura descargada correctamente.", "success");
                
                document.body.removeChild(tempDiv);
            }).catch(error => {
                console.error("Error al generar el PDF:", error);
                showStatusMessage("Hubo un error al generar el PDF.", "error");
                if(tempDiv && tempDiv.parentNode) {
                    document.body.removeChild(tempDiv);
                }
            });

        }, 50);
    });

    // --- INICIO DE LA NUEVA FUNCIONALIDAD DE COMPARTIR ---
    sharePdfBtn.addEventListener("click", async function () {
        const cartaPorte = document.getElementById("cartaPorte").value.trim();
        if (!cartaPorte) {
            showStatusMessage("Debe ingresar el N° de Carta de Porte para compartir la factura.", "error");
            return;
        }

        // Primero, verificamos si la Web Share API está disponible
        if (!navigator.share) {
            showStatusMessage("La función de compartir no es compatible con este navegador.", "error");
            return;
        }

        facturaContainer.style.display = "flex";

        try {
            // Se usa el mismo proceso de html2canvas y jsPDF para obtener los datos del PDF
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = facturaPreview.innerHTML;
            tempDiv.style.width = '800px';
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);

            const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Obtenemos el PDF como un Blob para poder compartirlo como archivo
            const pdfBlob = pdf.output('blob');
            const file = new File([pdfBlob], `factura-${cartaPorte}.pdf`, { type: 'application/pdf' });

            // Ahora llamamos a la API de compartir con la información que queremos
            await navigator.share({
                files: [file],
                title: `Factura ${cartaPorte}`,
                text: `Adjunto la factura N° ${cartaPorte} generada.`,
            });
            
            showStatusMessage("Factura compartida correctamente.", "success");
        } catch (error) {
            // Este catch se ejecuta si el usuario cancela la acción de compartir
            if (error.name !== "AbortError") {
                console.error("Error al compartir el PDF:", error);
                showStatusMessage("Hubo un error al intentar compartir el PDF.", "error");
            }
        } finally {
            const tempDiv = document.querySelector('div[style*="left: -9999px"]');
            if(tempDiv && tempDiv.parentNode) {
                document.body.removeChild(tempDiv);
            }
        }
    });
    // --- FIN DE LA NUEVA FUNCIONALIDAD ---

    newCalculationBtn.addEventListener("click", function () {
        compraForm.reset();
        document.getElementById("fecha").value = `${yyyy}-${mm}-${dd}`;
        facturaContainer.style.display = "none";
        compraForm.style.display = "grid";
        facturaPreview.innerHTML = '';
        hideStatusMessage();
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

    // Render inicial
    renderizarHistorial(cargarHistorial());
});
