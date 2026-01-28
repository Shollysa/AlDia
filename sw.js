
self.addEventListener("install", () => {
    console.log("Service Worker instalado");
  });
  
  self.addEventListener("activate", () => {
    console.log("Service Worker activo");
  });
  
  let productos = [];

self.addEventListener("message", event => {
  if (event.data.tipo === "guardarProductos") {
    productos = event.data.productos;
  }
});

self.addEventListener("periodicsync", event => {
    if (event.tag === "revisar-vencimientos") {
      event.waitUntil(verificarProductos());
    }
  });

  function verificarProductos() {
    const hoy = new Date();
    const diasAlerta = 5;
  
    productos.forEach(p => {
      const vence = new Date(p.fechaVencimiento);
      const dias = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
  
      if (dias === diasAlerta) {
        self.registration.showNotification("⏰ AlDia", {
          body: `${p.nombre} vence en ${dias} días`,
          icon: "icon-192.png"
        });
      }
    });
  }

 
  
  
