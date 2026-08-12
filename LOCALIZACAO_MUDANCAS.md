# 🔍 Guia de Mudanças — Onde Encontrar Cada Feature

## 📍 Localização Exata das Mudanças no index.html

### 1. 🎵 MÚSICA DE FUNDO

**Botão HTML** (Statusbar):
```html
<!-- Linha ~196 -->
<div class="music-controls">
  <button id="btnMusicToggle" class="ghost" title="...">🎵 Música</button>
</div>
```

**CSS** (Estilo do botão):
```css
/* Linha ~157-158 */
.music-controls{
  display:flex; gap:6px; align-items:center; font-size:11px;
}
.music-controls button{ padding:6px 12px; }
```

**JavaScript** (Lógica):
```javascript
/* Linha ~1986-2005 */
// Função: playBackgroundMusic() — síntese recursiva de áudio
// Event Listener: btnMusicToggle click
// Função: initAudioContext() — inicializa Web Audio API
```

---

### 2. 🎹 SOM DE TECLADO

**CSS**: (Nenhum CSS específico necessário)

**JavaScript**:
```javascript
/* Linha ~1966-1977 */
function playKeyboardSound(){
  // Cria oscilador temporário de 800-1200Hz
  // Toca por 50ms com fade out exponencial
}

/* Linha ~2228-2231 */
editorEl.addEventListener('keydown', (e) => {
  if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete'){
    playKeyboardSound();
  }
});
```

---

### 3. 📝 NUMERAÇÃO DE LINHAS

**HTML** (Estrutura do Editor):
```html
<!-- Linha ~217-220 -->
<div class="editor-wrap">
  <div class="line-numbers" id="lineNumbers"></div>
  <textarea id="editor" spellcheck="false"></textarea>
</div>
```

**CSS** (Estilo das linhas):
```css
/* Linha ~118-132 */
.editor-wrap{ position:relative; display:flex; }
.line-numbers{
  background:#0a0d0a; color:var(--ink-dim); padding:12px 8px;
  font-family:'JetBrains Mono', monospace; font-size:13px; line-height:1.55;
  text-align:right; border-right:1px solid var(--line);
  user-select:none; flex:none; width:40px;
}
.line-numbers div{ height:1.55em; }
.editor-wrap textarea#editor{
  width:100%; min-height:300px; resize:vertical;
  background:#060806; color:var(--ink); border:1px solid var(--line);
  font-family:'JetBrains Mono', monospace; font-size:13px; line-height:1.55;
  padding:12px 14px; tab-size:4; margin:0;
}
```

**JavaScript**:
```javascript
/* Linha ~2002-2012 */
function updateLineNumbers(){
  const lines = editorEl.value.split('\n').length;
  const lineNumbersDiv = document.getElementById('lineNumbers');
  lineNumbersDiv.innerHTML = '';
  for (let i = 1; i <= Math.max(lines, 1); i++){
    const div = document.createElement('div');
    div.textContent = i;
    lineNumbersDiv.appendChild(div);
  }
}

/* Linha ~2227-2228, 2234-2235 */
editorEl.addEventListener('input', updateLineNumbers);
editorEl.addEventListener('scroll', () => {
  document.getElementById('lineNumbers').style.transform = 
    `translateY(-${editorEl.scrollTop}px)`;
});
```

---

### 4. ⏱️ TIMER PARA RESPONDER

**HTML** (Display):
```html
<!-- Linha ~214-216 -->
<div id="timerContainer" style="margin-bottom:8px;">
  <span class="timer-display" id="timerDisplay">⏱ 5m 0s</span>
</div>
```

**CSS** (Estilo):
```css
/* Linha ~148-157 */
.timer-display{
  display:inline-block; margin-left:18px; font-size:12px;
  font-family:'VT323', monospace; padding:6px 12px;
  border:1px solid var(--line); background:var(--panel2);
  letter-spacing:1px;
}
.timer-display.warning{ border-color:var(--yellow); color:var(--yellow); }
.timer-display.danger{
  border-color:var(--blood-bright); color:var(--blood-bright);
  animation:pulse-timer 600ms ease infinite;
}
@keyframes pulse-timer{ /* pulsação vermelha */ }
```

**JavaScript**:
```javascript
/* Linha ~1979-2001 */
function formatTime(seconds){ /* Converte segundos em "4m 30s" */ }
function startTimer(){ /* Inicia 5min timer com atualização 500ms */ }
function isWithinTimeLimit(){ /* Verifica se ainda está dentro do tempo */ }

/* Chamado em: */
/* Linha ~2044 — selectLevel() — inicia timer ao selecionar missão */
startTimer();
```

