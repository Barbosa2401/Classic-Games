from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
def init_db():
    conn = sqlite3.connect('jogadores.db')
    cursor = conn.cursor()
    # Criando a tabela se não existir (Corrigido: EXISTS e INTEGER)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jogadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            idade INTEGER,
            vitorias INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

# Inicializa o banco ao rodar o app
init_db()

# --- ROTAS DE NAVEGAÇÃO ---

@app.route('/')
def home():
    """Página Inicial com os Radio Buttons Cyber"""
    return render_template('index.html')

@app.route('/jogar', methods=['POST'])
def jogar():
    """Lógica que redireciona para o jogo escolhido no formulário"""
    jogo_selecionado = request.form.get('game-choice')
    
    if jogo_selecionado == 'velha':
        return render_template('jogo_da_velha.html')
    elif jogo_selecionado == 'cobra':
        return render_template('jogo_da_cobra.html')
    elif jogo_selecionado == 'xadrez':
        return render_template('jogo_de_xadrez.html')
    elif jogo_selecionado == 'campo':
        return render_template('campo_minado.html')
    elif jogo_selecionado == 'paciencia':
        return render_template('paciencia.html')
    elif jogo_selecionado == 'dino':
        return render_template('jogo_dino.html')
    else:
        # Caso tente acessar um jogo ainda não implementado (ex: Dominó)
        return "<h1>ERRO 404: Jogo em desenvolvimento no sistema...</h1><a href='/'>Voltar</a>", 404

# --- ROTAS INDIVIDUAIS (Caso queira acessar direto pelo link) ---

@app.route('/velha')
def rota_velha():
    return render_template('jogo_da_velha.html')

@app.route('/cobra')
def rota_cobra():
    return render_template('jogo_da_cobra.html')

@app.route('/xadrez')
def rota_xadrez():
    return render_template('jogo_de_xadrez.html')

# --- API PARA SALVAR RESULTADOS ---

@app.route('/salvar_vitoria', methods=['POST'])
def salvar_vitoria():
    """Recebe dados do JS para registrar no SQLite"""
    dados = request.json
    nome = dados.get('nome', 'Anônimo')
    idade = dados.get('idade', 0)
    
    try:
        conn = sqlite3.connect('jogadores.db')
        cursor = conn.cursor()
        
        # Verifica se o jogador já existe para somar vitória
        cursor.execute("SELECT vitorias FROM jogadores WHERE nome = ?", (nome,))
        resultado = cursor.fetchone()
        
        if resultado:
            cursor.execute("UPDATE jogadores SET vitorias = vitorias + 1 WHERE nome = ?", (nome,))
        else:
            cursor.execute("INSERT INTO jogadores (nome, idade, vitorias) VALUES (?, ?, 1)", (nome, idade))
            
        conn.commit()
        conn.close()
        return jsonify({"status": "sucesso", "mensagem": f"Vitória de {nome} registrada!"})
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

if __name__ == '__main__':
    # Rodando em modo debug para atualizar o servidor ao salvar o código
    app.run(debug=True)