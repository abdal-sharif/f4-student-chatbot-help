from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Load faculty data from JSON file
with open('data/university_info.json', 'r', encoding='utf-8') as f:
    faculties_data = json.load(f)

def suggest_faculties(subjects):
    """
    Suggest faculties based on the subjects the user is good at.
    """
    matched_faculties = []

    for faculty in faculties_data['faculties']:
        matches = [subject.lower() for subject in faculty['related_subjects']]
        input_subjects = [subject.lower() for subject in subjects]

        if any(input_subject in matches for input_subject in input_subjects):
            matched_faculties.append(faculty)

    if matched_faculties:
        response_text = "Waxaan kugula talinaynaa kulliyadaha soo socda oo ku habboon waxyaabaha aad ku wanaagsan tahay:<br>"
        for faculty in matched_faculties:
            response_text += f"<b>{faculty['name']}:</b> {faculty['description']}<br>"
            response_text += f"<a href='https://www.simad.edu/faculties/{faculty['name'].replace(' ', '-').lower()}' target='_blank'>Sii akhri...</a><br>"
    else:
        response_text = "Ma helin kulliyado ku habboon mowduucyada aad sheegtay. Fadlan isku day mowduucyo kale."

    return response_text

def extract_subjects(query):
    """
    Extract and normalize subjects from the user's query.
    """
    keywords = {
        "math": "Mathematics",
        "xisaabta": "Mathematics",
        "physics": "Physics",
        "fiziks": "Physics",
        "biology": "Biology",
        "bayooloji": "Biology",
        "chemistry": "Chemistry",
        "kimistar": "Chemistry",
        # Add more subjects as needed
    }

    detected_subjects = []
    for keyword, subject in keywords.items():
        if keyword in query:
            detected_subjects.append(subject)

    return detected_subjects

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_query = request.form.get('query', '').lower().strip()

    # Extract relevant subjects from the user's query
    subjects = extract_subjects(user_query)
    response_text = suggest_faculties(subjects)
    return jsonify({"text": response_text, "images": []})

if __name__ == '__main__':
    app.run(debug=True)
