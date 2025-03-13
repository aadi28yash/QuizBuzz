document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAuthenticated || currentUser.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    const quizId = localStorage.getItem('reviewQuizId');
    if (!quizId) {
        alert('No quiz selected for review');
        window.location.href = 'student_dashboard.html';
        return;
    }

    loadQuizReview(quizId, currentUser);
});

function loadQuizReview(quizId, currentUser) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = quizzes.find(q => q.id === quizId);
    
    const results = JSON.parse(localStorage.getItem('quizResults')) || [];
    const userResult = results.find(r => r.quizId === quizId && r.studentId === currentUser.id);

    if (!quiz || !userResult) {
        alert('Quiz data not found');
        window.location.href = 'student_dashboard.html';
        return;
    }

    // Display quiz title and score
    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('scoreDisplay').textContent = `${userResult.score}/${quiz.questions.length}`;
    document.getElementById('percentageDisplay').textContent = 
        `${Math.round((userResult.score / quiz.questions.length) * 100)}%`;

    // Display questions with answers
    const reviewContainer = document.getElementById('questionsReview');
    quiz.questions.forEach((question, index) => {
        // Get the user's answer for this question from userResult.answers array
        const userAnswer = userResult.answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-review';
        
        questionDiv.innerHTML = `
            <div class="question-header">
                <h3>Question ${index + 1}</h3>
                <span class="result-badge ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? 'Correct' : 'Incorrect'}
                    <i class="fas ${isCorrect ? 'fa-check' : 'fa-times'}"></i>
                </span>
            </div>
            <p class="question-text">${question.questionText}</p>
            <div class="options-review">
                ${Object.entries(question.options).map(([key, value]) => `
                    <div class="option 
                        ${key === question.correctAnswer ? 'correct' : ''} 
                        ${key === userAnswer && key !== question.correctAnswer ? 'incorrect' : ''}">
                        <span class="option-label">${key}</span>
                        <span class="option-text">${value}</span>
                        ${key === question.correctAnswer ? 
                            '<i class="fas fa-check"></i>' : 
                            (key === userAnswer && key !== question.correctAnswer ? 
                                '<i class="fas fa-times"></i>' : '')}
                    </div>
                `).join('')}
            </div>
        `;
        
        reviewContainer.appendChild(questionDiv);
    });
} 