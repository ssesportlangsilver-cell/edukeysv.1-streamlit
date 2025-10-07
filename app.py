from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="EduKeys v3", layout="wide", page_icon="🎹")
st.markdown('<style>#MainMenu{visibility:hidden} footer{visibility:hidden} header{visibility:hidden}</style>', unsafe_allow_html=True)

root = Path(__file__).parent
html_src = (root / 'index.html').read_text(encoding='utf-8')
css_src  = (root / 'styles.css').read_text(encoding='utf-8')
js_src   = (root / 'app.js').read_text(encoding='utf-8')

html_src = html_src.replace('<link href="styles.css" rel="stylesheet"/>', '').replace('<script src="app.js"></script>', '')

embed = """<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>EduKeys v3</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
<style>
{css}
html, body {{ height:100%; }}
body {{ margin:0; }}
#route-login, #route-home, #route-game, #route-results {{ min-height: 92vh; }}
</style>
</head>
<body>
{html}
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script>
{js}
</script>
</body>
</html>""".format(css=css_src, html=html_src, js=js_src)

components.html(embed, height=1000, scrolling=True)
