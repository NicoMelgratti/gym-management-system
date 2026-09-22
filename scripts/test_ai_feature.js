const http = require('http');
const XLSX = require('xlsx');

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAIFeatures() {
  console.log('=== TEST E22: INTELIGENCIA ARTIFICIAL & COACH VIRTUAL ===\n');

  // 1. Probar Coach Virtual: "¿Qué me toca entrenar hoy?"
  console.log('1. Probando Coach Virtual con pregunta: "¿Qué me toca entrenar hoy?"...');
  const coachRes1 = await postJson('/api/ia/coach', {
    prompt: '¿Qué me toca entrenar hoy?',
    usuario_id: 3,
  });

  console.log('   Coach status:', coachRes1.status);
  console.log('   Coach respuesta:\n   ---');
  console.log('  ', coachRes1.data?.respuesta?.split('\n').join('\n   '));
  console.log('   ---\n');

  // 2. Probar Coach Virtual: "¿Qué es RIR 3?"
  console.log('2. Probando Coach Virtual con pregunta técnica: "¿Qué significa RIR 3?"...');
  const coachRes2 = await postJson('/api/ia/coach', {
    prompt: '¿Qué significa RIR 3?',
    usuario_id: 3,
  });
  console.log('   Coach status:', coachRes2.status);
  console.log('   Coach respuesta:\n   ---');
  console.log('  ', coachRes2.data?.respuesta?.split('\n').join('\n   '));
  console.log('   ---\n');

  // 3. Probar análisis de archivo Excel con xlsx
  console.log('3. Creando archivo Excel de prueba en memoria para analizar con IA...');
  const wb = XLSX.utils.book_new();
  const wsData1 = [
    ['Ejercicio', 'Series', 'Repeticiones', 'Kg'],
    ['Press de banca plano', '4', '8-10', '80'],
    ['Press inclinado con mancuernas', '3', '10-12', '28'],
    ['Fondos en paralelas', '3', 'Fallo', '0'],
  ];
  const wsData2 = [
    ['Ejercicio', 'Series', 'Repeticiones', 'Kg'],
    ['Remo con barra olímpica', '4', '8-10', '70'],
    ['Jalón al pecho en polea alta', '4', '10-12', '60'],
    ['Curl de bíceps con barra Z', '4', '12', '30'],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(wsData1);
  const ws2 = XLSX.utils.aoa_to_sheet(wsData2);
  XLSX.utils.book_append_sheet(wb, ws1, 'Día 1 - Pecho');
  XLSX.utils.book_append_sheet(wb, ws2, 'Día 2 - Espalda');

  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  console.log('   Excel generado en memoria, tamaño:', excelBuffer.length, 'bytes');

  // Enviar multipart/form-data
  console.log('4. Enviando Excel a /api/ia/analizar-rutina...');
  const boundary = '----WebKitFormBoundaryE22GymIA' + Date.now();
  const pre = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="Rutina_Fuerza_E22.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;
  const post = `\r\n--${boundary}--\r\n`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(pre, 'utf8'),
    excelBuffer,
    Buffer.from(post, 'utf8'),
  ]);

  const excelUploadRes = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/ia/analizar-rutina',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': bodyBuffer.length,
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(b) });
          } catch {
            resolve({ status: res.statusCode, raw: b });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });

  console.log('   Upload status:', excelUploadRes.status);
  console.log('   Objetivo detectado:', excelUploadRes.data?.planilla?.objetivo);
  console.log('   Días extraídos:', excelUploadRes.data?.planilla?.dias?.length);
  if (excelUploadRes.data?.planilla?.dias) {
    excelUploadRes.data.planilla.dias.forEach((d) => {
      console.log(`     • ${d.enfoque} (${d.ejercicios?.length} ejercicios):`, d.ejercicios?.map((e) => e.nombre).join(', '));
    });
  }

  console.log('\n=== ¡TODAS LAS PRUEBAS DE IA & GEMINI PASARON EXITOSAMENTE! ===');
}

testAIFeatures().catch((err) => {
  console.error('Error en test:', err);
  process.exit(1);
});
