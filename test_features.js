#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

console.log('🧪 TESTE DE VALIDAÇÃO DAS NOVAS FEATURES\n');
console.log('═'.repeat(70));

const tests = [];

// Teste 1: Música
tests.push({
  name: '🎵 Botão de Música',
  check: () => html.includes('btnMusicToggle') && html.includes('🎵 Música'),
  points: 15
});

// Teste 2: Timer Display
tests.push({
  name: '⏱️ Display do Timer',
  check: () => html.includes('timerDisplay') && html.includes('timerContainer'),
  points: 15
});

// Teste 3: Linha Numbers
tests.push({
  name: '📝 Numeração de Linhas',
  check: () => html.includes('lineNumbers') && html.includes('line-numbers'),
  points: 15
});

// Teste 4: CSS para Timer
tests.push({
  name: '🎨 CSS do Timer (warning/danger)',
  check: () => html.includes('timer-display.warning') && html.includes('timer-display.danger'),
  points: 15
});

// Teste 5: CSS para Linhas
tests.push({
  name: '🎨 CSS das Linhas (styling)',
  check: () => html.includes('.line-numbers') && html.includes('user-select:none'),
  points: 15
});

// Teste 6: Funções de Som
tests.push({
  name: '🔊 Sistema de Som (funções)',
  check: () => html.includes('playKeyboardSound') && html.includes('playBackgroundMusic'),
  points: 15
});

// Teste 7: Função de Timer
tests.push({
  name: '⏱️ Sistema de Timer (funções)',
  check: () => html.includes('startTimer') && html.includes('isWithinTimeLimit') && html.includes('getExtraXP'),
  points: 15
});

// Teste 8: Event Listeners
tests.push({
  name: '👂 Event Listeners (keydown/input)',
  check: () => html.includes("addEventListener('keydown'") && html.includes("addEventListener('input'"),
  points: 10
});

console.log('\nExecutando testes...\n');

let totalPoints = 0;
let passedTests = 0;

tests.forEach((test, idx) => {
  const passed = test.check();
  passedTests += passed ? 1 : 0;
  totalPoints += passed ? test.points : 0;
  
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'PASSOU' : 'FALHOU';
  console.log(`${icon} Teste ${idx+1}: ${test.name}`);
  console.log(`   Resultado: ${status} | Pontos: ${passed ? test.points : 0}/${test.points}\n`);
});

console.log('═'.repeat(70));
console.log(`\n📊 RESULTADO FINAL: ${passedTests}/${tests.length} testes passaram`);
console.log(`📈 Pontuação: ${totalPoints}/100 pontos\n`);

if (passedTests === tests.length){
  console.log('🎉 TODAS AS FEATURES FORAM IMPLEMENTADAS COM SUCESSO!\n');
  console.log('✅ Próximos passos:');
  console.log('   1. Abra o index.html no navegador');
  console.log('   2. Selecione a aba "JavaScript" ou "C#"');
  console.log('   3. Teste os seguintes recursos:');
  console.log('      • Clique em "🎵 Música" para ativar a música de fundo');
  console.log('      • Digite no editor para ouvir o som do teclado');
  console.log('      • Observe os números das linhas à esquerda');
  console.log('      • Veja o timer contando regressivamente (5 minutos)');
  console.log('      • Complete uma missão para ganhar XP bônus (se dentro do tempo)');
  console.log('   4. Confira o arquivo FEATURES_IMPLEMENTADAS.md para mais detalhes\n');
  process.exit(0);
} else {
  console.log('⚠️  Algumas features podem estar faltando. Verifique o HTML.\n');
  process.exit(1);
}
