
/* =========================
   REFERENCIAS DOM
========================= */
const btnAgregar = document.getElementById("btnAgregar");
const btnVerProductos = document.getElementById("btnVerProductos");
const btnVolver = document.getElementById("btnVolver");

const formProducto = document.getElementById("formProducto");
const listaProductos = document.getElementById("listaProductos");
const contenedorAlertas = document.getElementById("alertas");

const selectDias = document.getElementById("diasAlerta");
const home = document.getElementById("home");
const vistaProductos = document.getElementById("vistaProductos");

/* =========================
   ESTADO
========================= */
let productos = [];

/* =========================
   CARGAR DATOS
========================= */
const guardados = localStorage.getItem("productos");
if (guardados) {
  productos = JSON.parse(guardados);
}

const diasGuardados = localStorage.getItem("diasAlerta");
if (diasGuardados) {
  selectDias.value = diasGuardados;
}

/* =========================
   NAVEGACIÓN
========================= */
btnVerProductos.addEventListener("click", () => {
  home.hidden = true;
  vistaProductos.hidden = false;
  mostrarProductos();
});

btnVolver.addEventListener("click", () => {
  vistaProductos.hidden = true;
  home.hidden = false;
});

/* =========================
   MOSTRAR FORMULARIO
========================= */
btnAgregar.addEventListener("click", () => {
  formProducto.hidden = false;
});

/* =========================
   GUARDAR DÍAS ALERTA
========================= */
selectDias.addEventListener("change", () => {
  localStorage.setItem("diasAlerta", selectDias.value);
  verificarVencimientos();
});

/* =========================
   GUARDAR PRODUCTO
========================= */
formProducto.addEventListener("submit", (e) => {
  e.preventDefault();

  const producto = {
    nombre: nombre.value.trim(),
    cantidad: cantidad.value,
    fechaVencimiento: fechaVencimiento.value
  };

  productos.push(producto);
  localStorage.setItem("productos", JSON.stringify(productos));

  // Avisar al Service Worker
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      tipo: "guardarProductos",
      productos: productos
    });
  }

  formProducto.reset();
  formProducto.hidden = true;

  verificarVencimientos();
});

/* =========================
   MOSTRAR PRODUCTOS
========================= */
function mostrarProductos() {
  listaProductos.innerHTML = "";

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  productos.forEach((p, index) => {
    const vence = new Date(p.fechaVencimiento);
    vence.setHours(0, 0, 0, 0);

    const dias = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));

    let color = "#2ecc71";
    let estado = "OK";

    if (dias < 0) {
      color = "#e74c3c";
      estado = "VENCIDO";
    } else if (dias <= 7) {
      color = "#f1c40f";
      estado = "POR VENCER";
    }

    const div = document.createElement("div");
    div.style.borderLeft = `6px solid ${color}`;

    div.innerHTML = `
      <strong>${p.nombre}</strong><br>
      Cantidad: ${p.cantidad}<br>
      Vence: ${p.fechaVencimiento}<br>
      Estado: <strong>${estado}</strong><br>
      <button class="btnEliminar">Eliminar</button>
    `;

    const btnEliminar = div.querySelector(".btnEliminar");
    btnEliminar.addEventListener("click", () => {
      productos.splice(index, 1);
      localStorage.setItem("productos", JSON.stringify(productos));
      mostrarProductos();
      verificarVencimientos();
    });

    listaProductos.appendChild(div);
  });
}

/* =========================
   VERIFICAR VENCIMIENTOS
========================= */
function verificarVencimientos() {
  contenedorAlertas.innerHTML = "";

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasAlerta = Number(localStorage.getItem("diasAlerta")) || 5;

  productos.forEach((p) => {
    const vence = new Date(p.fechaVencimiento);
    vence.setHours(0, 0, 0, 0);

    const dias = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));

    if (dias >= 0 && dias <= diasAlerta) {
      const div = document.createElement("div");
      div.className = "alerta";
      if (dias <= 1) div.classList.add("urgente");

      div.textContent = `⚠️ ${p.nombre} vence en ${dias} día(s)`;
      contenedorAlertas.appendChild(div);
    }
  });
}

/* =========================
   SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("SW registrado"))
    .catch(err => console.error("Error SW", err));
}

/* =========================
   NOTIFICACIONES
========================= */
if ("Notification" in window) {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("🔔 Permiso de notificaciones concedido");
    }
  });
}

/* =========================
   INICIO
========================= */
verificarVencimientos();
  

  
  

  
