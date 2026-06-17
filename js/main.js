// === CONFIGURACION ===
const API_KEY = 'AIzaSyDaggxXuKMVA_2K4QZuauOAM9451FFCpNI';
const CANAL_LAKE_CAKE = 'UCZxOEYb3lXZpAQS8DU7SM-g';
const CANAL_RESUMENES = 'UCUwYtq44B24qsTgt35CjT_g';

// === DDETECTAR EN QUE PAGINA ESTAMOS ===
const paginaActual = window.location.pathname;

if (paginaActual.includes('lake_cake.html')) {
    cargarCanal(CANAL_LAKE_CAKE);
}   else if (paginaActual.includes('resumenes.html')) {
    cargarCanal(CANAL_RESUMENES);
}

// === CARGAR DATOS DEL CANAL ===
async function cargarCanal(canalId) {
    try {
        // PEDIR INFO DEL CANAL
        const respuesta = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${canalId}&key=${API_KEY}`
        );
        const data = await respuesta.json();
        const canal = data.items[0];

        // LLENAR LA INFO DEL CANAL
        document.getElementById('canal-nombre').textContent = canal.snippet.title;
        document.getElementById('canal-descripcion').textContent = canal.snippet.description;
        document.getElementById('canal-suscriptores').textContent =
            `${Number(canal.statistics.subscriberCount).toLocaleString()} suscriptores`;
        document.getElementById('canal-foto').src = canal.snippet.thumbnails.default.url;

        // CARGAR VIDEOS
        cargarVideos(canalId);

        } catch (error) {
            console.error('Error al cargar el canal:', error);
    } 
    
}

// === CARGAR VIDEOS ===
async function cargarVideos(canalId) {
  try {
    // ULTIMOS 10 VIDEOS
    const respuestaReciente = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${canalId}&maxResults=50&order=date&type=video&key=${API_KEY}`
    );
    const dataRecientes = await respuestaReciente.json();
    const todosLosVideos = dataRecientes.items;

    // OBTENER IDS
    const ids = todosLosVideos.map(v => v.id.videoId).join(',');

    // PEDIR DURACION
    const respuestaDuracion = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${API_KEY}`
    );
    const dataDuracion = await respuestaDuracion.json();

    // FILTRAR SHORTS
    const videosFiltrados = todosLosVideos.filter(video => {
      const detalle = dataDuracion.items.find(d => d.id === video.id.videoId);
      if (!detalle) return false;
      const duracion = detalle.contentDetails.duration;
      const minutos = duracion.includes('M') ? parseInt(duracion.split('M')[0].replace(/\D/g, '')) : 0;
      const segundos = duracion.includes('S') ? parseInt(duracion.split('S')[0].split('M').pop().replace(/\D/g, '')) : 0;
      return (minutos * 60 + segundos) > 60;
    });

    // ULTIMO VIDEO
    document.getElementById('video-reciente').innerHTML = `
      <iframe src="https://www.youtube.com/embed/${videosFiltrados[0].id.videoId}" allowfullscreen></iframe>
    `;

    // 3 VIDEOS RECIENTES
    document.getElementById('videos-grid').innerHTML = videosFiltrados.slice(1, 4).map(video => `
      <iframe src="https://www.youtube.com/embed/${video.id.videoId}" allowfullscreen></iframe>
    `).join('');

    // VIDEO MAS POPULAR
    const respuestaPopular = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${canalId}&maxResults=10&order=viewCount&type=video&key=${API_KEY}`
    );
    const dataPopular = await respuestaPopular.json();
    const idsPopular = dataPopular.items.map(v => v.id.videoId).join(',');

    const respuestaDuracionPopular = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${idsPopular}&key=${API_KEY}`
    );
    const dataDuracionPopular = await respuestaDuracionPopular.json();

    const popularFiltrado = dataPopular.items.find(video => {
      const detalle = dataDuracionPopular.items.find(d => d.id === video.id.videoId);
      if (!detalle) return false;
      const duracion = detalle.contentDetails.duration;
      const minutos = duracion.includes('M') ? parseInt(duracion.split('M')[0].replace(/\D/g, '')) : 0;
      const segundos = duracion.includes('S') ? parseInt(duracion.split('S')[0].split('M').pop().replace(/\D/g, '')) : 0;
      return (minutos * 60 + segundos) > 60;
    });

    document.getElementById('video-top').innerHTML = `
      <iframe src="https://www.youtube.com/embed/${popularFiltrado.id.videoId}" allowfullscreen></iframe>
    `;

  } catch (error) {
    console.error('Error al cargar los videos:', error);
  }
}
// === MENU HAMBURGUESA ===
const menuBtn = document.getElementById('menu-btn');
const navMenu = document.getElementById('nav-menu');

menuBtn.addEventListener('click', function() {
    navMenu.classList.toggle('abierto');
})