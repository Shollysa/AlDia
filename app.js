
const btnAgregar = document.getElementById('btnAgregar');
const formProducto = document.getElementById('formProducto');
const listaProductos = document.getElementById('listaProductos');
const selectDias = document.getElementById("diasAlerta");

let productos = [];

/* ===== CARGAR PRODUCTOS ===== */
const guardados = localStorage.getItem('productos');
if (guardados) {
  productos = JSON.parse(guardados);
  mostrarProductos();

  document.addEventListener("DOMContentLoaded", () => {
    const diasGuardados = localStorage.getItem("diasAlerta") || "5";
    selectDias.value = diasGuardados;
  });
  

}

/* ===== MOSTRAR FORM ===== */
btnAgregar.addEventListener('click', () => {
  formProducto.hidden = false;

  selectDias.addEventListener("change", () => {
    localStorage.setItem("diasAlerta", selectDias.value);
  });
  
});

/* ===== GUARDAR ===== */
formProducto.addEventListener('submit', (e) => {
  e.preventDefault();

  const producto = {
    nombre: nombre.value.trim(),
    cantidad: cantidad.value,
    fechaVencimiento: fechaVencimiento.value
  };

  productos.push(producto);
  localStorage.setItem('productos', JSON.stringify(productos));

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      tipo: "PROGRAMAR_ALERTA",
      producto: producto,
      diasAlerta: Number(selectDias.value)
    });
  }
  
  
  mostrarProductos();
  formProducto.reset();
  formProducto.hidden = true;
});



/* ===== MOSTRAR ===== */
function mostrarProductos() {
  listaProductos.innerHTML = '';
  verificarVencimientos(productos);

  productos.forEach((p, index) => {
    const hoy = new Date();
    const vence = new Date(p.fechaVencimiento);
    const dias = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));

    let color = dias < 0 ? '#e74c3c' : dias <= 7 ? '#f1c40f' : '#2ecc71';
    let estado = dias < 0 ? 'VENCIDO' : dias <= 7 ? 'POR VENCER' : 'OK';

    const div = document.createElement('div');
    div.style.borderLeft = `6px solid ${color}`;
    div.style.background = '#fff';
    div.style.padding = '0.8rem';
    div.style.marginBottom = '0.5rem';

    div.innerHTML = `
  <strong>${p.nombre}</strong><br>
  Cantidad: ${p.cantidad}<br>
  Vence: ${p.fechaVencimiento}<br>
  Días: ${dias}<br>
  Estado: <strong>${estado}</strong><br>
  <button class="btnEliminar">Eliminar</button>
`;

const btnEliminar = div.querySelector('.btnEliminar');

btnEliminar.addEventListener('click', () => {
  productos.splice(index, 1);
  localStorage.setItem('productos', JSON.stringify(productos));
  mostrarProductos();
});


    listaProductos.appendChild(div);
  });  

}

function verificarVencimientos(productos) {
    const contenedor = document.getElementById("alertas");
    contenedor.innerHTML = "";
  
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
  
    const diasAlerta = Number(localStorage.getItem("diasAlerta")) || 5;
  
    productos.forEach(producto => {
      const fechaVenc = new Date(producto.fechaVencimiento);
      fechaVenc.setHours(0, 0, 0, 0);
  
      const diferencia = Math.ceil(
        (fechaVenc - hoy) / (1000 * 60 * 60 * 24)
      );
  
      if (diferencia <= diasAlerta && diferencia >= 0) {
        const div = document.createElement("div");
        div.className = "alerta";
  
        if (diferencia <= 1) {
          div.classList.add("urgente");
        }
  
        div.innerText = `⚠️ ${producto.nombre} vence en ${diferencia} día(s)`;
  
        contenedor.appendChild(div);
      }
    }); 
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("SW registrado"))
      .catch(err => console.error("Error SW", err));
  }


  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("🔔 Permiso de notificaciones concedido");
      } else {
        console.log("❌ Permiso de notificaciones denegado");
      }
    });
  }
  

  
  
  