from flask import Flask, render_template, request, jsonify
from chatbot import process_query

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.form['query']
    response_data = process_query(user_input)
    return jsonify(response_data)

if __name__ == "__main__":
    app.run(debug=True)
