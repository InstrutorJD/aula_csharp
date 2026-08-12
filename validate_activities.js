#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ler o arquivo HTML
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extrair as atividades de C# usando regex
const csharpLevelsMatch = htmlContent.match(/const LEVELS_CS = \[([\s\S]*?)\n\];/);
if (!csharpLevelsMatch) {
  console.error('❌ Não foi possível encontrar LEVELS_CS no HTML');
  process.exit(1);
}

// Parse mais sofisticado para extrair atividades
const levelsText = 'const LEVELS_CS = [' + csharpLevelsMatch[1] + '\n];';

// Estratégia: procurar por padrões "id: 'm1'" até "id: 'm8'"
const activityIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
const activities = [];

for (const id of activityIds) {
  // Procurar por "id: 'mX'," seguido de título e outros dados
  const pattern = new RegExp(`id:\\s*'${id}',[\\s\\S]*?(?=id:\\s*'m\\d'|\\];)`);
  const match = htmlContent.match(pattern);
  
  if (match) {
    const activityBlock = match[0];
    
    // Extrair título
    const titleMatch = activityBlock.match(/title:\s*'([^']+)'/);
    const title = titleMatch ? titleMatch[1] : 'Unknown';
    
    // Extrair gabarito
    const gabaritoMatch = activityBlock.match(/gabarito:\s*`([^`]+)`/s);
    const gabarito = gabaritoMatch ? gabaritoMatch[1].trim() : '';
    
    // Extrair expectedOutput
    const expectedMatch = activityBlock.match(/expectedOutput:\s*\[([\s\S]*?)\]/);
    let expectedOutput = [];
    if (expectedMatch) {
      const lines = expectedMatch[1].match(/'([^']+)'/g);
      if (lines) {
        expectedOutput = lines.map(l => l.replace(/'/g, ''));
      }
    }
    
    activities.push({
      id,
      title,
      gabarito,
      expectedOutput,
      hasClass: gabarito.includes('class '),
      hasMain: gabarito.includes('Main()') || gabarito.includes('Main '),
      hasConsole: gabarito.includes('Console.WriteLine')
    });
  }
}

console.log('🧪 Validação de Atividades de C# — PixelForge Studios\n');
console.log('═'.repeat(70));

let totalPass = 0;
let totalFail = 0;

for (const activity of activities) {
  const hasAll = activity.hasClass && activity.hasMain && activity.hasConsole;
  const passed = activity.expectedOutput.length > 0 && hasAll;
  
  if (passed) {
    totalPass++;
    console.log(`\n✓ PASS ${activity.id}: ${activity.title}`);
  } else {
    totalFail++;
    console.log(`\n✗ FAIL ${activity.id}: ${activity.title}`);
  }
  
  console.log(`  Expected outputs: ${activity.expectedOutput.length}`);
  console.log(`  Has class: ${activity.hasClass ? '✓' : '✗'}`);
  console.log(`  Has Main(): ${activity.hasMain ? '✓' : '✗'}`);
  console.log(`  Has Console.WriteLine: ${activity.hasConsole ? '✓' : '✗'}`);
  
  if (activity.expectedOutput.length > 0) {
    console.log(`  Output lines:`);
    activity.expectedOutput.forEach((line, i) => {
      console.log(`    ${i + 1}. "${line}"`);
    });
  }
  
  if (!activity.hasClass || !activity.hasMain || !activity.hasConsole) {
    console.log(`  ⚠️  Gabarito (primeiras 200 chars):`);
    console.log(`    ${activity.gabarito.substring(0, 200)}...`);
  }
}

console.log('\n' + '═'.repeat(70));
console.log(`\n📊 Resumo: ${totalPass}/${activities.length} atividades validadas com sucesso\n`);

if (totalPass === activities.length) {
  console.log('✅ Todas as atividades estão estruturalmente corretas!');
  console.log('   Estrutura verificada:');
  console.log('   ✓ Declaração de class/struct');
  console.log('   ✓ Método Main()');
  console.log('   ✓ Console.WriteLine para saída');
  console.log('   ✓ Saída esperada definida');
  process.exit(0);
} else {
  console.log(`❌ ${totalFail} atividade(s) com problemas de estrutura.`);
  process.exit(1);
}
