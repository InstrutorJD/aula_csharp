#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Ler o arquivo HTML
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extrair o código do interpretador
const scriptStart = htmlContent.indexOf('const KEYWORDS = new Set([');
const scriptEnd = htmlContent.indexOf('\n</script>', htmlContent.indexOf('function runCSharp(src){'));

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('❌ Não foi possível extrair o interpretador');
  process.exit(1);
}

const interpretadorCode = htmlContent.substring(scriptStart, scriptEnd);

// Teste simples
const testCode = `using System;

class Program
{
    static void Main()
    {
        string categoria = "Rasteiro";
        int vida = 30;
        int velocidade = 2;

        Console.WriteLine("Categoria: " + categoria);
        Console.WriteLine("Vida: " + vida);
        Console.WriteLine("Velocidade: " + velocidade);
    }
}`;

console.log('🧪 Debugando Interpretador C#\n');
console.log('═'.repeat(70));

const sandbox = { console: { log: () => {} } };
const context = vm.createContext(sandbox);

try {
  // Carregar o interpretador
  vm.runInContext(interpretadorCode, context, { timeout: 5000 });
  
  // Executar o teste
  console.log('📝 Código de teste:');
  console.log('─'.repeat(70));
  console.log(testCode);
  console.log('─'.repeat(70));
  
  // Testar tokenizer
  console.log('\n🔍 Testando Tokenizer...');
  const tokenizeCode = `
    const tokens = tokenize(\`${testCode.replace(/`/g, '\\`')}\`);
    var tokenList = tokens.slice(0, 30);
  `;
  
  vm.runInContext(tokenizeCode, context, { timeout: 5000 });
  const tokens = context.tokenList;
  
  console.log('Primeiros 30 tokens:');
  tokens.forEach((t, i) => {
    console.log(`  ${i}: type=${t.type}, value=${JSON.stringify(t.value)}, line=${t.line}`);
  });
  
  // Testar parser
  console.log('\n🔍 Testando Parser...');
  vm.runInContext(`
    try {
      const ast = parse(tokenList.concat({type:'eof', value:null, line:1}));
      var astOutput = JSON.stringify(ast, null, 2).substring(0, 500);
      var parseError = null;
    } catch (e) {
      var parseError = e.message;
      var astOutput = null;
    }
  `, context, { timeout: 5000 });
  
  if (context.parseError) {
    console.log(`❌ Erro no Parser: ${context.parseError}`);
  } else {
    console.log(`✅ Parse bem-sucedido`);
    console.log(context.astOutput);
  }
  
  // Testar interpretador completo
  console.log('\n🔍 Testando Interpretador Completo...');
  vm.runInContext(`
    try {
      const result = runCSharp(\`${testCode.replace(/`/g, '\\`')}\`);
      var output = result.output;
      var error = null;
    } catch (e) {
      var output = null;
      var error = e.message;
    }
  `, context, { timeout: 5000 });
  
  if (context.error) {
    console.log(`❌ Erro na Execução:`);
    console.log(`   ${context.error}`);
  } else {
    console.log(`✅ Execução bem-sucedida!`);
    console.log('Saída:');
    context.output.forEach((line, i) => {
      console.log(`  ${i + 1}. "${line}"`);
    });
  }
  
} catch (err) {
  console.error('❌ Erro na Sandbox:');
  console.error(`   ${err.message}`);
  console.error(`   ${err.stack}`);
}

console.log('\n' + '═'.repeat(70));
