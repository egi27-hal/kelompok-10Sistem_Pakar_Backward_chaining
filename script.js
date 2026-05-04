const rules = [
    { animal: "Kucing", ciri: ["berbulu", "menyusui", "bertaring", "mengeong"], image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { animal: "Anjing", ciri: ["berbulu", "menyusui", "bertaring", "menggonggong"], image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { animal: "Sapi", ciri: ["berbulu", "menyusui", "pemakan rumput"], image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { animal: "Kelelawar", ciri: ["berbulu", "bersayap", "menyusui", "aktif malam hari"], image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Townsend%27s_big-eared_bat.jpg/400px-Townsend%27s_big-eared_bat.jpg" },
    { animal: "Burung Elang", ciri: ["berbulu", "bersayap", "bertelur", "berparuh", "berparuh tajam", "pemakan daging"], image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Haliaeetus_leucocephalus_-on_a_branch_overlooking_a_lake_in_Kodiak%2C_Alaska%2C_USA-8.jpg/400px-Haliaeetus_leucocephalus_-on_a_branch_overlooking_a_lake_in_Kodiak%2C_Alaska%2C_USA-8.jpg" },
    { animal: "Bebek", ciri: ["berbulu", "bersayap", "bertelur", "berparuh", "kaki berselaput"], image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Mallard2.jpg/400px-Mallard2.jpg" },
    { animal: "Ayam", ciri: ["berbulu", "bersayap", "bertelur", "berparuh"], image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { animal: "Ikan", ciri: ["bersisik", "hidup di air", "bernapas dengan insang", "bertelur"], image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { animal: "Ular", ciri: ["bersisik", "tidak berkaki", "bertelur", "pemakan daging"], image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Garter_Snake_Close_Up.jpg/400px-Garter_Snake_Close_Up.jpg" },
    { animal: "Katak", ciri: ["hidup di air dan darat", "bertelur", "kulit lembab"], image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ranoidea_chloris_-_1.jpg/400px-Ranoidea_chloris_-_1.jpg" }
];

let knownFacts = {}; // Stores ciri: boolean
let currentRuleIndex = 0;
let currentCiriIndex = 0;

const welcomeScreen = document.getElementById('welcome-screen');
const questionScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const resultAnimal = document.getElementById('result-animal');
const resultTitle = document.getElementById('result-title');
const progressBar = document.getElementById('progress');
const currentHypothesisText = document.getElementById('current-hypothesis');
const candidatesList = document.getElementById('candidates-list');

document.getElementById('start-btn').addEventListener('click', startIdentification);
document.getElementById('yes-btn').addEventListener('click', () => handleAnswer(true));
document.getElementById('no-btn').addEventListener('click', () => handleAnswer(false));
document.getElementById('restart-btn').addEventListener('click', restart);

function startIdentification() {
    welcomeScreen.style.display = 'none';
    questionScreen.style.display = 'block';
    currentRuleIndex = 0;
    currentCiriIndex = 0;
    knownFacts = {};
    updateQuestion();
}

function getPossibleRules() {
    return rules.filter(rule => {
        // Evaluate rule based on known facts (Standard Backward Chaining)
        for (let i = 0; i < rule.ciri.length; i++) {
            const ciri = rule.ciri[i];
            if (knownFacts[ciri] === false) {
                return false; // This rule requires a ciri that we know is false
            }
        }
        return true;
    });
}

function updateQuestion() {
    const possible = getPossibleRules();

    // Update candidates list UI
    if (candidatesList) {
        candidatesList.innerHTML = possible.map(p => `
            <div class="candidate-item">
                <img src="${p.image}" alt="${p.animal}" class="candidate-img">
                <span>${p.animal}</span>
            </div>
        `).join('');
    }

    if (possible.length === 0) {
        showResult(null);
        return;
    }

    const nextPossibleIndex = rules.findIndex((rule, index) => index >= currentRuleIndex && possible.includes(rule));

    if (nextPossibleIndex === -1) {
        showResult(null);
        return;
    }

    currentRuleIndex = nextPossibleIndex;
    const currentRule = rules[currentRuleIndex];

    // Update UI to show current hypothesis
    if (currentHypothesisText) {
        currentHypothesisText.innerText = `Memeriksa kemungkinan: ${currentRule.animal}`;
    }

    let unknownCiriIndex = currentRule.ciri.findIndex(ciri => knownFacts[ciri] === undefined);

    if (unknownCiriIndex === -1) {
        // All ciri for this rule are true
        showResult(currentRule.animal);
        return;
    }

    currentCiriIndex = unknownCiriIndex;
    const ciri = currentRule.ciri[currentCiriIndex];

    questionText.innerText = `Apakah hewan tersebut memiliki ciri '${ciri}'?`;

    const uniqueCiri = [...new Set(rules.flatMap(r => r.ciri))];
    const totalCiri = uniqueCiri.length;
    const answeredCiri = Object.keys(knownFacts).length;
    const progress = (answeredCiri / totalCiri) * 100;
    progressBar.style.width = `${progress}%`;
}

function handleAnswer(answer) {
    const currentRule = rules[currentRuleIndex];
    const ciri = currentRule.ciri[currentCiriIndex];

    knownFacts[ciri] = answer;

    questionText.style.opacity = '0.5';
    setTimeout(() => {
        questionText.style.opacity = '1';
        updateQuestion();
    }, 200);
}

function showResult(animal) {
    questionScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    progressBar.style.width = '100%';

    const resultImageWrapper = document.getElementById('result-image-wrapper');
    const resultImage = document.getElementById('result-image');

    if (animal) {
        resultTitle.innerText = "HEWAN TERIDENTIFIKASI:";
        resultAnimal.innerText = animal;

        const foundRule = rules.find(r => r.animal === animal);
        if (foundRule && foundRule.image) {
            resultImage.src = foundRule.image;
            resultImage.style.display = 'block';
            resultImageWrapper.style.display = 'block';
        }
    } else {
        resultTitle.innerText = "HASIL ANALISIS:";
        resultAnimal.innerText = "Hewan Tidak Dikenali";
        resultAnimal.style.color = "var(--error)";
        if (resultImageWrapper) resultImageWrapper.style.display = 'none';
    }
}

function restart() {
    resultScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    progressBar.style.width = '0%';
}

