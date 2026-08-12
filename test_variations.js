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

// Diferentes variações de código que podem estar causando o erro
const testCases = [
  {
    name: 'Sem trailing newline',
    code: `using System;

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
}`
  },
  {
    name: 'Com trailing newline',
    code: `using System;

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
}
`
  },
  {
    name: 'Com múltiplos trailing newlines',
    code: `using System;

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
}


`
  },
  {
    name: 'Sem using System',
    code: `class Program
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
}`
  }
];

console.log('🧪 Testando Diferentes Variações de Código\n');
console.log('═'.repeat(70));

const sandbox = { console: { log: () => {} } };
const context = vm.createContext(sandbox);

try {
  vm.runInContext(interpretadorCode, context, { timeout: 5000 });
  
  for (const testCase of testCases) {
    console.log(`\n📝 ${testCase.name}`);
    console.log('─'.repeat(70));
    
    try {
      vm.runInContext(`
        try {
          const result = runCSharp(\`${testCase.code.replace(/`/g, '\\`')}\`);
          var output = result.output;
          var error = null;
        } catch (e) {
          var output = null;
          var error = e.message;
        }
      `, context, { timeout: 5000 });
      
      if (context.error) {
        console.log(`❌ Erro: ${context.error}`);
      } else {
        console.log(`✅ Sucesso!`);
        console.log('Saída:');
        context.output.forEach((line, i) => {
          console.log(`  ${i + 1}. "${line}"`);
        });
      }
    } catch (err) {
      console.log(`❌ Erro na Sandbox: ${err.message}`);
    }
  }
  
} catch (err) {
  console.error('❌ Erro ao carregar interpretador:');
  console.error(err.message);
}

console.log('\n' + '═'.repeat(70));
