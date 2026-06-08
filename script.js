// ======================================
// CONFIGURACIÓN
// ======================================

const FOLDER = './data/';

const FILES = {
    partes: FOLDER + 'partes_planta.csv',
    enfermedades: FOLDER + 'enfermedades.csv',
    mapeo: FOLDER + 'mapeo_localizacion.csv',
    grupos: FOLDER + 'grupo_manifestacion.csv',
    manifestaciones: FOLDER + 'sintomas_signos.csv',
    criterios: FOLDER + 'manifestacion.csv',
    manifestacionLocalizacion: FOLDER + 'manifestacion_localizacion.csv', 
    manejo: FOLDER + 'manejo_seguridad.csv'
};

let db = {};

// ======================================
// PARSER CSV
// ======================================

function parseCSV(text) {

    return text
        .replace(/\r/g, '')
        .trim()
        .split('\n')
        .slice(1)
        .map(line =>

/// posibles problemas
            line.split(';').map(v =>
                v.trim().replace(/^"|"$/g, '')
            )
        );
}

// ======================================
// CARGA DE ARCHIVOS
// ======================================

async function init() {

    try {

        const textos = await Promise.all(

            Object.values(FILES).map(async file => {

                console.log('Cargando:', file);

                const response =
                    await fetch(file);

                if (!response.ok) {

                    throw new Error(
                        'No se pudo cargar ' + file
                    );
                }

                return response.text();
            })
        );

        const keys =
            Object.keys(FILES);

        keys.forEach((key, i) => {

            db[key] =
                parseCSV(textos[i]);
        });

        console.log('BASE:', db);

alert('SCRIPT NUEVO CARGADO');
///	console.log(
///             'Manifestacion_Localizacion:',
///             db.manifestacionLocalizacion
///);
        poblarMenuInicial();

    }
    catch(err) {

        console.error(err);

        alert(err.message);

        document.getElementById(
            'select-localizacion'
        ).innerHTML =
            '<option>Error al cargar datos</option>';
    }
}

// ======================================
// MENU PARTE PLANTA - GRUPOS
// ======================================

function poblarMenuInicial() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const locId =
        params.get('loc');

    if (!locId) {

        console.error(
            'No se recibió localización'
        );

        return;
    }

    const select =
        document.getElementById(
            'select-localizacion'
        );

    select.innerHTML = '';

    db.partes.forEach(row => {

        const opt =
            document.createElement('option');

        opt.value =
            String(row[0]).trim();

        opt.textContent =
            row[1];

        select.appendChild(opt);
    });

    select.value = locId;

    const parte =
        db.partes.find(row =>
            String(row[0]).trim() ===
            locId
        );

    if (parte) {

        document.getElementById(
            'parte-seleccionada'
        ).textContent =
            parte[1];
    }

    select.dispatchEvent(
        new Event('change')
    );
}

// ======================================
// LOCALIZACION -> GRUPOS
// ======================================

document.getElementById(
    'select-localizacion'
).addEventListener('change', e => {

    const locId =
        String(e.target.value).trim();

    const secSintomas =
        document.getElementById(
            'sec-sintomas'
        );

    if (!locId) {

        secSintomas.classList.add(
            'hidden'
        );

        return;
    }

// ======================================
// OBTENER ENFERMEDADES
// ====================================== 

const enfIds = db.mapeo 
	.filter(m =>
		String(m[2]).trim() === locId 
	)
	   .map(m =>
		String(m[1]).trim() 
	);

// ======================================
// OBTENER MANIFESTACIONES
// ======================================

const manifestacionIds = db.criterios
	.filter(c =>
		enfIds.includes(
			String(c[1]).trim()
		)
	)

	.map(c => 
		String(c[2]).trim()
	);

// ======================================
// OBTENER GRUPOS
// ======================================
const grupoIds = []; 

manifestacionIds.forEach(idManifestacion => {
	const mani =
		db.manifestaciones.find(m =>
			String(m[0]).trim() ===
			idManifestacion
		);
		
	if (mani) {

		grupoIds.push(
			String(mani[1]).trim()
		);
	}
});

const gruposUnicos =
[...new Set(grupoIds)];

// ======================================
// MOSTRAR GRUPOS
// ======================================

const galeria =
    document.getElementById(
        'galeria-sintomas'
    );

galeria.innerHTML = '';

gruposUnicos.forEach(gId => {

    const grupo =
        db.grupos.find(g =>
            String(g[0]).trim() === gId
        );

    if (!grupo) return;

     const tarjeta =
         document.createElement('div');

     tarjeta.className =
        'tarjeta-grupo';

    tarjeta.innerHTML = `
        <h3>${grupo[1]}</h3>
        <p>${grupo[2]}</p>
    `;

    tarjeta.addEventListener(
        'click',
        () => {

            mostrarManifestacionesGrupo(
                gId,
                manifestacionIds
            );

        }
    );

    galeria.appendChild(
        tarjeta
    );

});

secSintomas.classList.remove(
    'hidden'
);

document.getElementById(
    'resultado'
).classList.add(
    'hidden'
);

});