---

### 5. 💰 XP EXTRA PARA TIMER

**JavaScript** — Cálculo de Bônus:
```javascript
/* Linha ~2001-2010 */
function getExtraXP(){
  // Calcula XP extra baseado em tempo restante
  // 10 XP se 3+ min, 8 se 2-3 min, etc.
}

/* Integrado na função runCode: */
/* Linha ~2078-2093 */
if (isWithinTimeLimit()){
  const extraXp = getExtraXP();
  if (extraXp > 0){
    xpGained += extraXp;
    bonusMessage = ` +${extraXp} BÔNUS (dentro do tempo!)`;
  }
}

/* Exibe mensagem: */
resultBannerEl.textContent = `✓ Missão concluída! +${lvl.xp}${bonusMessage} XP ...`;
```

---

## 🔗 Conexões Entre Features

```
startTimer()
├─→ Inicia quando selectLevel() é chamado
├─→ Atualiza timerDisplay a cada 500ms
├─→ Muda classe CSS (.warning, .danger)
└─→ Roda getExtraXP() quando conclusão for válida

playKeyboardSound()
├─→ Chamado em addEventListener('keydown')
├─→ Também em addEventListener('keydown') para Tab
└─→ Também em qualquer caractere digitado

updateLineNumbers()
├─→ Chamado em addEventListener('input')
├─→ Regenera divs filhas de lineNumbers
└─→ Sincroniza com scroll via addEventListener('scroll')

playBackgroundMusic()
├─→ Chamado quando btnMusicToggle é clicado
├─→ Executa recursivamente a cada 4 segundos
└─→ Para quando musicEnabled = false
```

---

## 📊 Estatísticas de Mudanças

| Aspecto | Quantidade |
|---------|-----------|
| Linhas CSS adicionadas | ~80 |
| Linhas HTML adicionadas | ~15 |
| Linhas JavaScript adicionadas | ~300 |
| Funções JavaScript novas | 8 |
| Event listeners novos | 4 |
| Classes CSS novas | 6 |
| IDs de elementos novos | 3 |
| Variáveis globais novas | 6 |

---

## 🧪 Como Testar Cada Feature

### Testar Música
```javascript
// No console do navegador:
document.getElementById('btnMusicToggle').click();
// Ouvirá som musical suave
```

### Testar Som de Teclado
```javascript
// Apenas digite no editor — vai ouvir beep a cada tecla
```

### Testar Numeração
```javascript
// Abra a aba C# → Atividade m1
// Verá números 1, 2, 3... na esquerda
// Role o editor — números acompanham o scroll
```

### Testar Timer
```javascript
// Selecione uma nova missão
// Verá "⏱ 5m 0s" e contagem regressiva
// Após 4 minutos ficará amarelo (warning)
// Após 5 minutos ficará piscando em vermelho (danger)
```

### Testar XP Extra
```javascript
// Complete qualquer missão em menos de 5 minutos
// Mensagem mostrará: "+100 +8 BÔNUS (dentro do tempo!) XP"
```

---

## ⚙️ Variáveis Globais Adicionadas

```javascript
let currentTimerId = null;          // ID do interval do timer
let timerStartTime = null;          // Timestamp quando timer começou
let musicEnabled = false;           // Se música está ativa
let audioContext = null;            // Web Audio API context
let oscillator = null;              // Oscilador para música
```

---

## 🐛 Debugging

Se algo não funcionar:

1. **Música não toca?**
   - Verifique console (F12) por erros de áudio
   - Pode ser bloqueada por permissões de navegador
   - Teste em localhost ou HTTPS

2. **Som de teclado não funciona?**
   - Verifique se `playKeyboardSound()` existe
   - Verifique eventos no console: `console.log('som')`

3. **Linhas não aparecem?**
   - Verifique se `updateLineNumbers()` é chamado
   - Verifique CSS de `.line-numbers`

4. **Timer não funciona?**
   - Verifique se `startTimer()` é chamado
   - Procure por `console.log(timerStartTime)` no código

5. **XP extra não aparece?**
   - Teste `getExtraXP()` no console
   - Verifique se `isWithinTimeLimit()` retorna true
   - Procure por `bonusMessage` na saída

---

**Versão**: 1.0  
**Arquivo**: index.html (84,813 bytes)  
**Compatibilidade**: Chrome 80+, Firefox 75+, Safari 14+
