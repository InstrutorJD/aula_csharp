#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Ler o arquivo HTML
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extrair todo o código do interpretador de C# do HTML
// Este é um trecho grande, então vamos procurar entre pontos específicos
const interpretadorStart = htmlContent.indexOf('const KEYWORDS = new Set([');
const interpretadorEnd = htmlContent.indexOf('function runCSharp(src){');
const completaEnd = htmlContent.indexOf('\n</script>', interpretadorEnd);

if (interpretadorStart === -1 || interpretadorEnd === -1) {
  console.error('❌ Não foi possível extrair o interpretador C# completo');
  process.exit(1);
}

const interpretadorCode = htmlContent.substring(interpretadorStart, completaEnd);

// Extrair as atividades
const csharpLevelsMatch = htmlContent.match(/const LEVELS_CS = \[([\s\S]*?)\n\];/);
if (!csharpLevelsMatch) {
  console.error('❌ Não foi possível encontrar LEVELS_CS');
  process.exit(1);
}

const activityIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
const activities = [];

for (const id of activityIds) {
  const pattern = new RegExp(`id:\\s*'${id}',[\\s\\S]*?(?=id:\\s*'m\\d'|\\];)`);
  const match = htmlContent.match(pattern);
  
  if (match) {
    const activityBlock = match[0];
    
    const titleMatch = activityBlock.match(/title:\\s*'([^']+)'/);
    const title = titleMatch ? titleMatch[1] : 'Unknown';
    
    const gabaritoMatch = activityBlock.match(/gabarito:\\s*`([^`]+)`/s);
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

console.log('🚀 Teste de Execução do Interpretador C#\n');
console.log('═'.repeat(70));

let passedTests = 0;
let failedTests = 0;

// Testar cada atividade
for (const activity of activities) {
  console.log(`\n📝 ${activity.id}: ${activity.title}`);
  
  try {
    // Criar um sandbox para executar o código
    // Incluir o interpretador no contexto
    const sandbox = {
      console: {
        log: function() {
          return undefined;
        }
      }
    };
    
    // Compilar o interpretador
    const context = vm.createContext(sandbox);
    
    // Carregar o interpretador (sem executá-lo)
    vm.runInContext(interpretadorCode, context, {
      timeout: 5000,
      displayErrors: true
    });
    
    // Agora executar o gabarito
    vm.runInContext(`
      try {
        const result = runCSharp(\`${activity.gabarito.replace(/`/g, '\\`')}\`);
        var testOutput = result.output;
      } catch(e) {
        var testError = e.message;
      }
    `, context, { timeout: 5000 });
    
    const testOutput = context.testOutput;
    const testError = context.testError;
    
    if (testError) {
      console.log(`  ❌ Erro de execução: ${testError}`);
      failedTests++;
      continue;
    }
    
    // Comparar saída
    let outputMatches = true;
    if (testOutput.length !== activity.expectedOutput.length) {
      outputMatches = false;
    } else {
      for (let i = 0; i < testOutput.length; i++) {
        if (testOutput[i] !== activity.expectedOutput[i]) {
          outputMatches = false;
          break;
        }
      }
    }
    
    if (outputMatches) {
      console.log(`  ✅ Saída correta (${testOutput.length} linhas)`);
      for (let i = 0; i < testOutput.length; i++) {
        console.log(`     ${i + 1}. "${testOutput[i]}"`);
      }
      passedTests++;
    } else {
      console.log(`  ❌ Saída incorreta`);
      console.log(`     Esperado:`);
      activity.expectedOutput.forEach((line, i) => {
        console.log(`       ${i + 1}. "${line}"`);
      });
      console.log(`     Obtido:`);
      if (testOutput) {
        testOutput.forEach((line, i) => {
          console.log(`       ${i + 1}. "${line}"`);
        });
      }
      failedTests++;
    }
    
  } catch (err) {
    console.log(`  ❌ Erro no teste: ${err.message}`);
    failedTests++;
  }
}

console.log('\n' + '═'.repeat(70));
console.log(`\n📊 Resultado Final: ${passedTests}/${activities.length} atividades funcionais\n`);

if (passedTests === activities.length) {
  console.log('✅ SUCESSO! Todos os gabaritos executam corretamente!');
  console.log('   O interpretador C# está funcional.');
  console.log('   Todas as atividades produzem a saída esperada.');
  process.exit(0);
} else {
  console.log(`⚠️  ${failedTests} atividade(s) com problemas de execução.`);
  process.exit(1);
}