// ======================================
// MANIFESTACION -> DIAGNOSTICO
// ======================================

function mostrarManifestacionesGrupo(
    grupoId,
    manifestacionIds
) {

    const galeria =
        document.getElementById(
            'galeria-sintomas'
        );

    galeria.innerHTML = '';

    manifestacionIds.forEach(id => {

        const mani =
            db.manifestaciones.find(m => {

                return (
                    String(m[0]).trim() ===
                    id
                );

            });

        if (!mani) return;

        if (
            String(mani[1]).trim() !==
            grupoId
        ) return;

        const tarjeta =
            document.createElement('div');

        tarjeta.className =
            'tarjeta-sintoma';

        tarjeta.innerHTML = `
            <img src="${mani[5]}" alt="${mani[2]}">

            <h4>${mani[2]}</h4>

            <p>${mani[4]}</p>
        `;

tarjeta.addEventListener(
    'click',
    () => {

        mostrarDiagnostico(
            mani[0]
        );

    }
);

        galeria.appendChild(
            tarjeta
        );

    });

}



// ======================================
// MOSTRAR DIAGNOSTICO
// ======================================

function mostrarDiagnostico(
    sId
) {

console.log("Manifestación seleccionada:", sId);
console.log("Tabla criterios:", db.criterios);



    const res =
        document.getElementById(
            'resultado'
        );

    if (!sId) return;

    const match =
        db.criterios.find(c => {

            return (
                String(c[2]).trim() ===
                sId
            );
        });

    console.log(
        'MATCH:',
        match
    );

    if (!match) return;

    const eId =
        String(match[1]).trim();

    const eData =
        db.enfermedades.find(e => {

            return (
                String(e[0]).trim() ===
                eId
            );
        });

    const mData =
        db.manejo.find(m => {

            return (
                String(m[1]).trim() ===
                eId
            );
        });

    document.getElementById(
        'diag-nombre'
    ).textContent =
        eData
            ? eData[1]
            : 'No identificado';

    document.getElementById(
        'diag-agente'
    ).textContent =
        eData
            ? 'Agente: ' + eData[2]
            : '';

    document.getElementById(
        'diag-manejo'
    ).textContent =
        mData
            ? mData[2]
            : 'Consulte la guía técnica';

    const alerta =
        document.getElementById(
            'alerta-seguridad'
        );

    const tox =
        mData
            ? mData[4]
            : '';

    alerta.textContent =
        tox
            ? 'Alerta Marbete: ' + tox
            : '';

    alerta.className = '';

    if (
        tox.toLowerCase().includes('verde')
    ) {

        alerta.classList.add(
            'marbete-verde'
        );
    }
    else if (
        tox.toLowerCase().includes('azul')
    ) {

        alerta.classList.add(
            'marbete-azul'
        );
    }
    else if (
        tox.toLowerCase().includes('amarillo')
    ) {

        alerta.classList.add(
            'marbete-amarillo'
        );
    }
    else if (
        tox.toLowerCase().includes('rojo')
    ) {

        alerta.classList.add(
            'marbete-rojo'
        );
    }

    res.classList.remove(
        'hidden'
    );

console.log("Haciendo scroll");
    
   res.scrollIntoView({
   behavior: 'smooth',
   block: 'start'
});

//window.scrollTo({
 //   top: document.body.scrollHeight,
  //  behavior: 'smooth'
//});
    
}

// ======================================
// INICIO
// ======================================

init();

// ======================================
// VOLVER A SINTOMAS
// ======================================

document.addEventListener(
    'click',
    e => {

        if (
            e.target &&
            e.target.id === 'volver-arriba'
        ) {

            document.getElementById(
                'sec-sintomas'
            ).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        }

    }
);
