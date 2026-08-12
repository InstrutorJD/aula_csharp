#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Ler o arquivo HTML
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extrair código do interpretador
const scriptStart = htmlContent.indexOf('const KEYWORDS = new Set([');
const scriptEnd = htmlContent.indexOf('\n</script>', htmlContent.indexOf('function runCSharp(src){'));
const interpretadorCode = htmlContent.substring(scriptStart, scriptEnd);

// Extrair gabaritos do LEVELS_CS
const activityIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
const activities = [];

for (const id of activityIds) {
  const pattern = new RegExp(`id:\\s*'${id}',[\\s\\S]*?(?=id:\\s*'m\\d'|\\];)`);
  const match = htmlContent.match(pattern);
  
  if (match) {
    const activityBlock = match[0];
    
    const titleMatch = activityBlock.match(/title:\s*'([^']+)'/);
    const title = titleMatch ? titleMatch[1] : 'Unknown';
    
    const gabaritoMatch = activityBlock.match(/gabarito:\s*`([^`]+)`/s);
    const gabarito = gabaritoMatch ? gabaritoMatch[1].trim() : '';
    
    const expectedMatch = activityBlock.match(/expectedOutput:\s*\[([\s\S]*?)\]/);
    let expectedOutput = [];
    if (expectedMatch) {
      const lines = expectedMatch[1].match(/'([^']+)'/g);
      if (lines) {
        expectedOutput = lines.map(l => l.replace(/'/g, ''));
      }
    }
    
    activities.push({ id, title, gabarito, expectedOutput });
  }
}

console.log('🎯 TESTE FINAL - EXECUÇÃO REAL DOS GABARITOS\n');
console.log('═'.repeat(70));
console.log(`Testando ${activities.length} atividades extraídas do HTML...\n`);

const sandbox = { console: { log: () => {} } };
const context = vm.createContext(sandbox);

let passedCount = 0;
let totalCount = activities.length;

try {
  vm.runInContext(interpretadorCode, context, { timeout: 5000 });
  
  for (const activity of activities) {
    const testName = `${activity.id}: ${activity.title.substring(0, 50)}...`;
    
    try {
      vm.runInContext(`
        try {
          const result = runCSharp(\`${activity.gabarito.replace(/`/g, '\\`')}\`);
          var testOutput = result.output;
          var testError = null;
        } catch (e) {
          var testOutput = null;
          var testError = e.message;
        }
      `, context, { timeout: 5000 });
      
      if (context.testError) {
        console.log(`❌ ${testName}`);
        console.log(`   Erro: ${context.testError}`);
      } else {
        // Verificar se a saída corresponde
        const expectedJoined = activity.expectedOutput.join('\n');
        const gotJoined = context.testOutput.join('\n');
        const matches = expectedJoined === gotJoined;
        
        if (matches) {
          console.log(`✅ ${testName}`);
          console.log(`   Saída: ${activity.expectedOutput.length} linha(s) corretas`);
          passedCount++;
        } else {
          console.log(`⚠️  ${testName}`);
          console.log(`   Esperado: ${JSON.stringify(activity.expectedOutput)}`);
          console.log(`   Obtido:   ${JSON.stringify(context.testOutput)}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${testName}`);
      console.log(`   Erro na Sandbox: ${err.message}`);
    }
  }
  
} catch (err) {
  console.error('❌ Erro ao carregar interpretador:');
  console.error(err.message);
}

console.log('\n' + '═'.repeat(70));
console.log(`\n📊 RESULTADO FINAL: ${passedCount}/${totalCount} gabaritos funcionais\n`);

if (passedCount === totalCount) {
  console.log('🎉 SUCESSO! TODOS OS GABARITOS FUNCIONAM PERFEITAMENTE!');
  console.log('\n✅ Ações recomendadas:');
  console.log('   1. Limpe o cache do navegador (Ctrl+Shift+Delete)');
  console.log('   2. Recarregue a página (F5 ou Ctrl+R)');
  console.log('   3. Teste a atividade m1 clicando em "RESTAURAR MOLDE"');
  console.log('   4. Clique em "EXECUTAR ▶" para rodar o gabarito');
  console.log('\n✅ Se o erro persistir, o problema não está no interpretador.');
  console.log('   Pode ser um problema de cache local ou versão diferente do arquivo.');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalCount - passedCount} gabarito(s) com problema`);
  process.exit(1);
}
