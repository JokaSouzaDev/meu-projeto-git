# Porsche 911 Turbo S — 3D Scroll Experience

Protótipo promocional independente, estático e pronto para Vercel.

## Estrutura

- `index.html` — página principal na raiz, compatível com deploy estático da Vercel.
- `styles.css` — layout responsivo, capítulos e interface.
- `script.js` — Three.js, carregamento do GLB, iluminação e timeline baseada no scroll.
- `assets/porsche-911-concept.glb` — modelo 3D original estilizado criado para este protótipo.
- `vercel.json` — headers de cache para assets 3D.

## Como rodar localmente

Use qualquer servidor estático. Exemplo com Python:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

> Não abra o `index.html` diretamente por `file://`, porque módulos ES e o carregamento do `.glb` precisam de HTTP.

## Deploy na Vercel

Importe o repositório e configure `porsche-scroll-3d` como Root Directory. Depois mantenha:

- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: vazio

A Vercel servirá o `index.html` diretamente.

## Observação de marca

Este projeto não é oficial nem afiliado à Porsche AG. Porsche e 911 são marcas de seus respectivos titulares. O modelo 3D incluído é uma criação estilizada e original para demonstração técnica, não um asset oficial extraído da fabricante.
