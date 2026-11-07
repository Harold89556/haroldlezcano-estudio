
    let unidadActual = 'cm'; 

    function setUnidad(u, event) {
        const factors = {cm:1, in:2.54, m:100};
        ['ancho_cm','alto_cm'].forEach(id => {
            const input = document.getElementById(id);
            const n = Number(input.value);
            if (Number.isFinite(n) && n > 0) input.value = String(Number((n * factors[unidadActual] / factors[u]).toPrecision(12)));
        });
        unidadActual = u;
        ['ancho_cm','alto_cm'].forEach(id=>{const field=document.getElementById(id);field.min=String(0.1/factors[u]);field.max=String(500/factors[u]);});
        document.getElementById('btn-uni-cm').classList.remove('active');
        document.getElementById('btn-uni-in').classList.remove('active');
        document.getElementById('btn-uni-m').classList.remove('active');
        event.currentTarget.classList.add('active');
        updateSize(); 
        calcular();
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(error => { console.log('Fallo SW:', error); });
        });
    }

    async function compartirPagina(e) {
        e.preventDefault(); const status=document.getElementById('share-status');
        const data={title:document.title,text:'Obras de arte y cursos con Harold Lezcano.',url:window.location.href};
        try {
            if(navigator.share) { await navigator.share(data); status.textContent='Enlace compartido.'; return; }
            if(navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(data.url); status.textContent='Enlace copiado.'; return; }
            status.textContent='Copiá este enlace: '+data.url;
        } catch(error) { if(error.name !== 'AbortError') status.textContent='Podés copiar este enlace: '+data.url; }
    }

    function cambiarPaisLogistica() {
        let pais = document.getElementById('envio_pais').value;
        if (pais === 'Paraguay') {
            document.getElementById('datos_extra_envio').style.display = 'none';
        } else {
            document.getElementById('datos_extra_envio').style.display = 'block';
        }
    }

    const textBioOriginal = `Nací en Asunción en 1989, bendecido con un don artístico heredado de <strong>mi madre</strong> y forjado con la disciplina, la perseverancia y la visión para aprovechar cada oportunidad que me inculcó <strong>mi padre</strong>. Tuve el honor de perfeccionar este legado durante <strong>más de 20 años</strong> junto al gran Maestro <strong>Prof. Manuel Viedma</strong>. Hoy, fusiono esa pasión innata y trabajo duro con una técnica de élite para dar vida a obras exclusivas que transforman espacios.`;
    const textBioCurso = `🎨 <strong>¿Por qué estudiar dibujo y pintura?</strong><br>Aprender a pintar es mucho más que dominar una técnica; es descubrir una nueva forma de ver el mundo, reducir el estrés y potenciar tu creatividad. En este espacio, te guiaré paso a paso para que logres transformar un lienzo en blanco en tu propia obra maestra, sin importar si empezás completamente desde cero. ¡Despertá el artista que llevás dentro!`;

    const descripciones = {
        estilo: {
            'default': 'Seleccioná el nivel de detalle, la pincelada, o el tipo de obra principal.',
            'Realista': 'El estilo predilecto: fidelidad anatómica, transiciones tonales precisas y calidez.',
            'Hiperrealista': 'Nivel de detalle extremo y minucioso, casi idéntico a una fotografía. Un verdadero artículo de lujo.',
            'Espatulado': 'Textura gruesa y pintura en relieve aplicada con espátula. Estilo impresionista.',
            'Bocetado': 'Trazo suelto, rápido y artístico que muestra el proceso creativo y la esencia.',
            'Mural': 'Arte pintado directamente sobre pared a gran escala. El valor se acuerda según la pared, el acceso y el detalle.',
            'Escultura': 'Pieza modelada a mano: busto, medio cuerpo, figura de cuerpo entero o relieve. No realizo fundición.',
            'Restauracion': 'Tratamiento profesional para devolver a su estado original obras desgastadas o antiguas.'
        },
        tecnica: {
            'default': 'Escogé el material de la pintura, esto define su textura, acabado y durabilidad en el tiempo.',
            'Oleo': 'La técnica reina de las artes plásticas. Garantiza una durabilidad de siglos, colores vibrantes y transiciones inigualables.',
            'Acrilico': 'Excelente durabilidad (décadas). Secado rápido y colores de acabado mate/satinado.',
            'Carbonilla': 'Técnica clásica sobre papel de arte.'
        },
        tema: {
            'default': 'Elegí la temática que mejor se adapte a tu idea.',
            'Retrato': 'Obra enfocada en capturar la esencia y rasgos de personas o animales.',
            'Paisaje': 'Representación artística de entornos naturales o urbanos.',
            'Bodegon': 'Composición de objetos inanimados, frutas o elementos cotidianos.',
            'Abstracto': 'Expresión visual mediante formas, colores y texturas sin forma definida.'
        },
        color_lapiz: {
            'default': 'Elegí si preferís la obra en el clásico blanco y negro o con detalles a color.',
            'Sin color': 'Técnica clásica usando diferentes durezas de grafito o carbonilla pura.',
            'A color': 'Toques y acabados a color.'
        },
        forma_lienzo: {
            'default': 'Elegí la silueta geométrica del bastidor para darle un toque único a tu composición.',
            'Estandar': 'Lienzo cuadrado o rectangular tradicional, ideal tanto para formato vertical como horizontal.',
            'Circular': 'Lienzo redondo (Tondo), enfoca la atención al centro. Muy moderno y llamativo.',
            'Ovalado': 'Formato clásico y sumamente elegante, muy usado y tradicional en retratos de época.',
            'Hexagonal': 'Hexágono regular: la medida indica el ancho máximo entre vértices opuestos.'
        },
        enmarcado: {
            'default': 'Seleccioná si deseas la obra lista para colgar o con un marco decorativo a medida.',
            'SinMarco': 'El lienzo se entrega pintado finamente en los bordes, listo para colgar directamente.',
            'Estandar': 'Perfil de madera moderno y limpio. Monto fijo según tamaño.',
            'Cajon': 'Diseño profundo tipo cajón donde la obra queda inmersa.',
            'Clasico': 'Moldura tradicional de madera noble, elegante y atemporal.',
            'SemiRelieve': 'Moldura elaborada con detalles sutiles.',
            'GruesoRelieves': 'Máximo lujo con moldura ancha de presencia imponente.'
        },
        tipo_restauracion: {
            'default': 'Indicá si necesitás restaurar una foto antigua (Digital) o reparar una obra real (Física).',
            'Digital': 'Simple: limpieza de grietas, manchas y color. Se abona tras ver la muestra.',
            'Digital Compleja': 'Reconstrucción facial profunda de partes dañadas o faltantes.',
            'Fisica': 'Evaluación directa de la tela y pigmentos en taller para presupuesto formal.'
        },
        tipo_escultura: {
            'default': 'Elegí si buscás un busto, un medio cuerpo, una figura completa o un relieve.',
            'Busto': 'Cabeza y hombros, modelado académico. Suele medirse entre 30 y 80 cm de alto.',
            'Medio cuerpo': 'De la cabeza a la cintura o el torso, con más presencia que un busto.',
            'Figura completa': 'Figura de cuerpo entero, desde un formato de escritorio hasta tamaño natural.',
            'Relieve': 'Modelado en relieve sobre placa, para pared o peana.'
        },
        cuotas: {
            'default': 'Seleccioná tu forma de pago ideal.',
            '1': 'Seña inicial para iniciar y el saldo restante contra entrega aprobada.',
            '3': 'Hasta 3 cuotas con tarjeta.'
        },
        c_niv: {
            'default': 'Indicá tu experiencia previa para adaptar la metodología.',
            'Nivel inicial': 'Ideal si nunca dibujaste. Empezamos desde cero.',
            'Nivel medio': 'Para quienes ya tienen nociones básicas. Profundizamos en perspectiva y volumen.',
            'Nivel avanzado': 'Enfocado en anatomía compleja, retrato realista y dominio de técnicas exigentes.',
            'Nivel pro': 'Clases de maestría. Desarrollo de estilo propio, técnicas hiperrealistas y obras de gran formato.'
        }
    };

    function mostrarInfo(campo) {
        let e = document.getElementById(campo);
        let infoDiv = document.getElementById('info-' + campo);
        if(!e || !infoDiv) return;
        if(campo==='enmarcado' && valor('tecnica')==='Carbonilla' && e.value==='SinMarco'){infoDiv.textContent='Obra sobre papel, sin marco.';infoDiv.style.display='block';return;}
        let val = e.value || 'default';
        if(descripciones[campo] && descripciones[campo][val]) {
            infoDiv.innerText = descripciones[campo][val];
            infoDiv.style.display = 'block';
        } else {
            infoDiv.style.display = 'none';
        }
    }

    function switchTab(t, e) {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('tab-'+t).classList.add('active'); e.currentTarget.classList.add('active');
        
        let bio = document.getElementById('bioText');
        if(t === 'curso') {
            bio.style.opacity = 0;
            setTimeout(() => { if(window.sitioActual?.textos?.introduccionCurso) bio.textContent=window.sitioActual.textos.introduccionCurso; else bio.innerHTML = textBioCurso; bio.style.opacity = 1; }, 150);
        } else {
            bio.style.opacity = 0;
            setTimeout(() => { if(window.sitioActual?.textos?.biografia) bio.textContent=window.sitioActual.textos.biografia; else bio.innerHTML = textBioOriginal; bio.style.opacity = 1; }, 150);
        }
        calcular();
        if (!window.restaurandoRuta) setRoute('#'+(t==='curso'?'cursos':t));
    }

    function step(id, a) { let i=document.getElementById(id); let v=parseInt(i.value)+a; if(v<0)v=0; i.value=v; calcular(); }
    function configEscultura(){ return (typeof ESCULTURA_TIPOS !== 'undefined') ? ESCULTURA_TIPOS[valor('tipo_escultura')] : null; }
    function onTipoEsculturaChange() {
        const cfg = configEscultura();
        const grupo = document.getElementById('grupo-altura-escultura');
        const input = document.getElementById('escultura_cm');
        const label = document.getElementById('label-altura-escultura');
        if (!cfg) {
            if (grupo) grupo.style.display = 'none';
            mostrarInfo('tipo_escultura');
            return;
        }
        let v = Number(input.value);
        if (!Number.isFinite(v) || v < cfg.min || v > cfg.max) input.value = String(cfg.def);
        if (label) label.textContent = 'Altura (' + cfg.min + ' a ' + cfg.max + ' cm)';
        if (grupo) grupo.style.display = '';
        mostrarInfo('tipo_escultura');
    }
    function stepEsc(a) {
        const cfg = configEscultura();
        if (!cfg) return;
        const i = document.getElementById('escultura_cm');
        let v = Number(i.value);
        if (!Number.isFinite(v)) v = cfg.def;
        v += a * cfg.step;
        if (v < cfg.min) v = cfg.min;
        if (v > cfg.max) v = cfg.max;
        i.value = String(v);
        calcular();
    }

    function setupSelect(s) {
        if (!s) return;
        s.classList.remove('native-hidden');
        s.style.removeProperty('display');
        if (s.selectedIndex < 0 && s.options.length) s.selectedIndex = 0;
    }

    function updateUI() {
        let est_val = document.getElementById('estilo').value;
        let tema_val = document.getElementById('tema').value;
        let t = (est_val === 'Mural' || est_val === 'Escultura' || est_val === 'Restauracion') ? est_val : tema_val;
        
        if (est_val === 'Mural' || est_val === 'Escultura' || est_val === 'Restauracion') {
            document.getElementById('step-tecnica').style.display = 'none';
            document.getElementById('step-tema').style.display = 'none';
            document.getElementById('step-color-lapiz').style.display = 'none';
        } else {
            document.getElementById('step-tecnica').style.display = 'block';
            document.getElementById('step-tema').style.display = 'block';
            let te = document.getElementById('tecnica').value;
            document.getElementById('step-color-lapiz').style.display = (te === 'Carbonilla') ? 'block' : 'none';
        }
        
        document.getElementById('contenedor-restauracion').style.display = (t === 'Restauracion') ? 'block' : 'none';
        document.getElementById('retratos-extras').style.display = (t === 'Retrato') ? 'block' : 'none';
        if (t !== 'Retrato') { document.getElementById('personas').value='0'; document.getElementById('mascotas').value='0'; document.getElementById('fondo').checked=false; }
        
        if(t === 'Restauracion') {
            let tr = document.getElementById('tipo_restauracion').value;
            document.getElementById('pago-container').style.display = (tr === 'Digital' || tr === 'Digital Compleja') ? 'none' : 'block';
        } else {
            document.getElementById('pago-container').style.display = t ? 'block' : 'none';
        }

        if (t === 'Retrato' && est_val === 'Espatulado') {
            let cf = document.getElementById('contenedor-fondo');
            if(cf) { 
                cf.style.display = 'none'; 
                document.getElementById('fondo').checked = false; 
            }
        } else {
            let cf = document.getElementById('contenedor-fondo');
            if(cf) cf.style.display = 'block';
        }
        
        document.getElementById('step-fotos').style.display = t ? 'block' : 'none';
        document.getElementById('step-envio').style.display = t ? 'block' : 'none';
        document.getElementById('contenedor-murales').style.display = (t === 'Mural') ? 'block' : 'none';
        document.getElementById('contenedor-escultura').style.display = (t === 'Escultura') ? 'block' : 'none';
        if (t === 'Escultura') onTipoEsculturaChange();
        
        if (t === 'Mural' || t === 'Restauracion' || t === 'Escultura') {
            document.getElementById('contenedor-cuadros').style.display = 'none';
        } else {
            document.getElementById('contenedor-cuadros').style.display = 'block';
            document.getElementById('step-enmarcado').style.display = 'block';
        }
        
        let te = document.getElementById('tecnica').value;
        const sinMarco=document.querySelector('#enmarcado option[value="SinMarco"]');
        if(sinMarco)sinMarco.textContent=te==='Carbonilla'?'Sin marco (obra sobre papel)':'Sin marco (Bordes pintados listos para colgar)';
        if(te==='Carbonilla' && document.getElementById('enmarcado').value==='SinMarco') document.getElementById('info-enmarcado').textContent='Obra sobre papel, sin marco.';
        document.getElementById('formato-lienzo-container').style.display = (t!=='Mural' && t!=='Restauracion' && t!=='Escultura' && (te==='Oleo'||te==='Acrilico')) ? 'block' : 'none';
    }

    function onEstiloChange() {
        let est = document.getElementById('estilo').value;
        let tec = document.getElementById('tecnica');
        
        if(est === 'Espatulado' && tec.value === 'Carbonilla') {
            tec.value = 'Oleo';
            setupSelect(tec);
        }
        
        mostrarInfo('estilo');
        updateUI();
        updateSize();
        calcular();
    }

    function onTecnicaChange() {
        let te = document.getElementById('tecnica').value;
        let est = document.getElementById('estilo');
        
        if(te === 'Carbonilla' && est.value === 'Espatulado') {
            est.value = 'Realista';
            setupSelect(est);
        }
        
        mostrarInfo('tecnica');
        updateUI();
        updateSize();
        calcular();
    }

    function onTemaChange() {
        mostrarInfo('tema');
        updateUI();
        updateSize();
        calcular();
    }

    /* FUNCIÓN CORREGIDA: NUNCA ASIGNA TAMAÑO AUTOMÁTICO */
    function updateSize() {
        let est_val = document.getElementById('estilo').value;
        let tema_val = document.getElementById('tema').value;
        let t = (est_val === 'Mural' || est_val === 'Escultura' || est_val === 'Restauracion') ? est_val : tema_val;
        
        let te = document.getElementById('tecnica').value, f = document.getElementById('forma_lienzo').value, st = document.getElementById('tamano_predefinido');
        
        if(t !== 'Mural' && t !== 'Restauracion' && t !== 'Escultura') {
            document.getElementById('c_alto').style.display = (f === 'Circular' || f === 'Hexagonal') ? 'none' : 'block';
            
            let lblAncho = f === 'Circular' ? 'Diámetro' : f === 'Hexagonal' ? 'Ancho entre vértices opuestos' : 'Ancho';
            let txtUni = (unidadActual === 'cm') ? '(cm)' : (unidadActual === 'in') ? '(in)' : '(m)';
            document.getElementById('l_ancho').innerText = lblAncho + ' ' + txtUni;
            document.getElementById('l_alto').innerText = 'Alto ' + txtUni;
            
            let prev = st.value; 
            st.innerHTML = '<option value="" disabled selected>Seleccioná un tamaño...</option>';
            
            const formatOpt = (w_cm, h_cm) => {
                if (unidadActual === 'cm') return `${w_cm} x ${h_cm} cm`;
                if (unidadActual === 'in') return `${(w_cm/2.54).toFixed(1)} x ${(h_cm/2.54).toFixed(1)} in`;
                return `${(w_cm/100).toFixed(2)} x ${(h_cm/100).toFixed(2)} m`;
            };

            if (te === 'Carbonilla') {
                st.add(new Option(`A5 (${formatOpt(14.8, 21)})`, '15x21'));
                st.add(new Option(`A4 (${formatOpt(21, 29.7)})`, '21x30'));
                st.add(new Option(`A3 (${formatOpt(29.7, 42)})`, '30x42'));
                st.add(new Option(`A2 (${formatOpt(42, 59.4)})`, '42x59'));
            } else {
                let szs = (f === 'Circular' || f === 'Hexagonal') ? ['30x30','50x50','70x70','100x100'] : ['30x40','40x50','50x70','70x100','100x120'];
                szs.forEach(z => {
                    let d = z.split('x');
                    st.add(new Option(formatOpt(parseFloat(d[0]), parseFloat(d[1])), z));
                }); 
                st.add(new Option('Personalizado','personalizado'));
            }
            
            // Si el usuario ya había seleccionado un tamaño que sigue existiendo, se conserva.
            // Si NO había seleccionado nada, permanece vacío.
            st.value = Array.from(st.options).some(o => o.value === prev && !o.disabled) ? prev : '';
            handleTamanoChange(); 
            setupSelect(st); 
            setupSelect(document.getElementById('enmarcado')); 
            setupSelect(document.getElementById('forma_lienzo'));
            
            mostrarInfo('forma_lienzo'); 
            mostrarInfo('enmarcado');
        }
    }

    function onFormaChange(){ updateSize(); calcular(); }
    function handleTamanoChange(){ 
        document.getElementById('tamano_manual_container').style.display = (document.getElementById('tamano_predefinido').value === 'personalizado') ? 'block' : 'none'; 
        calcular();
    }
    function toggleFactura(){ document.getElementById('factura-datos').style.display = document.getElementById('factura').checked ? 'block' : 'none'; calcular(); }

    function prepararMensajeObra() {
        let est_val = document.getElementById('estilo').value;
        let tema_val = document.getElementById('tema').value;
        let t = (est_val === 'Mural' || est_val === 'Escultura' || est_val === 'Restauracion') ? est_val : tema_val;
        
        if (!validarObra()) return;
        calcular();
        
        let texto = "¡Hola Harold! 👋 Quiero consultar por una obra. Aquí están los detalles:\n\n";
        
        if (t !== 'Restauracion' && t !== 'Escultura') {
            if (t === 'Mural') {
                let em = document.getElementById('estilo_mural');
                if(em.value) texto += "✨ *Estilo:* " + em.options[em.selectedIndex].text + "\n";
            } else {
                let est = document.getElementById('estilo');
                if(est.value) texto += "✨ *Estilo:* " + est.options[est.selectedIndex].text + "\n";
                
                let tec = document.getElementById('tecnica');
                if(tec.value) texto += "🖌️ *Técnica:* " + tec.options[tec.selectedIndex].text + "\n";
                
                if (tec.value === 'Carbonilla') {
                    let col = document.getElementById('color_lapiz');
                    if (col.value) texto += "🌈 *Opción de Color:* " + col.options[col.selectedIndex].text + "\n";
                }
            }
        }
        
        if (t !== 'Mural' && t !== 'Escultura' && t !== 'Restauracion') {
            let selectTema = document.getElementById('tema');
            texto += "🎨 *Temática:* " + selectTema.options[selectTema.selectedIndex].text + "\n";
        } else {
            let selectEstilo = document.getElementById('estilo');
            texto += "🎨 *Obra:* " + selectEstilo.options[selectEstilo.selectedIndex].text + "\n";
        }
        
        if (t === 'Retrato') {
            texto += "👥 *Personas extra:* " + document.getElementById('personas').value + "\n";
            texto += "🐾 *Mascotas extra:* " + document.getElementById('mascotas').value + "\n";
            
            let contFondo = document.getElementById('contenedor-fondo');
            if (contFondo && contFondo.style.display !== 'none') {
                texto += "🌄 *Fondo complejo:* " + (document.getElementById('fondo').checked ? "Sí" : "Fondo simple incluido") + "\n";
            }
        }
        
        if (t === 'Restauracion') {
            let tr = document.getElementById('tipo_restauracion');
            if (tr.value) texto += "🩹 *Tipo:* " + tr.options[tr.selectedIndex].text + "\n";
        }
        
        if (t === 'Escultura') {
            let te = document.getElementById('tipo_escultura');
            if (te && te.value) texto += "🗿 *Tipo:* " + te.options[te.selectedIndex].text + "\n";
            texto += "📏 *Altura:* " + document.getElementById('escultura_cm').value + " cm\n";
            texto += "🪵 *Realización:* Modelado a mano, sin fundición\n";
        }
        
        if (t !== 'Restauracion' && t !== 'Escultura') {
            if (t === 'Mural') {
                let m_h = document.getElementById('mural_alto').value;
                texto += "📏 *Tamaño Mural:* " + document.getElementById('mural_ancho').value + "m de ancho x " + m_h + "m de alto\n";
                if(parseFloat(m_h) >= 2.5) texto += "⚠️ *(Incluye andamios y seguridad)*\n";
            } else {
                let tec = document.getElementById('tecnica');
                if (tec.value === 'Oleo' || tec.value === 'Acrilico') {
                    let form = document.getElementById('forma_lienzo');
                    if(form.value) texto += "📐 *Formato:* " + form.options[form.selectedIndex].text + "\n";
                }
                
                let tam = document.getElementById('tamano_predefinido');
                if(tam.value === 'personalizado') {
                    let txtUni = (unidadActual==='cm') ? 'cm' : (unidadActual==='in') ? 'pulgadas' : 'metros';
                    texto += "📏 *Tamaño:* " + describirDimensiones(obtenerDimensiones()) + "\n";
                } else if (tam.value) {
                    texto += "📏 *Tamaño:* " + describirDimensiones(obtenerDimensiones()) + "\n";
                }
                
                let enm = document.getElementById('enmarcado');
                if(enm.value) texto += "🖼️ *Enmarcado:* " + enm.options[enm.selectedIndex].text + "\n";
            }
        }
        
        let fotos = document.getElementById('fotos_referencia');
        if(fotos && fotos.value) {
            texto += "📸 *Fotos de referencia:* " + fotos.options[fotos.selectedIndex].text + "\n";
        }

        let idea = document.getElementById('idea_cliente');
        if(idea && idea.value.trim() !== "") {
            texto += "💡 *Detalles / Mi idea:* " + idea.value.trim() + "\n";
        }
        
        let nombre = document.getElementById('envio_nombre').value || "No especificado";
        let paisSel = document.getElementById('envio_pais').value;

        texto += "\n📦 *DATOS DE CLIENTE Y ENVÍO*\n";
        texto += "👤 *Nombre:* " + nombre + "\n";
        texto += "🌍 *País:* " + (paisSel === 'Paraguay' ? "Paraguay" : "Internacional") + "\n";

        if(paisSel !== 'Paraguay') {
            let codPais = document.getElementById('envio_cod_pais').value || "";
            let tel = document.getElementById('envio_telefono').value || "No especificado";
            let paisInt = document.getElementById('envio_pais_int').value || "No especificado";
            let estInt = document.getElementById('envio_estado_int').value || "No especificado";
            let ciudInt = document.getElementById('envio_ciudad_int').value || "No especificada";
            let dir = document.getElementById('envio_direccion').value || "No especificada";
            let cp = document.getElementById('envio_cp').value || "";

            texto += "📞 *Teléfono:* " + codPais + " " + tel + "\n";
            texto += "📍 *Ubicación:* " + ciudInt + ", " + estInt + ", " + paisInt + "\n";
            texto += "🏠 *Dirección:* " + dir + (cp ? " (CP: " + cp + ")" : "") + "\n";
        }
        
        texto += "\n🧾 *Factura Legal:* " + (document.getElementById('factura').checked ? "Sí" : "No") + "\n";
        if(document.getElementById('factura').checked) {
            let raz = document.getElementById('razon').value;
            let ruc = document.getElementById('ruc').value;
            if(raz) texto += "   - *Razón Social:* " + raz + "\n";
            if(ruc) texto += "   - *RUC:* " + ruc + "\n";
        }
        
        let cuo = document.getElementById('cuotas');
        if(!esRestauracionDigital()) {
            if(cuo.value) texto += "💳 *Forma de Pago:* " + cuo.options[cuo.selectedIndex].text + "\n";
        } else {
            texto += "💳 *Forma de Pago:* Contado (Tras aprobar muestra)\n";
        }
        
        let m = document.getElementById('moneda');
        if(m.value) texto += "💵 *Moneda:* " + m.options[m.selectedIndex].text + "\n";

        if (t === 'Mural' || (typeof ultimoPresupuesto !== 'undefined' && ultimoPresupuesto && ultimoPresupuesto.consultar)) {
            texto += "\n💰 *INVERSIÓN ESTIMADA:* A consultar según la pared, el acceso y el detalle.\n";
        } else {
            let precio = document.getElementById('precioFinal').textContent + '\n' + document.getElementById('desglose').textContent + '\n' + document.querySelector('.nota').textContent;
            texto += "\n💰 *INVERSIÓN ESTIMADA:* " + precio + "\n";
        }
        texto += "✨ *Garantía:* 1 revisión y aprobación previa de boceto fotográfico.\n";
        
        return texto;
    }

    function enviarInscripcion() {
        if (!validarInscripcion()) return;
        let nom = document.getElementById('c_nom').value.trim();
        let edad = document.getElementById('c_edad').value || "No especificada";
        let niv = document.getElementById('c_niv');
        let pag = document.getElementById('c_pag');
        
        let texto = "¡Hola Harold! 👋 Me gustaría inscribirme al Curso de Dibujo y Pintura.\n\n";
        texto += "👤 *Nombre:* " + nom + "\n";
        texto += "🎂 *Edad:* " + edad + (edad !== "No especificada" ? " años" : "") + "\n";
        if(niv.value) texto += "📈 *Nivel:* " + niv.options[niv.selectedIndex].text + "\n";
        if(pag.value) texto += "💲 *Pago de Matrícula (" + preciosActuales.cursos.matricula.toLocaleString('es-PY') + " Gs.):* " + pag.options[pag.selectedIndex].text + "\n";
        
        window.open(`https://wa.me/${window.sitioActual?.whatsapp || '595972173847'}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer');
    }
    
    function openAlbum(cat, title) {
        window.albumActual=cat;
        document.getElementById('vista-albumes').style.display = 'none';
        document.getElementById('vista-hojas').style.display = 'block';
        document.getElementById('titulo-album-abierto').innerText = title;
        
        document.querySelectorAll('.gallery-item').forEach(i => {
            if(i.classList.contains(cat)) {
                i.style.display = '';
                i.classList.add('show');
            } else {
                i.style.display = '';
                i.classList.remove('show');
            }
        });
        document.getElementById('mainGallery').scrollTop = 0;
        document.querySelector('#vista-hojas .btn-volver').focus();
        
        setRoute('#galeria/'+cat);
    }

    function closeAlbum() {
        document.getElementById('vista-albumes').style.display='grid';
        document.getElementById('vista-hojas').style.display='none';
        const trigger=document.querySelector('[data-album="'+window.albumActual+'"]'); if(trigger)trigger.focus();
        setRoute('#galeria');
    }

    let currentImages = [];
    let currentIndex = 0;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const visor = { scale: 1, x: 0, y: 0, pointers: new Map(), startDist: 0, startScale: 1, startX: 0, startY: 0, baseX: 0, baseY: 0, swipeX: 0, lastTap: 0, moved: false };

    function aplicarVisor(anim) {
        modalImg.style.transition = anim ? 'transform 0.25s ease-out' : 'none';
        modalImg.style.transform = `translate(${visor.x + visor.swipeX}px, ${visor.y}px) scale(${visor.scale})`;
        modal.classList.toggle('zoomed', visor.scale > 1.01);
    }
    function resetZoom(anim) { visor.scale = 1; visor.x = 0; visor.y = 0; visor.swipeX = 0; aplicarVisor(anim); }
    function limitarPan() {
        const w = modalImg.offsetWidth * visor.scale, h = modalImg.offsetHeight * visor.scale;
        const mx = Math.max(0, (w - window.innerWidth) / 2), my = Math.max(0, (h - window.innerHeight) / 2);
        visor.x = Math.min(mx, Math.max(-mx, visor.x)); visor.y = Math.min(my, Math.max(-my, visor.y));
    }
    function fotosAlbum() { return Array.from(document.querySelectorAll('.gallery-item.show img')); }
    function mostrarFoto() {
        const imgs = fotosAlbum();
        modalImg.src = currentImages[currentIndex];
        modalImg.alt = imgs[currentIndex]?.alt || 'Obra de Harold Lezcano';
        const contador = document.getElementById('modalCounter');
        if (contador) contador.textContent = (currentIndex + 1) + ' / ' + currentImages.length;
        if (currentImages.length > 1) { const pre = new Image(); pre.src = currentImages[(currentIndex + 1) % currentImages.length]; const pre2 = new Image(); pre2.src = currentImages[(currentIndex - 1 + currentImages.length) % currentImages.length]; }
    }

    function openModal(s) {
        currentImages = fotosAlbum().map(img => img.src);
        currentIndex = currentImages.indexOf(s);
        if (currentIndex === -1) currentIndex = 0;
        resetZoom(false);
        mostrarFoto();
        if (modal.hidden || modal.style.display === 'none') window.focoAnterior = document.activeElement;
        modal.style.display = 'flex';
        modal.hidden = false;
        document.body.classList.add('visor-abierto');
        document.querySelector('.close-modal').focus();
        setRoute('#galeria/' + window.albumActual + '/' + (currentIndex + 1));
    }

    function closeModal() {
        modal.style.display = 'none'; modal.hidden = true;
        document.body.classList.remove('visor-abierto');
        visor.pointers.clear(); resetZoom(false);
        if (window.focoAnterior) window.focoAnterior.focus();
        setRoute('#galeria/' + (window.albumActual || 'retrato'), true);
    }

    function changeImg(dir) {
        if (currentImages.length === 0) return;
        const ancho = window.innerWidth;
        visor.scale = 1; visor.x = 0; visor.y = 0; visor.swipeX = -dir * ancho; aplicarVisor(true);
        setTimeout(() => {
            currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
            mostrarFoto();
            setRoute('#galeria/' + window.albumActual + '/' + (currentIndex + 1), true);
            visor.swipeX = dir * ancho; aplicarVisor(false);
            requestAnimationFrame(() => requestAnimationFrame(() => { visor.swipeX = 0; aplicarVisor(true); }));
        }, 220);
    }

    function zoomEn(px, py, escala) {
        const r = modal.getBoundingClientRect();
        const cx = px - r.width / 2, cy = py - r.height / 2;
        const f = escala / visor.scale;
        visor.x = cx - (cx - visor.x) * f; visor.y = cy - (cy - visor.y) * f; visor.scale = escala;
        limitarPan();
    }

    modal.addEventListener('click', e => { if (e.target === modal && !visor.moved) closeModal(); });
    modalImg.addEventListener('dragstart', e => e.preventDefault());
    modalImg.addEventListener('dblclick', e => { e.preventDefault(); if (visor.scale > 1.01) resetZoom(true); else { zoomEn(e.clientX, e.clientY, 2.5); aplicarVisor(true); } });
    modal.addEventListener('wheel', e => { if (modal.hidden) return; e.preventDefault(); const s = Math.min(5, Math.max(1, visor.scale * (e.deltaY < 0 ? 1.15 : 0.87))); zoomEn(e.clientX, e.clientY, s); if (s === 1) resetZoom(true); else aplicarVisor(false); }, { passive: false });

    modal.addEventListener('pointerdown', e => {
        if (e.target.closest('button')) return;
        visor.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try { modal.setPointerCapture(e.pointerId); } catch (_) {}
        if (visor.pointers.size === 1) { visor.moved = false; visor.startX = e.clientX; visor.startY = e.clientY; visor.baseX = visor.x; visor.baseY = visor.y; }
        if (visor.pointers.size === 2) {
            const [a, b] = [...visor.pointers.values()];
            visor.startDist = Math.hypot(a.x - b.x, a.y - b.y) || 1; visor.startScale = visor.scale; visor.swipeX = 0; visor.moved = true;
        }
    });
    modal.addEventListener('pointermove', e => {
        if (!visor.pointers.has(e.pointerId)) return;
        visor.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (visor.pointers.size >= 2) {
            const [a, b] = [...visor.pointers.values()];
            const s = Math.min(5, Math.max(1, visor.startScale * Math.hypot(a.x - b.x, a.y - b.y) / visor.startDist));
            zoomEn((a.x + b.x) / 2, (a.y + b.y) / 2, s); aplicarVisor(false); return;
        }
        const dx = e.clientX - visor.startX, dy = e.clientY - visor.startY;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) visor.moved = true;
        if (visor.scale > 1.01) { visor.x = visor.baseX + dx; visor.y = visor.baseY + dy; limitarPan(); }
        else visor.swipeX = dx;
        aplicarVisor(false);
    });
    function finPuntero(e) {
        if (!visor.pointers.has(e.pointerId)) return;
        visor.pointers.delete(e.pointerId);
        if (visor.pointers.size === 1) { const p = [...visor.pointers.values()][0]; visor.startX = p.x; visor.startY = p.y; visor.baseX = visor.x; visor.baseY = visor.y; return; }
        if (visor.pointers.size > 0) return;
        if (visor.scale <= 1.01) {
            const dx = visor.swipeX;
            if (dx < -60 && currentImages.length > 1) { changeImg(1); return; }
            if (dx > 60 && currentImages.length > 1) { changeImg(-1); return; }
            resetZoom(true);
        }
        if (!visor.moved && e.pointerType !== 'mouse' && e.target === modalImg) {
            const ahora = Date.now();
            if (ahora - visor.lastTap < 300) { if (visor.scale > 1.01) resetZoom(true); else { zoomEn(e.clientX, e.clientY, 2.5); aplicarVisor(true); } visor.lastTap = 0; }
            else visor.lastTap = ahora;
        }
    }
    modal.addEventListener('pointerup', finPuntero);
    modal.addEventListener('pointercancel', finPuntero);

    window.addEventListener('resize', calcular);

    window.onload = () => { 
        let m_ancho = document.getElementById('mural_ancho');
        if(m_ancho.options.length === 0) { 
            m_ancho.add(new Option('Seleccioná...', ''));
            for(let i=1; i<=20; i++) m_ancho.add(new Option(i + ' m', i)); 
        }
        let m_alto = document.getElementById('mural_alto');
        if(m_alto.options.length === 0) { 
            m_alto.add(new Option('Seleccioná...', ''));
            for(let i=1; i<=5; i++) m_alto.add(new Option(i + ' m', i)); 
        }
        setupSelect(m_ancho); 
        setupSelect(m_alto);
        setupSelect(document.getElementById('estilo_mural'));

        updateUI();
        updateSize();
        
        mostrarInfo('estilo');
        mostrarInfo('c_niv');

 
        
        setupSelect(document.getElementById('moneda'));
        setupSelect(document.getElementById('c_niv'));
        setupSelect(document.getElementById('c_pag'));
        setupSelect(document.getElementById('fotos_referencia'));
        setupSelect(document.getElementById('color_lapiz'));
        setupSelect(document.getElementById('estilo'));
        setupSelect(document.getElementById('tecnica'));
        setupSelect(document.getElementById('tema'));
        setupSelect(document.getElementById('tipo_restauracion'));

        // Al iniciar la página, verificar estado (estará oculto)
        calcular();
    };
